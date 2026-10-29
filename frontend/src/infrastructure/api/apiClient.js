const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/+$/,
  "",
);

/**
 * Make a JSON or FormData API request from an application service or page.
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
      ? { ...headers }
      : { "Content-Type": "application/json", ...headers };

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const requestBody =
    body === undefined || isFormData
      ? body
      : typeof body === "string"
        ? body
        : JSON.stringify(body);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
    });
  } catch (netErr) {
    throw new Error(`Network error requesting ${path}: ${netErr.message}`);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let detail = data;
    if (typeof data === "string") {
      try {
        detail = JSON.parse(data);
      } catch {
        // Keep plain-text API errors readable.
      }
    }
    if (detail && typeof detail === "object") {
      detail = detail.detail || detail.message || response.statusText;
    }
    detail = detail || response.statusText || `HTTP ${response.status}`;
    throw new Error(`API request failed (${response.status}): ${detail}`);
  }

  return data;
}
