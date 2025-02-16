import joblib
import pandas as pd
from polling.models import SurveyResult, VoteModel  # Import VoteModel as well
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
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
    print("hello")
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
    
    print("hello")

    clf.fit(X, y)

    print("hello")

    # Serialize the trained model to bytes.
    model_bytes = pickle.dumps(clf)

    # Save or update the model in the database.
    VoteModel.objects.update_or_create(
        poll=poll,
        defaults={'serialized_model': model_bytes}
    )

    print("hello")

    return clf
