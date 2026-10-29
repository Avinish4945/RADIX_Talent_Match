import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/+$/,
  "",
);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Make a JSON API request from an application service or page.
 *
 * Examples:
 *   const profile = await apiRequest("/profile");
 *   const savedProfile = await apiRequest("/profile", {
 *     method: "PUT",
 *     body: profile,
 *   });
 */
export async function apiRequest(
  path,
  { method = "GET", body, headers = {}, signal } = {},
) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders =
    body === undefined || isFormData
      ? headers
      : { "Content-Type": "application/json", ...headers };
  try {
    const response = await axiosClient.request({
      url: path.startsWith("/") ? path : `/${path}`,
      method,
      headers: requestHeaders,
      data: body,
      signal,
    });

    if (response.status === 204) return null;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { status, statusText, data } = error.response;
      let detail = data;
      if (typeof data === "string") {
        try {
          detail = JSON.parse(data);
        } catch {
          // Keep plain-text API errors readable.
        }
      }
      if (detail && typeof detail === "object") {
        detail = detail.detail || detail.message || statusText;
      }
      detail = detail || statusText || error.message;
      throw new Error(`API request failed (${status}): ${detail}`);
    }
    throw error;
  }
}
