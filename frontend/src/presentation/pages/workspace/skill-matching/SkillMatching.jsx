import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { setMatchingResults } from "../../../../application/store/appSlice";
import { runSkillMatch } from "../../../../infrastructure/api/skillMatch";
import { jobs } from "../../../../infrastructure/demo/demoData";
import { PageHeading } from "../../../components/shared/PagePrimitives";

export function SkillMatching() {
  const profile = useSelector((state) => state.app.profile);
  const [role, setRole] = useState("Software Engineer");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const dispatch = useDispatch();

  // Normalize candidate skills from Redux shared profile
  const candidateSkills = useMemo(() => {
    return (profile.skills || []).map((s) => {
      if (typeof s === "object" && s !== null) {
        return {
          skill_name: s.skill_name,
          category_code: s.category_code || "OTHER",
          evidence: s.evidence || "",
          confidence: s.confidence || "high",
        };
      }
      return {
        skill_name: String(s),
        category_code: "OTHER",
        evidence: "Profile skill",
        confidence: "medium",
      };
    });
  }, [profile.skills]);

  const targetRoles = useMemo(() => {
    const list = [...jobs];
    // Also add any analyzed JDs from the profile if available
    if (profile.jobAnalyses && Array.isArray(profile.jobAnalyses)) {
      profile.jobAnalyses.forEach((analysis, idx) => {
        if (analysis?.role && analysis?.skills) {
          list.unshift({
            company: analysis.company || "Uploaded JD",
            role: analysis.role,
            initials: "U",
            color: "pink",
            tags: analysis.skills.map((s) => s.skill_name || s),
            jdSkills: analysis.skills.map((s) => ({
              skill_name: s.skill_name || String(s),
              category_code: s.category_code || "OTHER",
              confidence: s.confidence || "high",
            })),
          });
        }
      });
    }
    return list;
  }, [profile.jobAnalyses]);

  const filteredJobs = useMemo(
    () =>
      matches.filter((job) =>
        `${job.role} ${job.company} ${job.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [matches, query],
  );

  async function runMatching() {
    setLoading(true);
    setError("");
    setSelectedJob(null);

    const relevantRoles = targetRoles.filter(
      (job) =>
        job.role.toLowerCase().includes(role.toLowerCase()) ||
        role.toLowerCase().includes(job.role.toLowerCase()),
    );

    const rolesToMatch =
      relevantRoles.length > 0 ? relevantRoles : targetRoles.slice(0, 3);

    try {
      // Call backend API /api/skill-match for each role in parallel
      const matchPromises = rolesToMatch.map(async (job) => {
        const jdSkills =
          job.jdSkills ||
          job.tags.map((t) => ({ skill_name: t, category_code: "OTHER" }));
        const result = await runSkillMatch({
          candidateSkills,
          jdSkills,
          candidateId: profile.name || "candidate-active",
          company: job.company,
          role: job.role,
        });

        return {
          ...job,
          score: result.match_score,
          summary: result.summary,
          matchedSkills: result.matched_skills || [],
          partialMatches: result.partial_matches || [],
          missingSkills: result.missing_skills || [],
        };
      });

      const results = await Promise.all(matchPromises);
      results.sort((a, b) => b.score - a.score);

      setMatches(results);
      setHasRun(true);

      // Save top match in Redux state so Dashboard reflects it
      if (results.length > 0) {
        dispatch(
          setMatchingResults({
            role: results[0].role,
            company: results[0].company,
            score: results[0].score,
            count: results.length,
            summary: results[0].summary,
            createdAt: new Date().toISOString(),
          }),
        );
      }
    } catch (err) {
      setError(
        err.message || "Failed to execute skill matching via backend API",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <PageHeading
        eyebrow="AI-POWERED MATCHING VIA BACKEND API"
        title="Skill Matching"
        description="Compare your structured profile skills against official target roles using deterministic semantic matching."
        action={
          <span className="secure-note">
            <CheckCircle2 size={16} /> Backend API Connected
          </span>
        }
      />
      <section className="panel matching-controls">
        <div className="matching-control-copy">
          <div className="soft-icon pink">
            <Target size={19} />
          </div>
          <div>
            <b>What target role would you like to match?</b>
            <span>
              Calls{" "}
              <code
                style={{
                  color: "#6841cf",
                  background: "#f0ebff",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                POST /api/skill-match
              </code>{" "}
              with your active profile ({candidateSkills.length} skills listed).
            </span>
          </div>
        </div>
        <div className="matching-control-actions">
          <label className="talent-select-label">
            <span>Target role</span>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setHasRun(false);
                setSelectedJob(null);
              }}
            >
              <option>Software Engineer</option>
              <option>Data Scientist</option>
              <option>Data Analyst</option>
              <option>Associate Software Engineer</option>
              <option>Application Support Analyst</option>
            </select>
          </label>
          <button
            className="button button-primary"
            onClick={runMatching}
            disabled={loading || candidateSkills.length === 0}
          >
            <Sparkles size={16} />
            {loading ? "Matching via API..." : "Match my skills"}
          </button>
        </div>
      </section>

      {error && (
        <section className="talent-alert" aria-live="polite">
          <div role="alert">
            <p>
              <b>Matching error:</b> {error}
            </p>
          </div>
        </section>
      )}

      {candidateSkills.length === 0 && (
        <div className="tip-banner" style={{ marginBottom: "16px" }}>
          <div className="tip-icon">
            <AlertCircle size={18} />
          </div>
          <div>
            <b>Your profile has no skills listed yet</b>
            <span>
              Upload your resume or add skills in Profile Builder to see
              accurate match results.
            </span>
          </div>
          <Link to="/resume">
            Parse Resume <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {hasRun && matches.length > 0 && (
        <div className="match-summary">
          <div>
            <div className="eyebrow">API MATCH RESULTS</div>
            <h2>Roles matching “{role}”</h2>
            <p>
              {filteredJobs.length} of {matches.length} roles evaluated ·
              Deterministic score calculated by backend service
            </p>
          </div>
          <label className="result-search">
            <Search size={16} />
            <input
              aria-label="Search role results"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search roles or technologies..."
            />
          </label>
        </div>
      )}

      {!hasRun && !loading && (
        <div className="panel no-results">
          <Sparkles size={22} />
          <h3>Ready to evaluate your profile</h3>
          <p>
            Select a target role and click &quot;Match my skills&quot; to invoke
            the backend Skill Match service.
          </p>
        </div>
      )}

      <div className="job-match-grid">
        {filteredJobs.map((job) => (
          <article
            className="panel job-card"
            key={`${job.company}-${job.role}`}
          >
            <div className="job-card-heading">
              <div className={`company-mark company-${job.color}`}>
                {job.initials}
              </div>
              <span className="status-badge">API Evaluated</span>
            </div>
            <h3>{job.role}</h3>
            <p className="job-company">
              {job.company} <span>·</span> Official Benchmark
            </p>
            <div className="job-score-line">
              <div>
                <b>{job.score}%</b>
                <span>backend match score</span>
              </div>
              <div
                className="job-progress"
                role="progressbar"
                aria-label={`${job.role} match score`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={job.score}
              >
                <i style={{ width: `${job.score}%` }} />
              </div>
            </div>
            <div className="job-match-stats">
              <span>
                <CheckCircle2 size={14} color="#169c64" />{" "}
                {job.summary?.matched || 0} matched ·{" "}
                {job.summary?.partial || 0} partial ·{" "}
                {job.summary?.missing || 0} missing
              </span>
            </div>
            <div className="job-tags">
              {job.tags.slice(0, 6).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <button
              className="button button-outline full-button"
              aria-expanded={
                selectedJob?.company === job.company &&
                selectedJob?.role === job.role
              }
              onClick={() =>
                setSelectedJob(
                  selectedJob?.company === job.company &&
                    selectedJob?.role === job.role
                    ? null
                    : job,
                )
              }
            >
              {selectedJob?.company === job.company &&
              selectedJob?.role === job.role
                ? "Hide breakdown"
                : "View full breakdown"}{" "}
              <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>

      {selectedJob && (
        <section className="panel selected-match-details" aria-live="polite">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">BACKEND MATCH BREAKDOWN</span>
              <h2>
                {selectedJob.role} — {selectedJob.company}
              </h2>
              <p>
                Overall Match: <b>{selectedJob.score}%</b> · Evaluated by RADIX
                Skill Matching engine
              </p>
            </div>
            <span className="status-badge success">
              {selectedJob.summary?.matched} of{" "}
              {selectedJob.summary?.total_jd_skills} JD skills matched
            </span>
          </div>

          <div style={{ display: "grid", gap: "16px", marginTop: "16px" }}>
            {selectedJob.matchedSkills &&
              selectedJob.matchedSkills.length > 0 && (
                <div>
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#169c64",
                    }}
                  >
                    ✓ Matched Skills ({selectedJob.matchedSkills.length})
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {selectedJob.matchedSkills.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "#eaf8ef",
                          border: "1px solid #ccecd7",
                          color: "#16835d",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >
                        <b>{m.skill_name}</b>{" "}
                        <small style={{ opacity: 0.8 }}>({m.match_type})</small>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {selectedJob.partialMatches &&
              selectedJob.partialMatches.length > 0 && (
                <div>
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#bd7624",
                    }}
                  >
                    ~ Partial Matches ({selectedJob.partialMatches.length})
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {selectedJob.partialMatches.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "#fff4dc",
                          border: "1px solid #f6e2b5",
                          color: "#8d5310",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >
                        <b>{m.skill_name}</b>{" "}
                        <small>(Candidate: {m.candidate_skill})</small>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {selectedJob.missingSkills &&
              selectedJob.missingSkills.length > 0 && (
                <div>
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#b54653",
                    }}
                  >
                    ✗ Missing Skills ({selectedJob.missingSkills.length})
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {selectedJob.missingSkills.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "#ffedf0",
                          border: "1px solid #f9ccd3",
                          color: "#a42f3d",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >
                        <b>{m.skill_name}</b>{" "}
                        <small style={{ opacity: 0.8 }}>
                          [{m.priority || m.recommendation_tag || "priority"}]
                        </small>
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </section>
      )}

      <div className="tip-banner">
        <div className="tip-icon">
          <Lightbulb size={18} />
        </div>
        <div>
          <b>Matching connects with Talent Check</b>
          <span>
            Check your company readiness score against {role} requirements.
          </span>
        </div>
        <Link to="/talent-check">
          Go to Talent Check <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
