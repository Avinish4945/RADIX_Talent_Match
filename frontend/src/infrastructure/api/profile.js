import { apiRequest } from "./apiClient";

export function createProfile(profile) {
  return apiRequest("/profiles", {
    method: "POST",
    body: profile,
  });
}

export function getProfile(profileId) {
  return apiRequest(`/profiles/${encodeURIComponent(profileId)}`);
}

export function updateProfile(profileId, profile) {
  return apiRequest(`/profiles/${encodeURIComponent(profileId)}`, {
    method: "PUT",
    body: profile,
  });
}

export function toProfilePayload(profile) {
  const education =
    profile.education || profile.university || profile.year
      ? [
          {
            degree: profile.education || "",
            university: profile.university || "",
            year: profile.year || "",
          },
        ]
      : [];

  return {
    id: profile.backendProfileId || profile.id || undefined,
    name: profile.name || "",
    email: profile.email || "",
    role: profile.role || "",
    education,
    skills: profile.skills || [],
    projects: profile.projects || [],
    internships: (profile.experience || []).map((entry) =>
      typeof entry === "string"
        ? entry
        : [entry.title, entry.description].filter(Boolean).join(" - "),
    ),
    experience: profile.experience || [],
    hackathons: profile.hackathons || [],
    certifications: (profile.certifications || []).map((entry) =>
      typeof entry === "string" ? entry : entry.title || JSON.stringify(entry),
    ),
    preferred_roles: profile.role
      ? [profile.role]
      : profile.preferred_roles || ["Software Engineer"],
    cv_file: profile.cv_file || null,
  };
}
