export function createDefaultProfile(user = null, savedProfile = null) {
  return {
    ...savedProfile,
    name: user?.name || savedProfile?.name || "",
    email: user?.email || savedProfile?.email || "",
    education: savedProfile?.education || "",
    university: savedProfile?.university || "",
    year: savedProfile?.year || "",
    skills: savedProfile?.skills || [],
    role: savedProfile?.role || "",
    resumeName: savedProfile?.resumeName || "",
    analyzedJob: savedProfile?.analyzedJob || "",
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
