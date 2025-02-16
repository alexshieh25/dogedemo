from rest_framework import serializers
from .models import SurveyResult

class SurveyResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyResult
        fields = '__all__'