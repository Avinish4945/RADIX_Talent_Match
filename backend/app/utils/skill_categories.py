
SKILL_CATEGORIES = {
    "COD": "Coding",
    "DSA": "Data Structures & Algorithms",
    "OOD": "Object-Oriented Design",
    "APTI": "Aptitude",
    "COMM": "Communication",
    "AI": "AI",
    "CLOUD": "Cloud",
    "SQL": "SQL",
    "SWE": "Software Engineering",
    "SYSD": "System Design",
    "NETW": "Networking",
    "OS": "Operating Systems",
    "OTHER": "Other"
}

CONFIDENCE_LEVELS = {"high", "medium", "low"}


def is_valid_category(category_code: str) -> bool:
    return category_code in SKILL_CATEGORIES


def is_valid_confidence(confidence: str) -> bool:
    return confidence in CONFIDENCE_LEVELS
