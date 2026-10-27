
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_KEY must be configured in .env"
    )

# Temporary diagnostics
print("Supabase URL:", repr(url))
print("Supabase key loaded:", bool(key))

supabase = create_client(url, key)
