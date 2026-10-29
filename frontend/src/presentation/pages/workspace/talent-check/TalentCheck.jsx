import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Layers,
  Lightbulb,
  Radio,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";
import { apiRequest } from "../../../../infrastructure/api/apiClient";
import {
  markReadinessChecked,
  updateProfile as updateAppProfile,
} from "../../../../application/store/appSlice";
import {
  createProfile,
  getProfile,
  toProfilePayload,
  updateProfile as updateProfileApi,
} from "../../../../infrastructure/api/profile";
import { getJobDescriptions } from "../job-analytics/jdApi";
import {
  PageHeading,
  ProgressRing,
} from "../../../components/shared/PagePrimitives";
import { PieChart } from "../../../components/shared/PieChart";

const EMPTY_JOB_ANALYSES = [];
const CURRENT_PROFILE_ID = "current-profile";

const CATEGORY_NAMES = {
  COD: "Coding & Clean Architecture",
  DSA: "Algorithms & Complexity",
  SYS: "Distributed Systems & Infrastructure",
  SQL: "Databases & Query Optimization",
  AI: "Machine Learning & AI Modeling",
  DEV: "DevOps & Cloud Orchestration",
  SEC: "Cybersecurity & Zero Trust",
  NET: "Networking & Distributed Protocols",
  ARC: "High-Level Architecture & RFCs",
  MOB: "Mobile & Client Engineering",
  CC: "Cloud Computing & Serverless",
  TST: "Testing Rigor & CI/CD Verification",
  OOD: "Object-Oriented Design",
  OS: "Operating Systems & Concurrency",
  APTI: "Quantitative & Analytical Aptitude",
  SWE: "Software Engineering Practices",
  COMM: "Technical Communication & Mentorship",
};

export function TalentCheck() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appProfile = useSelector((state) => state.app.profile);
  const jobAnalyses = useSelector(
    (state) => state.app.profile.jobAnalyses || EMPTY_JOB_ANALYSES,
  );

  const extractedCompanies = useMemo(
    () =>
      jobAnalyses
        .map((analysis) =>
          typeof analysis?.company === "string" ? analysis.company.trim() : "",
        )
        .filter(Boolean),
    [jobAnalyses],
  );

  const [configuredCompanies, setConfiguredCompanies] = useState([]);
  const [jdCompanies, setJdCompanies] = useState([]);
  const [jdCompanyRoles, setJdCompanyRoles] = useState({});
  const [jdCompaniesError, setJdCompaniesError] = useState("");

  const companies = useMemo(
    () => [
      ...new Map(
        [...configuredCompanies, ...jdCompanies, ...extractedCompanies]
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [name.toLocaleLowerCase(), name]),
      ).values(),
    ],
    [configuredCompanies, extractedCompanies, jdCompanies],
  );

  const [candidates, setCandidates] = useState([]);
  const [company, setCompany] = useState("");
  const [jdId, setJdId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [candidateProfileError, setCandidateProfileError] = useState("");
  const [candidateProfileLoading, setCandidateProfileLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsAttempt, setOptionsAttempt] = useState(0);
  const [checking, setChecking] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);

  const selectedCompanyConfigured = configuredCompanies.some(
    (name) => name.toLocaleLowerCase() === company.toLocaleLowerCase(),
  );

  const selectedCompanyJds =
    jdCompanyRoles[company.toLocaleLowerCase()]?.jobDescriptions || [];

  const selectedJdHasSkills = selectedCompanyJds.some(
    (job) => job.id === jdId && job.hasSkills,
  );

  const hasCurrentProfile = Boolean(
    appProfile.name?.trim() ||
    appProfile.email?.trim() ||
    appProfile.skills?.length,
  );

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setOptionsLoading(true);
      setCompanyError("");
      setCandidateError("");
      setJdCompaniesError("");
      const [companyResponse, candidateResponse, jdResponse] =
        await Promise.allSettled([
          apiRequest("/talent-check/companies"),
          apiRequest("/talent-check/candidates"),
          getJobDescriptions({ page: 1, pageSize: 100 }),
        ]);

      if (!active) return;

      if (companyResponse.status === "fulfilled") {
        const availableCompanies = companyResponse.value.companies || [];
        setConfiguredCompanies(availableCompanies);
        setCompany(availableCompanies[0] || extractedCompanies[0] || "");
        setCompanyError(
          availableCompanies.length
            ? ""
            : "No official company requirements are configured.",
        );
      } else {
        setCompanyError(companyResponse.reason.message);
      }

      if (jdResponse.status === "fulfilled") {
        try {
          const firstPage = jdResponse.value;
          const remainingPages = await Promise.all(
            Array.from(
              { length: Math.max(0, firstPage.total_pages - 1) },
              (_, index) =>
                getJobDescriptions({ page: index + 2, pageSize: 100 }),
            ),
          );
          if (!active) return;
          const jobDescriptions = [
            ...(firstPage.job_descriptions || []),
            ...remainingPages.flatMap((page) => page.job_descriptions || []),
          ];
          const rolesByCompany = {};
          for (const job of jobDescriptions) {
            const name =
              typeof job.company === "string" ? job.company.trim() : "";
            if (!name) continue;
            const key = name.toLocaleLowerCase();
            rolesByCompany[key] ||= { name, roles: [], jobDescriptions: [] };
            rolesByCompany[key].jobDescriptions.push({
              id: job.id,
              role: job.role,
              sourceFile: job.source_file,
              hasSkills: Array.isArray(job.skills) && job.skills.length > 0,
            });
            if (job.role && !rolesByCompany[key].roles.includes(job.role)) {
              rolesByCompany[key].roles.push(job.role);
            }
          }
          const importedCompanies = Object.values(rolesByCompany);
          setJdCompanies(importedCompanies.map(({ name }) => name));
          setJdCompanyRoles(rolesByCompany);
          const defaultCompany =
            extractedCompanies[0] || importedCompanies[0]?.name || "";
          setCompany((current) => current || defaultCompany);
          setJdId((current) => {
            const selectedCompany = company || defaultCompany;
            const companyJobs =
              rolesByCompany[selectedCompany.toLocaleLowerCase()]
                ?.jobDescriptions || [];
            return current || companyJobs[0]?.id || "";
          });
        } catch (error) {
          if (active) setJdCompaniesError(error.message);
        }
      } else {
        setJdCompaniesError(jdResponse.reason.message);
      }

      if (candidateResponse.status === "fulfilled") {
        const availableCandidates = candidateResponse.value.candidates || [];
        setCandidates(availableCandidates);
        const savedProfileId = appProfile.backendProfileId;
        const selectedProfile = availableCandidates.find(
          (candidate) => candidate.id === savedProfileId,
        );
        setCandidateId(
          (current) =>
            current ||
            selectedProfile?.id ||
            (hasCurrentProfile
              ? CURRENT_PROFILE_ID
              : availableCandidates[0]?.id || ""),
        );
        setCandidateError(
          availableCandidates.length || hasCurrentProfile
            ? ""
            : "No candidates are available for assessment.",
        );
      } else {
        setCandidateError(candidateResponse.reason.message);
      }

      setOptionsLoading(false);
    }

    loadOptions();
    return () => {
      active = false;
    };
  }, [
    appProfile.backendProfileId,
    extractedCompanies,
    hasCurrentProfile,
    optionsAttempt,
  ]);

  useEffect(() => {
    let active = true;

    async function loadCandidateProfile() {
      if (!candidateId) {
        setCandidateProfile(null);
        setCandidateProfileError("");
        return;
      }

      if (candidateId === CURRENT_PROFILE_ID) {
        setCandidateProfile(toProfilePayload(appProfile));
        setCandidateProfileError("");
        return;
      }

      setCandidateProfileLoading(true);
      setCandidateProfileError("");
      try {
        const savedProfile = await getProfile(candidateId);
        if (active) setCandidateProfile(savedProfile);
      } catch (error) {
        if (active) {
          setCandidateProfile(null);
          setCandidateProfileError(error.message);
        }
      } finally {
        if (active) setCandidateProfileLoading(false);
      }
    }

    loadCandidateProfile();
    return () => {
      active = false;
    };
  }, [appProfile, candidateId]);

  async function runTalentCheck() {
    setChecking(true);
    setApiError("");
    setResult(null);

    try {
      let assessmentCandidateId = candidateId;
      if (candidateId === CURRENT_PROFILE_ID) {
        const savedProfile = await createProfile(toProfilePayload(appProfile));
        assessmentCandidateId = savedProfile.id;
        dispatch(updateAppProfile({ backendProfileId: savedProfile.id }));
        setCandidateId(savedProfile.id);
        setCandidates((current) => [
          {
            id: savedProfile.id,
            name: appProfile.name || "Unnamed candidate",
          },
          ...current.filter((candidate) => candidate.id !== savedProfile.id),
        ]);
      } else if (candidateId === appProfile.backendProfileId) {
        await updateProfileApi(candidateId, toProfilePayload(appProfile));
      }

      const response = await apiRequest("/talent-check/", {
        method: "POST",
        body: {
          candidate_id: assessmentCandidateId,
          company,
          ...(!selectedCompanyConfigured ? { jd_id: jdId } : {}),
        },
      });
      setResult(response);
      dispatch(markReadinessChecked(response));
    } catch (error) {
      setApiError(error.message);
    } finally {
      setChecking(false);
    }
  }

  const selectedCandidate = candidates.find(
    (candidate) => candidate.id === candidateId,
  );

  const assessedGaps =
    result?.skillset_gap.filter(
      (skill) => skill.status === "assessed" && skill.gap,
    ) || [];

  const unknownSkills =
    result?.skillset_gap.filter((skill) => skill.status === "unknown") || [];

  const isPresenceAssessment = result?.assessment_type === "skills_presence";

  const presentSkills =
    result?.skillset_gap.filter((skill) => skill.status === "present") || [];
  const partialSkills =
    result?.skillset_gap.filter((skill) => skill.status === "partial") || [];
  const missingSkills =
    result?.skillset_gap.filter((skill) => skill.status === "missing") || [];

  const pieData = isPresenceAssessment
    ? [
        { label: "Present", value: presentSkills.length, color: "#10b981" },
        { label: "Partial", value: partialSkills.length, color: "#f59e0b" },
        { label: "Missing", value: missingSkills.length, color: "#ef4444" },
      ]
    : [
        {
          label: "Meets requirement",
          value:
            result?.skillset_gap.filter(
              (skill) => skill.status === "assessed" && !skill.gap,
            ).length || 0,
          color: "#10b981",
        },
        {
          label: "Skill gap",
          value: assessedGaps.length,
          color: "#ef4444",
        },
        {
          label: "Not assessed",
          value: unknownSkills.length,
          color: "#94a3b8",
        },
      ];

  return (
    <div className="dashboard-container">
      {/* Executive Header */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <div className="hero-status-tag">
            <span className="status-dot-pulse" />
            <span>Forensic Calibration Engine · Multi-Source Audits</span>
          </div>
          <h1 className="hero-greeting">Talent Check Workspace</h1>
          <p className="hero-subtext">
            Compare candidate proficiencies against official company-wide hiring
            baselines (Google LLC, Microsoft, Oracle) across all 12 canonical
            RADIX categories. Zero black-box ranking.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <span className="badge badge-emerald">Deterministic Delta Model</span>
          <span className="count-pill">12 RADIX Competency Vectors</span>
        </div>
      </section>

      {/* Distinction Callout Banner */}
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "10px",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
          color: "#166534",
        }}
      >
        <ShieldCheck
          size={18}
          className="text-emerald"
          style={{ flexShrink: 0 }}
        />
        <span>
          <strong>Company Benchmark Assessment:</strong> Evaluates candidate
          against official hiring bars; not pegged to a single transient job
          posting. For role-specific gap analysis, use{" "}
          <Link
            to="/matching"
            style={{ textDecoration: "underline", fontWeight: 700 }}
          >
            Skill Matching
          </Link>
          .
        </span>
      </div>

      {/* Check Controls Card */}
      <section className="check-controls-card">
        <div className="widget-header" style={{ marginBottom: "8px" }}>
          <div className="widget-title-row">
            <Target size={18} className="text-indigo" />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
              Calibration Target & Candidate Dossier
            </h3>
          </div>
          <span className="count-pill">Audit Engine v2.4</span>
        </div>

        <div className="check-controls-grid">
          {/* Company Selection */}
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
              Target Company Benchmark
            </span>
            <select
              value={company}
              onChange={(e) => {
                const nextCompany = e.target.value;
                setCompany(nextCompany);
                setJdId(
                  jdCompanyRoles[nextCompany.toLocaleLowerCase()]
                    ?.jobDescriptions[0]?.id || "",
                );
                setResult(null);
                setApiError("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "13px",
                background: "#ffffff",
                color: "var(--on-surface)",
                cursor: "pointer",
              }}
              disabled={optionsLoading || companies.length === 0}
            >
              {companies.map((name) => {
                const isOfficial = [
                  "google llc",
                  "microsoft",
                  "oracle",
                ].includes(name.toLowerCase());
                return (
                  <option key={name} value={name}>
                    {name}{" "}
                    {isOfficial ? "★ (Official Benchmark)" : "· (Imported JD)"}
                  </option>
                );
              })}
            </select>
          </label>

          {/* Candidate Selection */}
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
              Evaluated Candidate Dossier
            </span>
            <select
              value={candidateId}
              onChange={(e) => {
                setCandidateId(e.target.value);
                setResult(null);
                setApiError("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "13px",
                background: "#ffffff",
                color: "var(--on-surface)",
                cursor: "pointer",
              }}
              disabled={
                optionsLoading ||
                (!hasCurrentProfile && candidates.length === 0)
              }
            >
              {!appProfile.backendProfileId && hasCurrentProfile && (
                <option value={CURRENT_PROFILE_ID}>
                  My Profile ({appProfile.name || "Active Workspace Candidate"})
                </option>
              )}
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* Run Action */}
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={runTalentCheck}
            disabled={
              optionsLoading ||
              checking ||
              !company ||
              !candidateId ||
              candidateProfileLoading
            }
          >
            {checking ? (
              "Calibrating Matrix..."
            ) : (
              <>
                <Target size={15} /> Run Talent Check
              </>
            )}
          </button>
        </div>
      </section>

      {/* Candidate Dossier Summary Preview */}
      {candidateProfile && (
        <section className="candidate-dossier-card">
          <div className="dossier-left">
            <div className="dossier-avatar">
              {(candidateProfile.name || "C").charAt(0).toUpperCase()}
            </div>
            <div className="dossier-meta">
              <h3>{candidateProfile.name || selectedCandidate?.name}</h3>
              <span>
                {candidateProfile.email || "Verified Candidate"} ·{" "}
                {candidateProfile.preferred_roles?.[0] || "Software Engineer"}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              maxWidth: "60%",
            }}
          >
            {(candidateProfile.skills || []).slice(0, 8).map((skill, index) => {
              const skillName =
                typeof skill === "string" ? skill : skill.skill_name;
              const skillLevel =
                typeof skill === "string" ? 6 : (skill.level ?? 6);
              return (
                <span
                  key={index}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  {skillName} <b>L{skillLevel}</b>
                </span>
              );
            })}
          </div>

          <span className="badge badge-indigo">
            {(candidateProfile.skills || []).length} Verified Skills
          </span>
        </section>
      )}

      {/* Errors / Alerts */}
      {(companyError || candidateError || apiError) && (
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
          {companyError || candidateError || apiError}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="readiness-layout">
          {/* Composite Alignment Panel */}
          <section className="dashboard-table-card" style={{ padding: "24px" }}>
            <div className="card-top-header" style={{ padding: "0 0 16px 0" }}>
              <div>
                <div className="section-eyebrow">COMPOSITE ALIGNMENT AUDIT</div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: "2px 0 4px 0",
                  }}
                >
                  {result.company} ·{" "}
                  {selectedCandidate?.name ||
                    candidateProfile?.name ||
                    "Candidate"}
                </h2>
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                  {isPresenceAssessment
                    ? "Presence-only requisition match"
                    : "Calibrated company benchmark evaluation"}
                </span>
              </div>

              <span className="badge badge-emerald">
                {result.readiness_score != null && result.readiness_score >= 80
                  ? "Exceeds / Meets Benchmark"
                  : "Ready with Targeted Gaps"}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr) 260px",
                gap: "24px",
                alignItems: "center",
                margin: "16px 0",
              }}
            >
              {/* Radial Score Gauge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {result.readiness_score === null ? (
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "var(--muted)",
                    }}
                  >
                    —
                  </div>
                ) : (
                  <ProgressRing
                    value={result.readiness_score}
                    size={140}
                    stroke={10}
                    label="ready"
                  />
                )}
              </div>

              {/* Score Details & Bars */}
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    margin: "0 0 6px 0",
                  }}
                >
                  {result.readiness_score != null
                    ? `${result.readiness_score}% Composite Readiness`
                    : "Presence-Only Check"}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    margin: "0 0 16px 0",
                    lineHeight: 1.45,
                  }}
                >
                  Meets or exceeds requirements across{" "}
                  <strong>
                    {result.skillset_gap.length -
                      assessedGaps.length -
                      unknownSkills.length}{" "}
                    of {result.skillset_gap.length}
                  </strong>{" "}
                  evaluated technical domains.
                </p>

                <div style={{ display: "flex", gap: "20px" }}>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        display: "block",
                      }}
                    >
                      Exact Coverage
                    </span>
                    <strong
                      style={{ fontSize: "18px", color: "var(--on-surface)" }}
                    >
                      {result.coverage_percent}%
                    </strong>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        display: "block",
                      }}
                    >
                      Assessed Vectors
                    </span>
                    <strong
                      style={{ fontSize: "18px", color: "var(--on-surface)" }}
                    >
                      {result.skillset_gap.length - unknownSkills.length} /{" "}
                      {result.skillset_gap.length}
                    </strong>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        display: "block",
                      }}
                    >
                      Identified Gaps
                    </span>
                    <strong
                      style={{
                        fontSize: "18px",
                        color: assessedGaps.length ? "#ef4444" : "#10b981",
                      }}
                    >
                      {assessedGaps.length} Areas
                    </strong>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div>
                <PieChart
                  title="Assessment Distribution"
                  centerLabel="Vectors"
                  data={pieData}
                />
              </div>
            </div>
          </section>

          {/* 12 Core Competencies Calibration Matrix */}
          <section className="competencies-section">
            <div className="widget-header">
              <div className="widget-title-row">
                <Layers size={18} className="text-indigo" />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                  12 Core Competencies Forensic Breakdown
                </h3>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span className="badge badge-emerald">
                  Meets (
                  {result.skillset_gap.length -
                    assessedGaps.length -
                    unknownSkills.length}
                  )
                </span>
                <span className="badge badge-rose">
                  Gaps ({assessedGaps.length})
                </span>
                <span className="badge badge-neutral">
                  Not Assessed ({unknownSkills.length})
                </span>
              </div>
            </div>

            <div className="competencies-grid">
              {result.skillset_gap.map((skill, idx) => {
                const unknown = skill.status === "unknown";
                const isGap = !unknown && skill.gap;
                const meets = !unknown && !skill.gap;
                const catCode = skill.category_code;
                const catName =
                  CATEGORY_NAMES[catCode] ||
                  skill.skill_name ||
                  "Technical Competency";
                const candidateLvl =
                  skill.candidate_level != null
                    ? `L${skill.candidate_level}`
                    : "—";
                const requiredLvl =
                  skill.required_level != null
                    ? `L${skill.required_level}`
                    : "—";
                const deltaNum =
                  skill.candidate_level != null && skill.required_level != null
                    ? skill.candidate_level - skill.required_level
                    : null;
                const deltaStr =
                  deltaNum != null
                    ? deltaNum > 0
                      ? `+${deltaNum}`
                      : `${deltaNum}`
                    : "—";

                return (
                  <div
                    key={idx}
                    className={`competency-card ${isGap ? "gap" : meets ? "meets" : "unknown"}`}
                  >
                    <div className="competency-top">
                      <div>
                        <span className="competency-cat">[{catCode}]</span>
                        <h4 className="competency-name">{catName}</h4>
                      </div>
                      <span
                        className={`badge ${
                          isGap
                            ? "badge-rose"
                            : meets
                              ? "badge-emerald"
                              : "badge-neutral"
                        }`}
                      >
                        {isGap
                          ? "Skill Gap"
                          : meets
                            ? "Meets Benchmark"
                            : "Missing Info"}
                      </span>
                    </div>

                    {!isPresenceAssessment && (
                      <div className="competency-levels-box">
                        <div className="level-col">
                          <span className="level-lbl">Candidate</span>
                          <span className="level-val">{candidateLvl}</span>
                        </div>
                        <div className="level-col">
                          <span className="level-lbl">Required</span>
                          <span className="level-val">{requiredLvl}</span>
                        </div>
                        <div className="level-col">
                          <span className="level-lbl">Delta</span>
                          <span
                            className={`level-val delta-val ${
                              deltaNum != null && deltaNum >= 0
                                ? "positive"
                                : deltaNum != null && deltaNum < 0
                                  ? "negative"
                                  : "neutral"
                            }`}
                          >
                            {deltaStr}
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="competency-evidence">
                      {skill.evidence
                        ? `"${skill.evidence}"`
                        : unknown
                          ? "No evidence citations found in profile."
                          : "Verified from candidate technical profile."}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Targeted Improvement Plan (Gaps Analysis) */}
          {assessedGaps.length > 0 && (
            <section
              className="dashboard-table-card"
              style={{
                padding: "24px",
                background: "#fffdfa",
                borderColor: "#fed7aa",
              }}
            >
              <div className="widget-header" style={{ marginBottom: "14px" }}>
                <div className="widget-title-row">
                  <AlertTriangle size={18} className="text-amber" />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#9a3412",
                    }}
                  >
                    Targeted Remediation & Improvement Plan
                  </h3>
                </div>
                <span className="badge badge-amber">
                  {assessedGaps.length} Priority Deltas
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {assessedGaps.map((gap, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #fed7aa",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <strong
                        style={{ fontSize: "13px", color: "var(--on-surface)" }}
                      >
                        {CATEGORY_NAMES[gap.category_code] || gap.category_code}
                      </strong>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          display: "block",
                        }}
                      >
                        Candidate at L{gap.candidate_level ?? "0"} vs Company
                        benchmark L{gap.required_level}. Target delta:{" "}
                        {gap.delta ?? gap.candidate_level - gap.required_level}.
                      </span>
                    </div>

                    <Link to="/profile" className="btn btn-secondary btn-xs">
                      Update Profile Evidence <ArrowRight size={13} />
                    </Link>
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
