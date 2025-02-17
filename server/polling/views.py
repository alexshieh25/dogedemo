from rest_framework import viewsets
from .models import SurveyResult, VoteModel
from .serializers import SurveyResultSerializer
from polling.model_training import train_vote_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from polling.utils import run_ipf
import numpy as np
import shap
import pandas as pd
from django.conf import settings
import pickle

class SurveyResultViewSet(viewsets.ModelViewSet):
    serializer_class = SurveyResultSerializer

    def get_queryset(self):
        queryset = SurveyResult.objects.all()
        poll = self.request.query_params.get('poll', None)
        if poll is not None:
            queryset = queryset.filter(poll=poll)
        return queryset

class RunIPFView(APIView):
    def post(self, request, format=None):
        target_weights = request.data.get("target_weights")
        poll = request.data.get("poll")
        if not target_weights or not poll:
            return Response(
                {"error": "Both 'target_weights' and 'poll' must be provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        iterations, final_change, l1_errors = run_ipf(target_weights, poll)
        return Response({
            "message": f"IPF algorithm completed for {poll}",
            "iterations": iterations,
            "final_change": final_change,
            "l1_errors": l1_errors,
        }, status=status.HTTP_200_OK)

class TrainVoteModelView(APIView):
    def post(self, request, format=None):
        required_fields = ['poll']
        data = request.data

        for field in required_fields:
            if field not in data:
                return Response(
                    {"error": f"Missing field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        poll = data['poll']
        try:
            model = train_vote_model(poll)
            return Response({"message": "Model trained successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Training failed.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VotePredictionView(APIView):
    def post(self, request, format=None):
        required_fields = ['poll', 'age', 'gender', 'race', 'income', 'urbanity', 'education']
        data = request.data

        for field in required_fields:
            if field not in data:
                return Response(
                    {"error": f"Missing field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        poll = data['poll']
        input_data = {
            'age': data['age'],
            'gender': data['gender'],
            'race': data['race'],
            'income': data['income'],
            'urbanity': data['urbanity'],
            'education': data['education']
        }
        input_df = pd.DataFrame([input_data])
        
        # Get model from db
        try:
            vote_model = VoteModel.objects.get(poll=poll)
        except VoteModel.DoesNotExist:
            return Response(
                {"error": f"No model found for poll: {poll}. Please train the model first."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Deserialize model
        try:
            clf = pickle.loads(vote_model.serialized_model)
        except Exception as e:
            return Response(
                {"error": "Model could not be loaded", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Run prediction and probability distribution
        try:
            probabilities = clf.predict_proba(input_df)
            prediction = clf.predict(input_df)
            
            # Convert numeric prediction back to the candidate name using the mapping.
            if hasattr(clf, 'mapping'):
                predicted_candidate = clf.mapping.get(prediction[0], prediction[0])
            else:
                predicted_candidate = prediction[0]
            
            prob_dist = {}
            for i, prob in enumerate(probabilities[0]):
                candidate = clf.mapping.get(i, i) if hasattr(clf, 'mapping') else i
                prob_dist[candidate] = prob
        except Exception as e:
            return Response(
                {"error": "Error during prediction", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Compute SHAP values
        try:
            transformed_input = clf.named_steps['preprocessor'].transform(input_df)
            explainer = shap.TreeExplainer(clf.named_steps['classifier'])
            shap_values = explainer.shap_values(transformed_input)
            
            # For multi-class, shap_values is a list (one array per class). We select the one for the predicted class.
            if isinstance(shap_values, list):
                predicted_class = prediction[0]
                shap_vals = shap_values[predicted_class][0].tolist()
            else:
                shap_vals = shap_values[0].tolist()
            
            # Get feature names
            try:
                feature_names = clf.named_steps['preprocessor'].get_feature_names_out()
                shap_explanation = dict(zip(feature_names, shap_vals))
            except Exception:
                shap_explanation = shap_vals
        except Exception as e:
            shap_explanation = f"Error computing SHAP values: {str(e)}"

        # Return
        return Response(
            {
                "predicted_candidate": predicted_candidate,
                "probability_distribution": prob_dist,
                "shap_explanation": combine_onehot_shap(shap_explanation)
            },
            status=status.HTTP_200_OK
        )
    
def combine_onehot_shap(shap_explanation):
    """
    Combines one-hot-encoded features for SHAP for ease of explainibility
    """
    # List your original categorical features.
    features = ["age", "gender", "race", "income", "urbanity", "education"]
    combined = {}

    for feat in features:
        # Identify keys
        feat_keys = [k for k in shap_explanation if k.startswith(f"cat__{feat}_")]
        if feat_keys:
            total = 0
            for k in feat_keys:
                val = shap_explanation[k]
                if isinstance(val, list):
                    total += sum(val)
                else:
                    total += val
            combined[feat] = total

    # Sort in decreasing order of magnitude
    sorted_combined = dict(sorted(combined.items(), key=lambda item: abs(item[1]), reverse=True))
    
    return sorted_combined
