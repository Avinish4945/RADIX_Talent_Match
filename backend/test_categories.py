
from app.utils.skill_categories import (
    SKILL_CATEGORIES,
    is_valid_category,
    is_valid_confidence
)

print("Total categories:", len(SKILL_CATEGORIES))
print("COD valid:", is_valid_category("COD"))
print("INVALID valid:", is_valid_category("INVALID"))
print("High confidence valid:", is_valid_confidence("high"))
