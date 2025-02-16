import joblib
import pandas as pd
from polling.models import SurveyResult
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from django.conf import settings
import os

def train_vote_model(poll):
    print("hi")
    # Filter data for the specified poll.
    qs = SurveyResult.objects.filter(poll=poll).values(
        'candidate', 'age', 'gender', 'race', 'income', 'urbanity', 'education'
    )
    df = pd.DataFrame(list(qs))
    if df.empty:
        print("oh no!")
        raise ValueError(f"No survey data available for poll: {poll}")

    X = df[['age', 'gender', 'race', 'income', 'urbanity', 'education']]
    y = df['candidate']

    categorical_features = ['age', 'gender', 'race', 'income', 'urbanity', 'education']
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(max_iter=500))
    ])
    
    clf.fit(X, y)

    # Create a poll-specific model filename.
    poll_slug = poll.replace(" ", "_").lower()
    model_path = os.path.join(settings.BASE_DIR, f'vote_prediction_model_{poll_slug}.pkl')
    joblib.dump(clf, model_path)
    return clf