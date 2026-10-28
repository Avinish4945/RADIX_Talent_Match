from app.schemas.profile import CandidateProfile
from app.services.supabase_client import supabase

def save_profile(profile: CandidateProfile):
    # Save the pydantic object as JSON inside the 'profile_data' column
    response = supabase.table("profiles").insert({"profile_data": profile.model_dump()}).execute()
    
    if response.data:
        return response.data[0]["id"]
    raise Exception("Failed to save profile")

def get_profile_by_id(profile_id: str):
    response = supabase.table("profiles").select("profile_data").eq("id", profile_id).execute()
    
    if response.data:
        return response.data[0]["profile_data"]
    return None