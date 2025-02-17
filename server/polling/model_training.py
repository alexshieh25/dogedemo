import joblib
import pandas as pd
from polling.models import SurveyResult, VoteModel  # Import VoteModel as well
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
import pickle

def train_vote_model(poll):
    # Filter data for the specified poll.
    qs = SurveyResult.objects.filter(poll=poll).values(
        'candidate', 'age', 'gender', 'race', 'income', 'urbanity', 'education'
    )
    df = pd.DataFrame(list(qs))
    if df.empty:
        raise ValueError(f"No survey data available for poll: {poll}")

    X = df[['age', 'gender', 'race', 'income', 'urbanity', 'education']]
    y = df['candidate']

    # Convert candidate labels to categorical codes.
    y_cat = pd.Categorical(y)
    mapping = dict(enumerate(y_cat.categories))
    y_encoded = y_cat.codes
    
    categorical_features = ['age', 'gender', 'race', 'income', 'urbanity', 'education']
    preprocessor = ColumnTransformer(
        transformers=[
            # Set sparse=False to return a dense array.
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    # Create a pipeline with the preprocessor and an XGBoost classifier.
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', XGBClassifier(eval_metric='logloss'))
    ])

    # Fit using the numeric encoded target.
    clf.fit(X, y_encoded)

    # Store the mapping in the pipeline so that predictions can be decoded later.
    clf.mapping = mapping

    # Serialize the trained model to bytes.
    model_bytes = pickle.dumps(clf)

    # Save or update the model in the database.
    VoteModel.objects.update_or_create(
        poll=poll,
        defaults={'serialized_model': model_bytes}
    )

    return clf
