export function createDefaultProfile(user = null, savedProfile = null) {
  return {
    ...savedProfile,
    name: user?.name || savedProfile?.name || "Avinish Kumar",
    email: user?.email || savedProfile?.email || "avinish@example.com",
    education: savedProfile?.education || "B.Tech, Computer Science",
    university: savedProfile?.university || "XYZ University",
    year: savedProfile?.year || "2022 – 2026",
    skills: savedProfile?.skills || ["Java", "React", "SQL", "Node.js", "DSA"],
    role: savedProfile?.role || "Software Engineer",
    resumeName: savedProfile?.resumeName || "",
    analyzedJob: savedProfile?.analyzedJob || "Google · Software Engineer",
    projects: savedProfile?.projects || [],
    experience: savedProfile?.experience || [],
    certifications: savedProfile?.certifications || [],
  };
}

export const PROFILE_ENTRY_SECTIONS = [
  "projects",
  "experience",
  "certifications",
];
