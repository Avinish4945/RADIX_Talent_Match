import { apiRequest } from "../../../../infrastructure/api/apiClient";

function createFileForm(file) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

export function getJobDescriptions({
  company,
  role,
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (company) params.set("company", company);
  if (role) params.set("role", role);
  return apiRequest(`/jd/?${params.toString()}`);
}

export function uploadJobDescription(file) {
  return apiRequest("/jd/upload", {
    method: "POST",
    body: createFileForm(file),
  });
}

export function extractJobDescription(file) {
  return apiRequest("/jd/extract", {
    method: "POST",
    body: createFileForm(file),
  });
}

export function analyzeJobDescription(file) {
  return apiRequest("/jd/analyze", {
    method: "POST",
    body: createFileForm(file),
  });
}

export function getJobDescription(id) {
  return apiRequest(`/jd/${encodeURIComponent(id)}`);
}

export function deleteJobDescription(id) {
  return apiRequest(`/jd/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
