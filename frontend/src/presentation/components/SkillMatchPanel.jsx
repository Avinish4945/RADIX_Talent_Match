import { useState } from "react";
import { runSkillMatch } from "../../infrastructure/api/skillMatch";

const styles = {
  card: { border: "1px solid #ddd", borderRadius: 8, padding: 16, background: "#fff", color: "#222" },
  title: { margin: "0 0 8px", fontSize: 18 },
  button: { padding: "8px 16px", borderRadius: 6, border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer" },
  error: { color: "#b91c1c", marginTop: 8 },
  score: { fontSize: 32, fontWeight: 700, margin: "12px 0 4px" },
  section: { marginTop: 12 },
  heading: { fontSize: 14, fontWeight: 600, margin: "0 0 4px" },
  list: { margin: 0, paddingLeft: 18, fontSize: 14 },
  muted: { color: "#666", fontSize: 12, marginTop: 12 },
};

export default function SkillMatchPanel({
  candidateSkills = [],
  jdSkills = [],
  candidateId,
  jdSourceFile,
  company,
  role,
}) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    setLoading(true);
    setError("");
    try {
      const data = await runSkillMatch({
        candidateSkills,
        jdSkills,
        candidateId,
        jdSourceFile,
        company,
        role,
      });
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Skill Match</h3>
      <button style={styles.button} onClick={handleRun} disabled={loading || jdSkills.length === 0}>
        {loading ? "Matching..." : "Run skill match"}
      </button>
      {jdSkills.length === 0 && <div style={styles.muted}>No JD skills yet.</div>}
      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div>
          <div style={styles.score}>{result.match_score}%</div>
          <div style={styles.muted}>
            {result.summary.matched} matched, {result.summary.partial} partial,{" "}
            {result.summary.missing} missing
          </div>

          <div style={styles.section}>
            <p style={styles.heading}>Matched</p>
            <ul style={styles.list}>
              {result.matched_skills.map((m) => (
                <li key={m.skill_name}>
                  {m.skill_name} ({m.match_type}
                  {m.candidate_skill !== m.skill_name ? `: ${m.candidate_skill}` : ""})
                </li>
              ))}
            </ul>
          </div>

          {result.partial_matches.length > 0 && (
            <div style={styles.section}>
              <p style={styles.heading}>Partial</p>
              <ul style={styles.list}>
                {result.partial_matches.map((m) => (
                  <li key={m.skill_name}>
                    {m.skill_name} (candidate has: {m.candidate_skill})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.section}>
            <p style={styles.heading}>Missing</p>
            <ul style={styles.list}>
              {result.missing_skills.map((m) => (
                <li key={m.skill_name}>
                  {m.skill_name} - priority {m.priority} ({m.recommendation_tag})
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.muted}>{result.notes[0]}</div>
        </div>
      )}
    </div>
  );
}
