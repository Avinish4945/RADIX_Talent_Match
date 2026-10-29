import { apiRequest } from "./apiClient";

/**
 * Persist candidate profile to the backend database via POST /api/profiles.
 *
 * @param {Object} profile - Full candidate profile payload
 * @returns {Promise<{id: string, message: string}>}
 */
export async function saveProfileToApi(profile) {
  return await apiRequest("/profiles", {
    method: "POST",
    body: profile,
  });
}

/**
 * Fetch a specific profile by its database ID via GET /api/profiles/:id.
 *
 * @param {string} profileId
 * @returns {Promise<Object>}
 */
export async function getProfileByIdFromApi(profileId) {
  if (!profileId) return null;
  return await apiRequest(`/profiles/${profileId}`);
}
