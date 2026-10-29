import { apiRequest } from "./apiClient";

export function runSkillMatch({
  candidateSkills,
  jdSkills,
  candidateId,
  jdSourceFile,
  company,
  role,
}) {
  return apiRequest("/skill-match", {
    method: "POST",
    body: {
      candidate_skills: candidateSkills || [],
      jd_skills: jdSkills || [],
      candidate_id: candidateId || null,
      jd_source_file: jdSourceFile || null,
      company: company || null,
      role: role || null,
    },
  });
}
