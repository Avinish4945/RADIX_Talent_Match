const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/+$/,
  "",
);

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
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const requestHeaders =
    body === undefined
      ? headers
      : { "Content-Type": "application/json", ...headers };
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const responseMessage = await response.text();
    throw new Error(
      `API request failed (${response.status}): ${responseMessage || response.statusText}`,
    );
  }

  if (response.status === 204) return null;
  return response.json();
}
