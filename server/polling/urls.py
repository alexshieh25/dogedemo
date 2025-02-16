# polling/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import SurveyResultViewSet, RunIPFView, TrainVoteModelView, VotePredictionView

router = DefaultRouter()
router.register(r'survey-results', SurveyResultViewSet, basename='surveyresult')

urlpatterns = [
    path('train-vote-model/', TrainVoteModelView.as_view(), name='train-vote-model'),
    path('run-ipf/', RunIPFView.as_view(), name='run-ipf'),
    path('predict-vote/', VotePredictionView.as_view(), name='predict-vote'),
    path('', include(router.urls)),
]