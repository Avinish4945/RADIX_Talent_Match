import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileCheck2,
  FileDown,
  HelpCircle,
  Layers,
  Lightbulb,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";
import { setMatchingResults } from "../../../../application/store/appSlice";
import { getProfile } from "../../../../infrastructure/api/profile";
import { runSkillMatch } from "../../../../infrastructure/api/skillMatch";
import { getJobDescriptions } from "../job-analytics/jdApi";
import { PageHeading } from "../../../components/shared/PagePrimitives";
import { PieChart } from "../../../components/shared/PieChart";
import { jobs as benchmarkJobs } from "../../../../infrastructure/demo/demoData";

export function SkillMatching() {
  const profile = useSelector((state) => state.app.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get("jdId") || "";

  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const [candidateProfile, setCandidateProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(
    Boolean(profile.backendProfileId),
  );
  const [profileError, setProfileError] = useState("");

  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [result, setResult] = useState(null);

  const [filterTab, setFilterTab] = useState("all");

  const selectedJob = useMemo(() => {
    const foundInApi = jobDescriptions.find((job) => job.id === selectedJobId);
    if (foundInApi) return foundInApi;

    // Check if it matches a benchmark job id
    if (selectedJobId.startsWith("bm-")) {
      const idx = parseInt(selectedJobId.replace("bm-", ""), 10);
      const bJob = benchmarkJobs[idx];
      if (bJob) {
        return {
          id: selectedJobId,
          role: bJob.role,
          company: bJob.company,
          source_file: `${bJob.company} - ${bJob.role}.pdf`,
          skills: bJob.jdSkills || [],
        };
      }
    }
    return null;
  }, [jobDescriptions, selectedJobId]);

  const effectiveProfile = useMemo(() => {
    if (candidateProfile) return candidateProfile;
    if (profile && (profile.skills?.length > 0 || profile.name)) {
      return {
        id: profile.backendProfileId || profile.id || "current-profile",
        name: profile.name || "Candidate",
        email: profile.email || "",
        skills: profile.skills || [],
        preferred_roles:
          profile.preferred_roles || (profile.role ? [profile.role] : []),
        education: profile.education
          ? [
              {
                degree: profile.education || "",
                university: profile.university || "",
                year: profile.year || "",
              },
            ]
          : [],
      };
    }
    return null;
  }, [candidateProfile, profile]);

  const candidateSkills = useMemo(
    () =>
      (effectiveProfile?.skills || []).map((skill) =>
        typeof skill === "string"
          ? {
              skill_name: skill,
              category_code: "OTHER",
              evidence: "Listed in candidate profile",
              confidence: "medium",
            }
          : skill,
      ),
    [effectiveProfile],
  );

  useEffect(() => {
    let active = true;

    async function loadJobDescriptions() {
      setJobsLoading(true);
      setJobsError("");
      try {
        const firstPage = await getJobDescriptions({ page: 1, pageSize: 100 });
        const remainingPages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstPage.total_pages - 1) },
            (_, index) =>
              getJobDescriptions({ page: index + 2, pageSize: 100 }),
          ),
        );
        if (active) {
          const apiJobs = [
            ...(firstPage.job_descriptions || []),
            ...remainingPages.flatMap((page) => page.job_descriptions || []),
          ];
          setJobDescriptions(apiJobs);
          // If no job selected in URL, default to first available
          if (!selectedJobId) {
            if (apiJobs.length > 0) {
              setSearchParams({ jdId: apiJobs[0].id });
            } else {
              setSearchParams({ jdId: "bm-0" });
            }
          }
        }
      } catch (requestError) {
        if (active) {
          setJobsError(requestError.message);
          if (!selectedJobId) setSearchParams({ jdId: "bm-0" });
        }
      } finally {
        if (active) setJobsLoading(false);
      }
    }

    loadJobDescriptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCandidateProfile() {
      const pid =
        profile.backendProfileId ||
        localStorage.getItem("radix-saved-profile-id");
      if (!pid) {
        setCandidateProfile(null);
        setProfileLoading(false);
        setProfileError("");
        return;
      }

      setProfileLoading(true);
      setProfileError("");
      try {
        const savedProfile = await getProfile(pid);
        if (active) setCandidateProfile(savedProfile);
      } catch (requestError) {
        if (active) setProfileError(requestError.message);
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadCandidateProfile();
    return () => {
      active = false;
    };
  }, [profile.backendProfileId]);

  function selectJob(jobId) {
    setResult(null);
    setMatchError("");
    setSearchParams(jobId ? { jdId: jobId } : {});
  }

  async function runMatching() {
    if (!selectedJob || !effectiveProfile) return;
    setMatching(true);
    setMatchError("");
    try {
      const matchResult = await runSkillMatch({
        candidateSkills,
        jdSkills: selectedJob.skills || [],
        candidateId: effectiveProfile.id,
        jdSourceFile: selectedJob.source_file,
        company: selectedJob.company,
        role: selectedJob.role,
      });
      setResult(matchResult);
      dispatch(
        setMatchingResults({
          role: selectedJob.role || selectedJob.source_file,
          company: selectedJob.company,
          score: matchResult.match_score,
          count: matchResult.summary.jd_skill_count,
          createdAt: new Date().toISOString(),
        }),
      );
    } catch (requestError) {
      setMatchError(requestError.message);
    } finally {
      setMatching(false);
    }
  }

  const pieData = result
    ? [
        {
          label: "Matched",
          value: result.summary.matched,
          color: "#10b981",
        },
        {
          label: "Partial",
          value: result.summary.partial,
          color: "#f59e0b",
        },
        {
          label: "Missing",
          value: result.summary.missing,
          color: "#ef4444",
        },
      ]
    : [];

  const allSkillsList = useMemo(() => {
    if (!result) return [];
    const matched = (result.matched_skills || []).map((s) => ({
      ...s,
      matchType: "matched",
    }));
    const partial = (result.partial_skills || []).map((s) => ({
      ...s,
      matchType: "partial",
    }));
    const missing = (result.missing_skills || []).map((s) => ({
      ...s,
      matchType: "missing",
    }));
    return [...matched, ...partial, ...missing];
  }, [result]);

  const filteredSkillsList = useMemo(() => {
    if (filterTab === "matched")
      return allSkillsList.filter((s) => s.matchType === "matched");
    if (filterTab === "partial")
      return allSkillsList.filter((s) => s.matchType === "partial");
    if (filterTab === "missing")
      return allSkillsList.filter((s) => s.matchType === "missing");
    return allSkillsList;
  }, [allSkillsList, filterTab]);

  return (
    <div className="dashboard-container">
      {/* Executive Header */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <div className="hero-status-tag">
            <span className="status-dot-pulse" />
            <span>1:1 Precision Match Engine · Multi-Vector Taxonomy</span>
          </div>
          <h1 className="hero-greeting">Candidate-to-Job Skill Matching</h1>
          <p className="hero-subtext">
            Direct matrix alignment of candidate-verified skills vs. specific JD
            requisites. Prioritizes the gap list over raw numbers so candidates
            and recruiters know exact growth actions.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <span className="badge badge-emerald">
            Deterministic Match Engine
          </span>
          <span className="count-pill">Fuzzy String + Vector Synthesis</span>
        </div>
      </section>

      {/* Trust Notice */}
      <div
        style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "10px",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
          color: "#0369a1",
        }}
      >
        <ShieldCheck size={18} className="text-sky" style={{ flexShrink: 0 }} />
        <span>
          <strong>Evidence Audit Rule:</strong> Missing skills reflect absent
          resume citations, not verified absence of candidate capacity. Always
          review partial overlap and syntax crossover before filtering.
        </span>
      </div>

      {/* Matching Selection Controls Card */}
      <section className="check-controls-card">
        <div className="widget-header" style={{ marginBottom: "8px" }}>
          <div className="widget-title-row">
            <Sparkles size={18} className="text-indigo" />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
              Requisition Target & Candidate Dossier
            </h3>
          </div>
          <span className="count-pill">1:1 Comparison</span>
        </div>

        <div className="check-controls-grid">
          {/* Target Requisition Picker */}
          <label
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--on-surface)",
              }}
            >
              Target Job Description
            </span>
            <select
              value={selectedJobId}
              onChange={(e) => selectJob(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "13px",
                background: "#ffffff",
                color: "var(--on-surface)",
                cursor: "pointer",
              }}
            >
              {jobDescriptions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.role || j.source_file} ·{" "}
                  {j.company || "Uploaded Requisition"}
                </option>
              ))}
              <optgroup label="Benchmark Benchmark Roles (Organizer Calibrated)">
                {benchmarkJobs.map((bj, i) => (
                  <option key={`bm-${i}`} value={`bm-${i}`}>
                    {bj.role} · {bj.company} (Benchmark)
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          {/* Candidate Dossier */}
          <label
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--on-surface)",
              }}
            >
              Candidate Profile
            </span>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "#f8fafc",
                fontSize: "13px",
                color: "var(--on-surface)",
                fontWeight: 600,
              }}
            >
              {effectiveProfile?.name || "Active Workspace Candidate"} (
              {candidateSkills.length} skills)
            </div>
          </label>

          {/* Action Button */}
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={runMatching}
            disabled={matching || !selectedJob || !effectiveProfile}
          >
            {matching ? (
              "Comparing Vectors..."
            ) : (
              <>
                <Sparkles size={15} /> Run Skill Matching
              </>
            )}
          </button>
        </div>
      </section>

      {/* Target JD & Candidate Snapshot Strip */}
      {selectedJob && (
        <section className="candidate-dossier-card">
          <div className="dossier-left">
            <div
              className="dossier-avatar"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #4f46e5)",
              }}
            >
              <BriefcaseBusiness size={20} />
            </div>
            <div className="dossier-meta">
              <h3>{selectedJob.role || selectedJob.source_file}</h3>
              <span>
                {selectedJob.company || "Company Requisition"} ·{" "}
                {selectedJob.skills?.length || 0} required skills
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              to={`/analytics?jdId=${encodeURIComponent(selectedJob.id)}`}
              className="btn btn-secondary btn-xs"
            >
              Inspect Full JD
            </Link>
            <Link to="/profile" className="btn btn-secondary btn-xs">
              Edit Candidate Profile
            </Link>
          </div>
        </section>
      )}

      {/* Match Error */}
      {matchError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#991b1b",
            fontSize: "13px",
          }}
          role="alert"
        >
          {matchError}
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="skill-match-layout">
          {/* Match Vector Overview Grid */}
          <div className="match-overview-grid">
            {/* Overall Score Card */}
            <div className="match-vector-card">
              <span className="badge badge-emerald">
                {result.match_score >= 80
                  ? "HIGH ALIGNMENT"
                  : result.match_score >= 60
                    ? "MODERATE ALIGNMENT"
                    : "GROWTH CANDIDATE"}
              </span>
              <div className="score-hero-val">{result.match_score}%</div>
              <div className="score-hero-lbl">Calculated Match Vector</div>

              <div className="score-counts-row">
                <div className="score-count-box">
                  <b style={{ color: "#10b981" }}>{result.summary.matched}</b>
                  <small>Matched</small>
                </div>
                <div className="score-count-box">
                  <b style={{ color: "#f59e0b" }}>{result.summary.partial}</b>
                  <small>Partial</small>
                </div>
                <div className="score-count-box">
                  <b style={{ color: "#ef4444" }}>{result.summary.missing}</b>
                  <small>Missing</small>
                </div>
              </div>
            </div>

            {/* Distribution Pie Chart & Domain Analysis */}
            <div
              className="dashboard-table-card"
              style={{ padding: "20px 24px" }}
            >
              <div className="widget-header" style={{ marginBottom: "12px" }}>
                <div className="widget-title-row">
                  <Layers size={16} className="text-indigo" />
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
                    Requirement Match Breakdown
                  </h4>
                </div>
                <span className="count-pill">
                  {result.summary.jd_skill_count} Total Requisites
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px minmax(0, 1fr)",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                <PieChart
                  title="Match Distribution"
                  centerLabel="Skills"
                  data={pieData}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                    }}
                  >
                    <span>Matched Competencies</span>
                    <strong style={{ color: "#10b981" }}>
                      {result.summary.matched} (
                      {Math.round(
                        (result.summary.matched /
                          result.summary.jd_skill_count) *
                          100,
                      )}
                      %)
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                    }}
                  >
                    <span>Partial / Syntax Transfer</span>
                    <strong style={{ color: "#f59e0b" }}>
                      {result.summary.partial} (
                      {Math.round(
                        (result.summary.partial /
                          result.summary.jd_skill_count) *
                          100,
                      )}
                      %)
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                    }}
                  >
                    <span>Missing Portfolio Citations</span>
                    <strong style={{ color: "#ef4444" }}>
                      {result.summary.missing} (
                      {Math.round(
                        (result.summary.missing /
                          result.summary.jd_skill_count) *
                          100,
                      )}
                      %)
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Evidence Matrix */}
          <section className="evidence-matrix-card">
            <div className="card-top-header" style={{ padding: "0 0 16px 0" }}>
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    margin: "0 0 4px 0",
                  }}
                >
                  Skill Evidence Matrix
                </h3>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Verified matches extracted from candidate profile artifacts
                  vs. requisition requirements.
                </span>
              </div>

              <div className="table-filter-tabs">
                <button
                  type="button"
                  className={`filter-tab ${filterTab === "all" ? "active" : ""}`}
                  onClick={() => setFilterTab("all")}
                >
                  All ({allSkillsList.length})
                </button>
                <button
                  type="button"
                  className={`filter-tab ${filterTab === "matched" ? "active" : ""}`}
                  onClick={() => setFilterTab("matched")}
                >
                  Matched ({result.summary.matched})
                </button>
                <button
                  type="button"
                  className={`filter-tab ${filterTab === "partial" ? "active" : ""}`}
                  onClick={() => setFilterTab("partial")}
                >
                  Partial ({result.summary.partial})
                </button>
                <button
                  type="button"
                  className={`filter-tab ${filterTab === "missing" ? "active" : ""}`}
                  onClick={() => setFilterTab("missing")}
                >
                  Missing ({result.summary.missing})
                </button>
              </div>
            </div>

            <div className="skills-matrix-grid">
              {filteredSkillsList.map((skill, index) => {
                const isMatched = skill.matchType === "matched";
                const isPartial = skill.matchType === "partial";
                const isMissing = skill.matchType === "missing";

                return (
                  <div
                    key={index}
                    className={`skill-matrix-item ${skill.matchType}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "var(--primary)",
                            background: "var(--surface-low)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          [{skill.category_code || "SYS"}]
                        </span>
                        <h4
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--on-surface)",
                            margin: "4px 0 0 0",
                          }}
                        >
                          {skill.skill_name}
                        </h4>
                      </div>

                      <span
                        className={`badge ${
                          isMatched
                            ? "badge-emerald"
                            : isPartial
                              ? "badge-amber"
                              : "badge-rose"
                        }`}
                      >
                        {isMatched
                          ? "Exact Match"
                          : isPartial
                            ? "Partial Match"
                            : "Missing Evidence"}
                      </span>
                    </div>

                    {skill.candidate_skill && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#334155",
                          margin: "4px 0 0 0",
                        }}
                      >
                        Profile match: <b>{skill.candidate_skill}</b>
                      </p>
                    )}

                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        margin: "4px 0 0 0",
                        fontStyle: "italic",
                      }}
                    >
                      "
                      {skill.evidence ||
                        (isMissing
                          ? "No citation detected in candidate profile."
                          : "Demonstrated in candidate experience.")}
                      "
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Prioritized Evidence Gap Analysis & Guided Next Steps */}
          {(result.missing_skills || []).length > 0 && (
            <section
              className="dashboard-table-card"
              style={{ padding: "24px" }}
            >
              <div className="widget-header" style={{ marginBottom: "16px" }}>
                <div className="widget-title-row">
                  <AlertTriangle size={18} className="text-amber" />
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                    Evidence Gap Analysis & Guided Next Steps
                  </h3>
                </div>
                <span className="badge badge-amber">
                  Prioritized Gap Breakdown ({result.missing_skills.length})
                </span>
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  margin: "0 0 16px 0",
                }}
              >
                The following skills were explicitly required by the job
                requisition but lack verified citations in the candidate's
                dossier. Use these logic-gated next steps to bridge the gap:
              </p>

              <div className="gap-steps-list">
                {result.missing_skills.map((gap, i) => (
                  <div key={i} className="gap-step-box">
                    <div className="gap-step-content">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <h4>
                          Gap #{i + 1}: {gap.skill_name} [
                          {gap.category_code || "SYS"}]
                        </h4>
                        <span className="badge badge-rose">
                          Missing Citation
                        </span>
                      </div>
                      <p>
                        Target requisition explicitly expects proficiency in{" "}
                        <strong>{gap.skill_name}</strong>. Candidate profile
                        demonstrates no direct evidence. Recommended action:
                        conduct a 20-minute targeted inquiry or take a
                        verification challenge.
                      </p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link
                          to="/profile"
                          className="btn btn-secondary btn-xs"
                        >
                          Add Project Evidence in Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
