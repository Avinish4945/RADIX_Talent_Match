import os
from dotenv import load_dotenv

# This line loads the variables from your .env file into the system
load_dotenv() 

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
# Use relative imports here too!
from ...schemas.common import ResumeExtraction
from .prompts import SYSTEM_PROMPT

# Ensure you have OPENAI_API_KEY in your .env
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# Bind the LLM to force output into our Pydantic Schema
structured_llm = llm.with_structured_output(ResumeExtraction)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "Here is the resume text:\n\n{resume_text}")
])

chain = prompt | structured_llm

def parse_resume_text(raw_text: str, filename: str) -> dict:
    """Runs the resume text through the LLM and returns the structured JSON."""
    try:
        result: ResumeExtraction = chain.invoke({"resume_text": raw_text})
        
        # Inject the filename since the LLM doesn't know it
        final_json = result.model_dump()
        final_json["source_file"] = filename
        
        return final_json
    except Exception as e:
        print(f"Error parsing resume with LLM: {e}")
        raise e