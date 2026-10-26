RADIX Talent Match
RADIX Talent Match is a hackathon project designed to help candidates understand how ready they are for a specific job. It brings together five modules:
1.	JD Analytics — extracts required skills and technologies from a job description.
2.	Resume Parsing — extracts skills and technical information from a resume.
3.	Profile Builder — builds a candidate profile beyond their resume.
4.	Talent Check — compares a candidate's profile against a company's expectations.
5.	Skill Matching — compares a candidate's skills with a specific job description and identifies gaps.
This repository contains a React frontend and a Python FastAPI backend.
Current JD Analytics progress: The backend setup, local PDF/DOCX upload, and basic text extraction have been implemented. LLM-based skill extraction and mapping to the RADIX skill categories are still in progress.

Contents
·	Prerequisites
·	Clone the repository
·	Project structure
·	Backend setup
·	Frontend setup
·	Test the JD Analytics API
·	API endpoints
·	Environment variables
·	Git and uploaded files
·	Troubleshooting
·	Development status
Prerequisites
Install these tools before starting:
·	Git — to clone the repository.
·	Python 3.10 or newer — for FastAPI and the document parser.
·	Node.js LTS and npm — for the React frontend.
·	Postman (optional) — to test API requests.
·	A code editor such as Visual Studio Code.
Check your installations:
git --version
python3 --version
node --version
npm --version

On Windows, the Python command may be python instead of python3.
Clone the repository
Replace the URL below with the actual GitHub repository URL:
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>

Open this folder in VS Code. Commands below assume the repository contains frontend/ and backend/ directories.
Project structure
RADIX-Talent-Match/
├── .gitignore
├── README.md
├── frontend/
│   ├── package.json
│   └── src/
└── backend/
    ├── app/
    │   ├── main.py
    │   ├── routes/
    │   │   └── jd_routes.py
    │   ├── services/
    │   │   ├── document_parser.py
    │   │   └── jd_analyzer.py
    │   └── utils/
    │       └── skill_categories.py
    ├── uploads/             # Created locally; not committed to Git
    └── requirements.txt

The exact structure may change as development continues. Keep the repository's actual file names aligned with this guide.
Backend setup
1. Open a terminal in the backend directory
cd backend

2. Create and activate a virtual environment
Linux / macOS:
python3 -m venv venv
source venv/bin/activate

Windows PowerShell:
python -m venv venv
.\venv\Scripts\Activate.ps1

Windows Command Prompt:
python -m venv venv
venv\Scripts\activate.bat

If virtual-environment creation fails on Ubuntu/Debian, install the venv package for your Python version. For example:
sudo apt install python3-venv

3. Install Python dependencies
If requirements.txt is included in the repository:
pip install -r requirements.txt

If it is not present yet, install the current JD Analytics dependencies:
pip install fastapi uvicorn python-multipart pymupdf python-docx python-dotenv

After updating dependencies, maintain requirements.txt so other developers can reproduce the environment:
pip freeze > requirements.txt

4. Create the uploads directory
From the backend/ directory:
mkdir -p uploads

On Windows PowerShell, use:
New-Item -ItemType Directory -Force uploads

The backend may also create this directory automatically. Uploaded documents are stored locally for development and should not be committed to Git.
5. Start the backend
From the backend/ directory:
uvicorn app.main:app --reload

By default, the API runs at:
·	API home: http://127.0.0.1:8000/
·	Health check: http://127.0.0.1:8000/api/health
·	Interactive API documentation: http://127.0.0.1:8000/docs
Keep this terminal open while using the API. Press Ctrl+C to stop the server.
Frontend setup
Open a second terminal at the repository root, then run:
cd frontend
npm install
npm run dev

Vite will print the local frontend URL in the terminal, often http://localhost:5173/.
If the frontend uses an API base URL, configure it to point to the backend, for example:
VITE_API_URL=http://127.0.0.1:8000

Create the frontend's local .env file only if the frontend code expects VITE_API_URL. Restart the Vite development server after changing environment variables.
Vite exposes variables prefixed with VITE_ to browser code. Never put private API keys or other secrets in a VITE_ variable.
Test the JD Analytics API
Make sure the backend server is running first.
1. Test the home route
Send a GET request to:
http://127.0.0.1:8000/

Expected response:
{
  "message": "JD Analytics Backend is running"
}

The exact message depends on the current app/main.py implementation.
2. Test the health endpoint
Send a GET request to:
http://127.0.0.1:8000/api/health

Expected response:
{
  "status": "healthy"
}

3. Upload a job description
In Postman, create a request with:
·	Method: POST
·	URL: http://127.0.0.1:8000/api/jd/upload
·	Select Body → form-data
·	Add a key named file
·	Change its field type from Text to File
·	Select a .pdf or .docx file and click Send
The endpoint should return file metadata and confirm that the file was saved locally. The implementation currently limits files to 10 MB.
4. Extract text from a job description
Create another Postman request:
·	Method: POST
·	URL: http://127.0.0.1:8000/api/jd/extract
·	Select Body → form-data
·	Add a key named file, set its type to File, and select a text-based PDF or DOCX
·	Click Send
The response should include extracted_text containing text read from the document.
The extraction endpoint saves a file for processing and deletes that copy if extraction fails. Successful extraction files remain in local storage with the current implementation.
Note: Scanned PDFs may require OCR. Text extraction from DOCX tables may need additional handling.
API endpoints
Method	Endpoint	Purpose
GET	/	API home
GET	/api/health	Health check
GET	/api/jd/	Check that the JD router is working
POST	/api/jd/upload	Save a PDF/DOCX locally
POST	/api/jd/extract	Save a PDF/DOCX and extract its text

Check /docs for the routes actually registered by the current version of the backend.
Environment variables
Keep secrets and local configuration in .env files that are excluded from Git.
For example, when an LLM provider is integrated, the backend may need a variable such as:
GEMINI_API_KEY=replace_with_your_own_key

This is an example only; create the variable required by the provider and code you actually use. Do not commit real keys. If you later add a database or cloud storage, document the required variable names in .env.example with placeholder values.
Git and uploaded files
The root .gitignore should exclude generated files and secrets, including:
frontend/node_modules/
frontend/dist/
backend/venv/
**/__pycache__/
*.py[cod]
.env
.env.*
!.env.example
backend/uploads/

Do not commit:
·	.env files or API keys
·	node_modules/
·	Python virtual environments
·	Uploaded job descriptions or resumes
·	Generated build output
If a secret is accidentally committed, remove it from tracking and rotate the secret. Adding it to .gitignore does not remove it from existing Git history.
Troubleshooting
uvicorn: command not found
Activate the backend virtual environment and install dependencies:
pip install fastapi uvicorn

Then run:
python -m uvicorn app.main:app --reload

ModuleNotFoundError: No module named 'multipart'
Install the required package inside the activated virtual environment:
pip install python-multipart

ModuleNotFoundError for pymupdf or docx
Install the relevant packages:
pip install pymupdf python-docx

The python-docx package is imported in Python as docx.
Port 8000 is already in use
Run the backend on another port:
uvicorn app.main:app --reload --port 8001

Update the frontend API URL and Postman requests to use port 8001.
Frontend requests fail because of CORS
Ensure the FastAPI application allows the frontend's local origin, commonly http://localhost:5173. Configure CORS in app/main.py for the required origins rather than disabling browser security.
The API returns no text from a PDF
The PDF may be scanned or image-based. OCR is not currently included. Try a text-based PDF or add an OCR step.
The uploaded file is missing
Confirm that the backend is running, check the backend/uploads/ directory, and review the API response and terminal logs.
Development status
·	FastAPI app and routes
·	Local PDF/DOCX upload
·	Basic PDF/DOCX text extraction
·	LLM-based JD skill extraction
·	Validation against the shared RADIX skill schema
·	Integration with the Skill Matching module
·	Persistent database integration, if required
The shared RADIX skill contract specifies skill_name, category_code, evidence, and confidence for each skill. The category codes are COD, DSA, OOD, APTI, COMM, AI, CLOUD, SQL, SWE, SYSD, NETW, OS, and OTHER. Coordinate any schema changes with the rest of the team before integrating modules.

Contributing
1.	Create a feature branch.
2.	Make and test your changes locally.
3.	Commit only source code and necessary configuration templates.
4.	Push the branch and open a pull request for review.
Example:
git checkout -b feature/your-feature
git add .
git status
git commit -m "Describe your change"
git push -u origin feature/your-feature

License
Add the license selected by your team before distributing this project.
