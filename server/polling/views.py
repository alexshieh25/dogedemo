from rest_framework import viewsets
from .models import SurveyResult
from .serializers import SurveyResultSerializer
from polling.model_training import train_vote_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from polling.utils import run_ipf
import os
import joblib
import pandas as pd
from django.conf import settings

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
        iterations, final_change = run_ipf(target_weights, poll)
        return Response({
            "message": f"IPF algorithm completed for {poll}",
            "iterations": iterations,
            "final_change": final_change,
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
        # Expect poll in the request data along with demographics.
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
        
        poll_slug = poll.replace(" ", "_").lower()
        model_path = os.path.join(settings.BASE_DIR, f'vote_prediction_model_{poll_slug}.pkl')
        
        if not os.path.exists(model_path):
            return Response(
                {"error": f"No model found for poll: {poll}. Please train the model first."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            clf = joblib.load(model_path)
        except Exception as e:
            return Response(
                {"error": "Model could not be loaded", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            prediction = clf.predict(input_df)
        except Exception as e:
            return Response(
                {"error": "Error during prediction", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {"predicted_candidate": prediction[0]},
            status=status.HTTP_200_OK
        )