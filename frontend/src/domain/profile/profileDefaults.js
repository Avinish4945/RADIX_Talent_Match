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
    hackathons: savedProfile?.hackathons || [],
    certifications: savedProfile?.certifications || [],
    cv_file: savedProfile?.cv_file || null,
  };
}

export const PROFILE_ENTRY_SECTIONS = [
  "projects",
  "experience",
  "hackathons",
  "certifications",
];
