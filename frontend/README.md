# Radix Talent Match

A front-end-only career profile and job-matching app built with React, React Router's data router APIs, and Redux Toolkit. The app uses local demo data and browser storage until backend services are connected.

## Four-layer architecture

```text
src/
├── presentation/       # React UI, routes, layouts, and styles
├── application/        # App state and user-facing use cases
├── domain/             # Core profile rules and defaults
└── infrastructure/     # Browser storage, repositories, and demo data
```

### Layer responsibilities

- **Presentation**: renders UI and handles user input. Routes call application services; components dispatch application actions.
- **Application**: coordinates app behavior and Redux state. It depends on domain rules and receives infrastructure adapters at startup.
- **Domain**: contains business concepts and rules without React, Redux, browser APIs, or network dependencies.
- **Infrastructure**: implements external adapters such as browser storage and demo repositories. Replace these with API-backed adapters when connecting a backend.

The startup module in `presentation/main.jsx` is the composition root: it creates infrastructure adapters and injects them into application services and the Redux store. Keep dependencies flowing inward by passing adapters into application factories rather than importing browser APIs into domain or application code.

### Current source map

```text
src/
├── application/
│   ├── session/sessionService.js
│   └── store/
│       ├── appSlice.js
│       ├── configureStore.js
│       └── persistenceMiddleware.js
├── domain/
│   └── profile/profileDefaults.js
├── infrastructure/
│   ├── api/apiClient.js
│   ├── demo/demoData.js
│   ├── repositories/sessionRepository.js
│   └── storage/browserStorage.js
└── presentation/
    ├── components/shared/PagePrimitives.jsx
    ├── layouts/AppShell.jsx
    ├── main.jsx
    ├── pages/
    │   ├── auth/AuthPage.jsx
    │   └── workspace/
    │       ├── dashboard/Dashboard.jsx
    │       ├── job-analytics/JobAnalytics.jsx
    │       ├── profile-builder/ProfileBuilder.jsx
    │       ├── resume-parsing/ResumeParsing.jsx
    │       ├── skill-matching/SkillMatching.jsx
    │       └── talent-check/TalentCheck.jsx
    ├── routes/router.jsx
    └── styles/styles.css
```

## Adding a feature

1. Add domain rules or entities in `src/domain/<feature>/` only when they represent core business behavior.
2. Add feature state/actions in `src/application/store/` or an application service in `src/application/<feature>/`.
3. Add API, storage, or demo implementations in `src/infrastructure/`; inject them from `presentation/main.jsx`.
4. Add the page under `src/presentation/pages/<feature>/`, then register its route in `src/presentation/routes/router.jsx`.
5. Keep reusable layout and visual primitives in `src/presentation/layouts/` and `src/presentation/components/`.

## Run locally

```sh
npm install
npm run dev
```

Use any valid email address and a password with at least six characters to enter demo mode. Signup also lets you add education, preferred role, skills, projects, experience, and certifications; these profile details can be edited later from the account menu. The demo session and profile are stored in browser local storage.

## Routes

- `/login`, `/signup` — demo authentication
- `/dashboard` — career overview
- `/analytics` — backend-backed job description analysis
- `/resume` — resume upload and simulated extraction UI
- `/profile` — editable profile, available from the account menu
- `/talent-check` — backend-backed readiness assessment
- `/matching` — skill-based job matches

The application routes use React Router data loaders. Talent Check uses the FastAPI backend to load configured companies and candidates, submit assessments, and display readiness, coverage, skill gaps, and unknown levels. Job Analytics uploads PDF/DOCX files to the JD analysis endpoint, displays extracted skills and evidence, and loads saved analyses from the backend after refresh. Select a saved job description to load its role and skills. Resume parsing and matching remain UI simulations.

### Calling the API

Requests default to `/api`. The Vite development server proxies `/api` to `http://127.0.0.1:8000`, so start the FastAPI backend from `backend/` with `python -m uvicorn app.main:app --reload` before running the frontend.

To use a different backend, set `VITE_API_BASE_URL` in a local `.env` file to its API root (for example, `VITE_API_BASE_URL=https://localhost:5001/api`).

Import `apiRequest` from `src/infrastructure/api/apiClient.js` in an application service, then call it with the endpoint path:

```js
import { apiRequest } from "../../infrastructure/api/apiClient";

export function getProfile() {
  return apiRequest("/profile");
}

export function saveProfile(profile) {
  return apiRequest("/profile", { method: "PUT", body: profile });
}
```

The helper sends and receives JSON, accepts standard `fetch` options such as `signal` and `headers`, returns `null` for `204 No Content`, and throws an error for non-success responses. Keep endpoint-specific functions in `src/application/<feature>/` or `src/infrastructure/` instead of making network calls directly from JSX.

Job Analytics keeps JD-specific endpoint functions in `src/presentation/pages/workspace/job-analytics/jdApi.js`. It uses `POST /jd/analyze` with a multipart `file` field; the backend accepts PDF and DOCX files up to 10 MB.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run format` — format source files
- `npm run format:check` — verify source formatting
