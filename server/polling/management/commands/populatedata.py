import random
from django.core.management.base import BaseCommand
from polling.models import SurveyResult
from faker import Faker

class Command(BaseCommand):
    help = "Populate dummy data with large discrepancies between demographic groups"

    def handle(self, *args, **options):
        fake = Faker()
        polls = ['Ohio Senate Primary', 'Florida Senate Primary', 'New Hampshire Senate Primary']
        num_responses = 1000

        # Clear existing data
        self.stdout.write("Clearing existing survey responses...")
        SurveyResult.objects.all().delete()

        # Define demographic probability distributions for each poll.
        demographics = {
            'Ohio Senate Primary': {
                'age': (['18-29', '30-44', '45-64', '65+'], [0.5, 0.3, 0.15, 0.05]),
                'gender': (['Male', 'Female'], [0.4, 0.6]),
                'race': (['White', 'Black', 'Hispanic', 'Asian'], [0.7, 0.1, 0.15, 0.05]),
                'income': (['<50k', '50-100k', '>100k'], [0.2, 0.5, 0.3]),
                'urbanity': (['rural', 'urban', 'suburban'], [0.3, 0.5, 0.2]),
                'education': (['college degree', 'no college degree'], [0.6, 0.4]),
            },
            'Florida Senate Primary': {
                'age': (['18-29', '30-44', '45-64', '65+'], [0.3, 0.4, 0.2, 0.1]),
                'gender': (['Male', 'Female'], [0.45, 0.55]),
                'race': (['White', 'Black', 'Hispanic', 'Asian'], [0.5, 0.2, 0.25, 0.05]),
                'income': (['<50k', '50-100k', '>100k'], [0.3, 0.4, 0.3]),
                'urbanity': (['rural', 'urban', 'suburban'], [0.2, 0.6, 0.2]),
                'education': (['college degree', 'no college degree'], [0.55, 0.45]),
            },
            'New Hampshire Senate Primary': {
                'age': (['18-29', '30-44', '45-64', '65+'], [0.2, 0.35, 0.3, 0.15]),
                'gender': (['Male', 'Female'], [0.5, 0.5]),
                'race': (['White', 'Black', 'Hispanic', 'Asian'], [0.8, 0.05, 0.1, 0.05]),
                'income': (['<50k', '50-100k', '>100k'], [0.15, 0.5, 0.35]),
                'urbanity': (['rural', 'urban', 'suburban'], [0.4, 0.4, 0.2]),
                'education': (['college degree', 'no college degree'], [0.65, 0.35]),
            },
        }

        # Only two candidates now
        candidate_options = ['Candidate A', 'Candidate B']

        def assign_candidate(poll, age, gender, race, income, urbanity, education):
            # Bias candidate selection based on some demographics.
            if poll == 'Ohio Senate Primary':
                if age == '18-29':
                    return random.choices(candidate_options, weights=[70, 30])[0]
                elif age == '30-44':
                    return random.choices(candidate_options, weights=[50, 50])[0]
                elif age == '45-64':
                    return random.choices(candidate_options, weights=[30, 70])[0]
                else:
                    return random.choices(candidate_options, weights=[20, 80])[0]
            elif poll == 'Florida Senate Primary':
                if gender == 'Female':
                    return random.choices(candidate_options, weights=[20, 80])[0]
                else:
                    return random.choices(candidate_options, weights=[30, 70])[0]
            elif poll == 'New Hampshire Senate Primary':
                if education == 'college degree':
                    return random.choices(candidate_options, weights=[60, 40])[0]
                else:
                    return random.choices(candidate_options, weights=[25, 75])[0]
            return random.choice(candidate_options)

        for poll in polls:
            self.stdout.write(f"Generating {num_responses} responses for {poll}")
            for i in range(num_responses):
                age_choices, age_weights = demographics[poll]['age']
                gender_choices, gender_weights = demographics[poll]['gender']
                race_choices, race_weights = demographics[poll]['race']
                income_choices, income_weights = demographics[poll]['income']
                urbanity_choices, urbanity_weights = demographics[poll]['urbanity']
                education_choices, education_weights = demographics[poll]['education']

                age = random.choices(age_choices, weights=age_weights)[0]
                gender = random.choices(gender_choices, weights=gender_weights)[0]
                race = random.choices(race_choices, weights=race_weights)[0]
                income = random.choices(income_choices, weights=income_weights)[0]
                urbanity = random.choices(urbanity_choices, weights=urbanity_weights)[0]
                education = random.choices(education_choices, weights=education_weights)[0]

                candidate = assign_candidate(poll, age, gender, race, income, urbanity, education)

                SurveyResult.objects.create(
                    poll=poll,
                    candidate=candidate,
                    age=age,
                    gender=gender,
                    race=race,
                    income=income,
                    urbanity=urbanity,
                    education=education,
                    weight=1.0,
                )
            self.stdout.write(self.style.SUCCESS(f"Created {num_responses} responses for {poll}"))

        self.stdout.write(self.style.SUCCESS("Dummy data population complete."))