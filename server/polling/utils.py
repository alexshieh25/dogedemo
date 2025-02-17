from polling.models import SurveyResult

def run_ipf(target_weights, poll, tolerance=0.001, max_iterations=100):
    """
    Runs IPF on responses for a given survey (poll) and returns the number
    of iterations, the final maximum change, and a list of L1 norm errors per iteration.
    
    target_weights: dict of proportions for each demographic (they should sum to 1 per dimension).
    poll: the poll name for which to run IPF.
    """
    # Filter responses for the given poll
    responses = list(SurveyResult.objects.filter(poll=poll))
    if not responses:
        return 0, 0, []  # Nothing to do if no responses

    total_weight = sum(response.weight for response in responses)

    for response in responses:
        response.original_weight = response.weight

    target_totals = {}
    for dim, proportions in target_weights.items():
        target_totals[dim] = {cat: prop * total_weight for cat, prop in proportions.items()}

    iteration = 0
    l1_errors = []

    while iteration < max_iterations:
        max_diff = 0
        # For each dimension, adjust weights.
        for dim, targets in target_totals.items():
            current_totals = {cat: 0 for cat in targets.keys()}
            for response in responses:
                cat = getattr(response, dim)
                current_totals[cat] += response.weight

            for response in responses:
                cat = getattr(response, dim)
                if current_totals[cat] > 0:
                    multiplier = targets[cat] / current_totals[cat]
                    old_weight = response.weight
                    response.weight *= multiplier
                    diff = abs(response.weight - old_weight)
                    if diff > max_diff:
                        max_diff = diff

        # Compute error
        l1_error = 0
        for dim, targets in target_totals.items():
            current_totals = {cat: 0 for cat in targets.keys()}
            for response in responses:
                cat = getattr(response, dim)
                current_totals[cat] += response.weight
            for cat, target in targets.items():
                l1_error += abs(current_totals[cat] - target)
        l1_errors.append(l1_error)

        if max_diff < tolerance:
            break
        iteration += 1

    # Bulk update weights
    SurveyResult.objects.bulk_update(responses, ['weight'])

    return iteration, max_diff, l1_errors
