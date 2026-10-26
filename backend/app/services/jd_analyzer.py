

import json
import os

from dotenv import load_dotenv
from groq import Groq

from app.utils.skill_categories import SKILL_CATEGORIES

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "openai/gpt-oss-120b"


def analyze_jd_text(text: str) -> dict:
    if not os.getenv("GROQ_API_KEY"):
        raise RuntimeError("GROQ_API_KEY is missing from .env")

    prompt = f"""
Analyze the following job description.

Extract:
1. Company name, if explicitly available.
2. Job role/title.
3. Every relevant skill and technology required by the JD.
4. A short evidence quote or reason from the JD for each skill.
5. Confidence: high, medium, or low.

Assign exactly one category_code to each skill.

Allowed category codes:
{json.dumps(SKILL_CATEGORIES)}

1. Extract skills only when supported by the supplied job description.
2. Focus primarily on the Key Responsibilities and
   What We're Looking For sections when they exist.
3. Map each skill to the most appropriate RADIX category:
   COD, DSA, OOD, APTI, COMM, AI, CLOUD, SQL,
   SWE, SYSD, NETW, OS, or OTHER.
4. Do not classify every quantitative or analytical skill
   as APTI. Use APTI for aptitude and reasoning skills
   as defined by the project.
5. Use OTHER only when no existing category fits well.
6. Return one concise evidence statement per skill.
   Prefer a short, accurate quotation from the JD.
   Do not merge multiple unrelated sentences.
7. Confidence means confidence that the skill is required:
   - high: explicitly required or clearly stated
   - medium: reasonably implied by responsibilities
   - low: weakly implied or uncertain
8. Do not invent skills, tools, qualifications, or evidence.
9. Do not duplicate the same skill under different names.
10. Preserve the required JSON schema and valid category codes.
Return only valid JSON with this structure:
{{
  "company": null,
  "role": "Job title",
  "skills": [
    {{
      "skill_name": "Python",
      "category_code": "COD",
      "evidence": "Evidence from the JD",
      "confidence": "high"
    }}
  ]
}}

Do not invent requirements that are absent from the JD.
Use null when the company or role cannot be identified.

JOB DESCRIPTION:
{text}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise job description "
                    "skill extraction assistant. Follow "
                    "the requested JSON format."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )

    result = json.loads(
        response.choices[0].message.content
    )

    # Validate the model's response before returning it.
    if not isinstance(result.get("skills"), list):
        raise ValueError("AI response has no valid skills list")

    allowed_codes = set(SKILL_CATEGORIES)
    allowed_confidence = {"high", "medium", "low"}

    for skill in result["skills"]:
        if skill.get("category_code") not in allowed_codes:
            raise ValueError("AI returned an invalid category code")

        if skill.get("confidence") not in allowed_confidence:
            raise ValueError("AI returned invalid confidence")

        for field in ("skill_name", "evidence"):
            if not isinstance(skill.get(field), str):
                raise ValueError(f"Invalid skill field: {field}")

    return result
