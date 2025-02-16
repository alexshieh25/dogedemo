# polling/models.py
from django.db import models

class SurveyResult(models.Model):
    poll = models.CharField(max_length=100)
    candidate = models.CharField(max_length=100)
    age = models.CharField(max_length=20)
    gender = models.CharField(max_length=20)
    race = models.CharField(max_length=50)
    income = models.CharField(max_length=20)
    urbanity = models.CharField(max_length=20)
    education = models.CharField(max_length=50)
    weight = models.FloatField(default=1.0)  # Default weight is 1.0
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.poll} - {self.candidate} ({self.id})"

class VoteModel(models.Model):
    poll = models.CharField(max_length=255, unique=True)
    serialized_model = models.BinaryField()

    def __str__(self):
        return self.poll