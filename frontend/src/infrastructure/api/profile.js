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
    name: profile.name || "",
    email: profile.email || "",
    education,
    skills: profile.skills || [],
    projects: profile.projects || [],
    internships: (profile.experience || []).map((entry) =>
      [entry.title, entry.description].filter(Boolean).join(" - "),
    ),
    certifications: (profile.certifications || []).map((entry) =>
      typeof entry === "string" ? entry : entry.title,
    ),
    preferred_roles: profile.role ? [profile.role] : [],
  };
}
