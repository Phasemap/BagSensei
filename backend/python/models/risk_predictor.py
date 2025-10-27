from typing import Dict, Union

def calculate_risk_score(metrics: Dict[str, Union[int, float]]) -> float:
    """
    Compute a risk score based on weighted metrics.
    Each metric contributes according to predefined weights.
    Result is clamped between 0 and 100.

    Args:
        metrics: dictionary with keys like 'bot', 'sybil', 'whale', etc.

    Returns:
        float: final risk score between 0 and 100
    """
    weights = {
        "bot": 0.25,
        "sybil": 0.20,
        "whale": 0.15,
        "flashloan": 0.20,
        "sentiment": 0.20
    }

    total_score = 0.0
    for key, weight in weights.items():
        value = metrics.get(key, 0)
        if isinstance(value, (int, float)):
            total_score += weight * float(value)

    return round(min(total_score, 100.0), 2)


def batch_risk_scores(metrics_list: list[Dict[str, Union[int, float]]]) -> list[float]:
    """
    Compute risk scores for multiple metric sets.

    Args:
        metrics_list: list of metric dictionaries

    Returns:
        list[float]: list of computed risk scores
    """
    return [calculate_risk_score(m) for m in metrics_list]


def classify_risk(score: float) -> str:
    """
    Classify a numeric score into categories.

    Args:
        score: numeric risk score

    Returns:
        str: category label
    """
    if score < 30:
        return "Low"
    elif score < 60:
        return "Medium"
    elif score < 85:
        return "High"
    return "Critical"
