import { createBrowserRouter, redirect } from "react-router-dom";
import { AuthPage } from "../pages/auth/AuthPage";
import { AppShell } from "../layouts/AppShell";
import { Dashboard } from "../pages/workspace/dashboard/Dashboard";
import { JobAnalytics } from "../pages/workspace/job-analytics/JobAnalytics";
import { ResumeParsing } from "../pages/workspace/resume-parsing/ResumeParsing";
import { ProfileBuilder } from "../pages/workspace/profile-builder/ProfileBuilder";
import { TalentCheck } from "../pages/workspace/talent-check/TalentCheck";
import { SkillMatching } from "../pages/workspace/skill-matching/SkillMatching";

export function createAppRouter({ isAuthenticated }) {
  function requireAuth() {
    if (!isAuthenticated()) return redirect("/login");
    return null;
  }

  return createBrowserRouter(
    [
      {
        path: "/login",
        element: <AuthPage />,
      },
      {
        path: "/signup",
        element: <AuthPage initialMode="signup" />,
      },
      {
        path: "/",
        loader: requireAuth,
        element: <AppShell />,
        children: [
          { index: true, loader: () => redirect("/dashboard") },
          { path: "dashboard", element: <Dashboard /> },
          { path: "analytics", element: <JobAnalytics /> },
          { path: "resume", element: <ResumeParsing /> },
          { path: "profile", element: <ProfileBuilder /> },
          {
            path: "talent-check",
            element: <TalentCheck />,
          },
          { path: "matching", element: <SkillMatching /> },
        ],
      },
    ],
    {
      future: { v7_startTransition: true },
    },
  );
}
