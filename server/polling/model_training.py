import pandas as pd
from polling.models import SurveyResult, VoteModel
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
import pickle

def train_vote_model(poll):
    # Filter data
    qs = SurveyResult.objects.filter(poll=poll).values(
        'candidate', 'age', 'gender', 'race', 'income', 'urbanity', 'education'
    )
    df = pd.DataFrame(list(qs))
    if df.empty:
        raise ValueError(f"No survey data available for poll: {poll}")

    X = df[['age', 'gender', 'race', 'income', 'urbanity', 'education']]
    y = df['candidate']

    # Convert candidate labels to categorical codes
    y_cat = pd.Categorical(y)
    mapping = dict(enumerate(y_cat.categories))
    y_encoded = y_cat.codes
    
    categorical_features = ['age', 'gender', 'race', 'income', 'urbanity', 'education']
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', XGBClassifier(eval_metric='logloss'))
    ])
    clf.fit(X, y_encoded)

    # Store mapping
    clf.mapping = mapping

    model_bytes = pickle.dumps(clf)

    # update db
    VoteModel.objects.update_or_create(
        poll=poll,
        defaults={'serialized_model': model_bytes}
    )

    return clf
