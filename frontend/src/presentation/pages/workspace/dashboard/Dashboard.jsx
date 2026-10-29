import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  FileCheck2,
  FileText,
  Layers,
  MoreVertical,
  Plus,
  Radio,
  RotateCcw,
  Shield,
  Sparkles,
  Target,
  UploadCloud,
  UserCheck,
  UserRound,
  Zap,
} from "lucide-react";
import {
  jobs as benchmarkJobs,
  candidates as benchmarkCandidates,
} from "../../../../infrastructure/demo/demoData";
import { updateProfile } from "../../../../application/store/appSlice";

export function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.app.profile);
  const user = useSelector((state) => state.app.user);
  const latestReadiness = useSelector(
    (state) => state.app.latestReadinessResult,
  );
  const latestMatching = profile.lastMatchingResult;
  const jobAnalyses = profile.jobAnalyses || [];

  const candidateName = profile.name || user?.name;
  const firstName = candidateName ? candidateName.split(" ")[0] : null;

  const [activeTab, setActiveTab] = useState("all");
  const [emptyStateMode, setEmptyStateMode] = useState(false);

  // Compute real state-derived metrics
  const skillsCount = (profile.skills || []).length;
  const assessedCategories = useMemo(() => {
    const set = new Set();
    (profile.skills || []).forEach((s) => {
      if (typeof s === "object" && s.category_code) {
        set.add(s.category_code);
      }
    });
    return set;
  }, [profile.skills]);

  // Merge official benchmark roles and user-analyzed roles
  const allJobs = useMemo(() => {
    const list = benchmarkJobs.map((job, idx) => ({
      id: `benchmark-${idx}`,
      title: job.role,
      company: job.company,
      type: "Official Benchmark",
      tags: (job.tags || []).slice(0, 3).join(" · "),
      source: "data/ PDF",
      category: job.company.toLowerCase().includes("google")
        ? "google"
        : job.company.toLowerCase().includes("microsoft")
          ? "microsoft"
          : "oracle",
    }));

    (jobAnalyses || []).forEach((ja, idx) => {
      list.unshift({
        id: ja.id || `custom-${idx}`,
        title: ja.role || ja.title || "Custom Job Description",
        company: ja.company || "Custom Ingestion",
        type: "User Analyzed",
        tags: (ja.skills || [])
          .slice(0, 3)
          .map((s) => s.skill_name)
          .join(" · "),
        source: ja.source_file || "Uploaded Document",
        category: "custom",
      });
    });

    return list;
  }, [jobAnalyses]);

  const filteredJobs = useMemo(() => {
    if (activeTab === "google") {
      return allJobs.filter((j) => j.category === "google");
    }
    if (activeTab === "microsoft") {
      return allJobs.filter((j) => j.category === "microsoft");
    }
    if (activeTab === "oracle") {
      return allJobs.filter((j) => j.category === "oracle");
    }
    return allJobs;
  }, [allJobs, activeTab]);

  function loadCandidate(cand) {
    dispatch(
      updateProfile({
        name: cand.name,
        email: cand.email,
        role: cand.role,
        education: cand.education,
        university: cand.university,
        year: cand.year,
        skills: cand.skills,
        experience: cand.experience,
        projects: cand.projects,
        resumeExtractedAt: new Date().toISOString(),
      }),
    );
  }

  const activity = useMemo(() => {
    const items = [];

    if (latestMatching?.role) {
      items.push({
        icon: Sparkles,
        title: `Skill match: ${latestMatching.role}`,
        detail: `${latestMatching.company || "Target Role"} · ${latestMatching.score ?? 0}% match score`,
        time: "Just now",
        status: "Computed",
        color: "emerald",
      });
    }

    if (latestReadiness?.company) {
      items.push({
        icon: Target,
        title: `Talent Check: ${latestReadiness.company}`,
        detail: `Readiness score: ${latestReadiness.readiness_score ?? "N/A"}% · Coverage: ${latestReadiness.coverage_percent ?? 0}%`,
        time: "Session",
        status: "Audited",
        color: "sky",
      });
    }

    if (profile.name) {
      items.push({
        icon: UserCheck,
        title: `Active candidate: ${profile.name}`,
        detail: `${skillsCount} skills mapped across ${assessedCategories.size} RADIX categories`,
        time: profile.resumeExtractedAt ? "Parsed" : "Loaded",
        status: profile.backendProfileId ? "Synced" : "Local",
        color: "indigo",
      });
    }

    if (jobAnalyses.length > 0) {
      const latestJd = jobAnalyses[0];
      items.push({
        icon: Activity,
        title: `JD analyzed: ${latestJd.role || latestJd.company || "Job spec"}`,
        detail: `${(latestJd.skills || []).length} technical requirements extracted`,
        time: "Analyzed",
        status: "Ready",
        color: "amber",
      });
    }

    return items;
  }, [
    profile,
    latestMatching,
    latestReadiness,
    jobAnalyses,
    skillsCount,
    assessedCategories,
  ]);

  return (
    <div className="dashboard-container">
      {/* Executive Greeting & Action Bar */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <div className="hero-status-tag">
            <span className="status-dot-pulse" />
            <span>Operational Workspace · 12 RADIX Categories</span>
          </div>
          <h1 className="hero-greeting">
            {firstName
              ? `Welcome back, ${firstName}`
              : "Welcome to RADIX Talent Match"}
          </h1>
          <p className="hero-subtext">
            Enterprise candidate profiling, organizational readiness benchmarks,
            and 1:1 job description skill matching across all 5 integrated
            modules.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={() => navigate("/resume")}
          >
            <UploadCloud size={16} /> Import Resume
          </button>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => navigate("/analytics")}
          >
            <Plus size={16} /> Analyze Job Description
          </button>
        </div>
      </section>

      {/* 4 Top Telemetry KPI Cards - Strictly Grounded in Real Data */}
      <section className="kpi-grid" aria-label="Key Performance Indicators">
        <div className="kpi-card" onClick={() => navigate("/analytics")}>
          <div className="kpi-top">
            <span className="kpi-label">Roles in Scope</span>
            <span className="kpi-icon-box bg-indigo-light text-indigo">
              <BriefcaseBusiness size={18} />
            </span>
          </div>
          <div className="kpi-metric-row">
            <span className="kpi-number">{allJobs.length}</span>
            <span className="kpi-pill success">6 Official Benchmarks</span>
          </div>
          <div className="kpi-footer">
            <span>Google, Microsoft & Oracle</span>
            <span className="kpi-link">
              Explore roles <ArrowRight size={13} />
            </span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate("/profile")}>
          <div className="kpi-top">
            <span className="kpi-label">Active Candidate Profile</span>
            <span className="kpi-icon-box bg-sky-light text-sky">
              <UserRound size={18} />
            </span>
          </div>
          <div className="kpi-metric-row">
            <span
              className="kpi-number"
              style={{
                fontSize: profile.name ? "18px" : "16px",
                fontWeight: 700,
              }}
            >
              {profile.name || "None Selected"}
            </span>
            <span
              className={`kpi-pill ${profile.backendProfileId ? "success" : profile.name ? "info" : "neutral"}`}
            >
              {profile.backendProfileId
                ? "DB Synced"
                : profile.name
                  ? "Local Draft"
                  : "Not Loaded"}
            </span>
          </div>
          <div className="kpi-footer">
            <span>
              {skillsCount > 0
                ? `${skillsCount} skills configured`
                : "Select or import profile"}
            </span>
            <span className="kpi-link">
              Edit profile <ArrowRight size={13} />
            </span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate("/profile")}>
          <div className="kpi-top">
            <span className="kpi-label">RADIX Competencies</span>
            <span className="kpi-icon-box bg-emerald-light text-emerald">
              <Layers size={18} />
            </span>
          </div>
          <div className="kpi-metric-row">
            <span className="kpi-number">{assessedCategories.size}/12</span>
            <span className="kpi-pill success">
              {assessedCategories.size >= 6
                ? "Broad Coverage"
                : "Core Categories"}
            </span>
          </div>
          <div className="kpi-footer">
            <span>COD, DSA, SYS, SQL, AI, CLOUD...</span>
            <span className="kpi-link">
              View matrix <ArrowRight size={13} />
            </span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate("/talent-check")}>
          <div className="kpi-top">
            <span className="kpi-label">Enterprise Readiness</span>
            <span className="kpi-icon-box bg-amber-light text-amber">
              <Target size={18} />
            </span>
          </div>
          <div className="kpi-metric-row">
            <span className="kpi-number">
              {latestReadiness?.readiness_score != null
                ? `${latestReadiness.readiness_score}%`
                : latestMatching?.score != null
                  ? `${latestMatching.score}%`
                  : "Not Run"}
            </span>
            <span
              className={`kpi-pill ${latestReadiness ? "success" : "neutral"}`}
            >
              {latestReadiness ? latestReadiness.company : "3 Target Bars"}
            </span>
          </div>
          <div className="kpi-footer">
            <span>
              {latestReadiness
                ? `${latestReadiness.coverage_percent}% coverage evaluated`
                : "Run Talent Check on company"}
            </span>
            <span className="kpi-link">
              Evaluate <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </section>

      {/* Guided Pipeline Sequence */}
      <section className="pipeline-sequence-section">
        <div className="sequence-header">
          <div>
            <div className="section-eyebrow">WORKFLOW ORCHESTRATION</div>
            <h2 className="sequence-title">Guided Pipeline Sequence</h2>
            <p className="sequence-subtitle">
              Follow the end-to-end evaluation flow from document ingestion to
              verified candidate matching.
            </p>
          </div>
          <div className="sequence-actions">
            <Link to="/analytics" className="btn btn-secondary btn-sm">
              <Zap size={14} /> Open Pipeline Flow
            </Link>
          </div>
        </div>

        <div className="pipeline-steps-grid">
          {/* Step 1 */}
          <Link
            to="/analytics"
            className={`pipeline-step-box ${jobAnalyses.length > 0 ? "step-completed" : "step-active"}`}
          >
            <div className="step-header">
              <span
                className={`step-badge-pill ${jobAnalyses.length > 0 ? "completed" : "active"}`}
              >
                {jobAnalyses.length > 0 ? (
                  <Check size={12} />
                ) : (
                  <Radio size={12} className="pulse-icon" />
                )}
                {jobAnalyses.length > 0 ? "Analyzed" : "Active"}
              </span>
              <span className="step-index">01</span>
            </div>
            <h4 className="step-name">1. JD Analytics</h4>
            <p className="step-summary">
              {jobAnalyses.length > 0
                ? `${jobAnalyses.length} custom JDs parsed`
                : "6 benchmark roles available"}
            </p>
            <div className="step-detail">
              <Activity size={14} className="text-indigo" />
              <span>12 RADIX Categories</span>
            </div>
          </Link>

          {/* Step 2 */}
          <Link
            to="/resume"
            className={`pipeline-step-box ${profile.resumeExtractedAt ? "step-completed" : "step-ready"}`}
          >
            <div className="step-header">
              <span
                className={`step-badge-pill ${profile.resumeExtractedAt ? "completed" : "ready"}`}
              >
                {profile.resumeExtractedAt ? <Check size={12} /> : null}
                {profile.resumeExtractedAt ? "Extracted" : "Ready"}
              </span>
              <span className="step-index">02</span>
            </div>
            <h4 className="step-name">2. Resume Parsing</h4>
            <p className="step-summary">
              {profile.resumeExtractedAt
                ? "Candidate extracted"
                : "4 benchmark resumes available"}
            </p>
            <div className="step-detail">
              <FileText size={14} className="text-sky" />
              <span>Reviewable Proficiency</span>
            </div>
          </Link>

          {/* Step 3 */}
          <Link
            to="/profile"
            className={`pipeline-step-box ${profile.name ? "step-completed" : "step-ready"}`}
          >
            <div className="step-header">
              <span
                className={`step-badge-pill ${profile.name ? "completed" : "ready"}`}
              >
                {profile.name ? <Check size={12} /> : null}
                {profile.backendProfileId
                  ? "Synced"
                  : profile.name
                    ? "Configured"
                    : "Draft"}
              </span>
              <span className="step-index">03</span>
            </div>
            <h4 className="step-name">3. Profile Builder</h4>
            <p className="step-summary">
              {profile.name
                ? `${profile.name} (${skillsCount} skills)`
                : "Shared candidate source of truth"}
            </p>
            <div className="step-detail">
              <Sparkles size={14} className="text-emerald" />
              <span>Database Persistence</span>
            </div>
          </Link>

          {/* Step 4 */}
          <Link
            to="/talent-check"
            className={`pipeline-step-box ${latestReadiness ? "step-completed" : "step-ready"}`}
          >
            <div className="step-header">
              <span
                className={`step-badge-pill ${latestReadiness ? "completed" : "ready"}`}
              >
                {latestReadiness ? <Check size={12} /> : null}
                {latestReadiness ? "Audited" : "Ready"}
              </span>
              <span className="step-index">04</span>
            </div>
            <h4 className="step-name">4. Talent Check</h4>
            <p className="step-summary">
              {latestReadiness
                ? `${latestReadiness.company} (${latestReadiness.readiness_score}%)`
                : "Google, Microsoft & Oracle bars"}
            </p>
            <div className="step-detail">
              <Shield size={14} className="text-amber" />
              <span>12 Competency Delta</span>
            </div>
          </Link>

          {/* Step 5 */}
          <Link
            to="/matching"
            className={`pipeline-step-box ${latestMatching ? "step-completed" : "step-next"}`}
          >
            <div className="step-header">
              <span
                className={`step-badge-pill ${latestMatching ? "completed" : "next"}`}
              >
                {latestMatching ? <Check size={12} /> : null}
                {latestMatching ? "Matched" : "Next Step"}
              </span>
              <span className="step-index">05</span>
            </div>
            <h4 className="step-name">5. Skill Matching</h4>
            <p className="step-summary">
              {latestMatching
                ? `${latestMatching.role}: ${latestMatching.score}%`
                : "1:1 specific posting fit"}
            </p>
            <div className="step-detail">
              <Target size={14} className="text-rose" />
              <span>Prioritized Gap Analysis</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Grid: Roles Table on Left + Profile / Quick Picker on Right */}
      <div className="dashboard-main-grid">
        {/* Left Column: Official Benchmark & Analyzed Roles */}
        <section className="dashboard-table-card">
          <div className="card-top-header">
            <div className="table-heading-meta">
              <h3>Job Requisitions & Benchmarks</h3>
              <span className="count-pill">{allJobs.length} roles</span>
            </div>

            <div className="table-filter-tabs">
              <button
                type="button"
                className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All ({allJobs.length})
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === "google" ? "active" : ""}`}
                onClick={() => setActiveTab("google")}
              >
                Google (2)
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === "microsoft" ? "active" : ""}`}
                onClick={() => setActiveTab("microsoft")}
              >
                Microsoft (2)
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === "oracle" ? "active" : ""}`}
                onClick={() => setActiveTab("oracle")}
              >
                Oracle (2)
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="executive-table">
              <thead>
                <tr>
                  <th>Job Role & Core Focus</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Dataset Type</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className="role-cell">
                        <strong className="role-title">{job.title}</strong>
                        <span className="role-dept">{job.tags}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="company-text"
                        style={{ fontWeight: 600 }}
                      >
                        {job.company}
                      </span>
                    </td>
                    <td>
                      <span className="time-text">{job.source}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          job.type === "Official Benchmark"
                            ? "badge-success"
                            : "badge-neutral"
                        }`}
                      >
                        {job.type}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="actions-cell">
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => navigate("/analytics")}
                        >
                          Analyze
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={() => navigate("/matching")}
                        >
                          Match
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Active Profile & Benchmark Candidates Picker */}
        <aside className="dashboard-side-column">
          {/* Active Profile Status */}
          <div className="side-widget convergence-widget">
            <div className="widget-header">
              <div className="widget-title-row">
                <UserRound size={16} className="text-indigo" />
                <h4>Active Candidate Status</h4>
              </div>
              <span
                className={`badge ${profile.backendProfileId ? "badge-emerald" : profile.name ? "badge-indigo" : "badge-neutral"}`}
              >
                {profile.backendProfileId
                  ? "Persisted in DB"
                  : profile.name
                    ? "Local Session"
                    : "No Profile"}
              </span>
            </div>

            {profile.name ? (
              <div style={{ padding: "8px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "14px",
                        color: "var(--color-text)",
                      }}
                    >
                      {profile.name}
                    </strong>
                    <small style={{ color: "var(--color-text-muted)" }}>
                      {profile.education ||
                        profile.university ||
                        profile.role ||
                        "Candidate Profile"}
                    </small>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    padding: "8px 0",
                    borderTop: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Configured Skills
                  </span>
                  <strong>
                    {skillsCount} skills ({assessedCategories.size} categories)
                  </strong>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <Link
                    to="/profile"
                    className="btn btn-secondary btn-xs"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Edit in Builder
                  </Link>
                  <Link
                    to="/talent-check"
                    className="btn btn-primary btn-xs"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Run Talent Check
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ padding: "12px 0", textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-muted)",
                    margin: "0 0 12px 0",
                  }}
                >
                  No candidate profile loaded. Choose an official benchmark
                  candidate below or upload a resume.
                </p>
                <Link to="/resume" className="btn btn-primary btn-xs">
                  <UploadCloud size={14} /> Upload Resume
                </Link>
              </div>
            )}
          </div>

          {/* Benchmark Candidate Quick Picker */}
          <div className="side-widget modules-launcher-widget">
            <div className="widget-header">
              <div className="widget-title-row">
                <Sparkles size={16} className="text-indigo" />
                <h4>Official Benchmark Candidates</h4>
              </div>
              <span className="count-pill">4 Candidates</span>
            </div>

            <div className="launcher-list">
              {benchmarkCandidates.map((cand) => {
                const isSelected = profile.name === cand.name;
                return (
                  <div
                    key={cand.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: isSelected
                        ? "1px solid var(--color-primary)"
                        : "1px solid var(--color-border-subtle)",
                      backgroundColor: isSelected
                        ? "var(--color-primary-light)"
                        : "var(--color-surface)",
                      marginBottom: "6px",
                    }}
                  >
                    <div>
                      <b
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "var(--color-text)",
                        }}
                      >
                        {cand.name}
                      </b>
                      <small
                        style={{
                          color: "var(--color-text-muted)",
                          fontSize: "11px",
                        }}
                      >
                        {cand.university} · {cand.role}
                      </small>
                    </div>

                    <button
                      type="button"
                      className={`btn ${isSelected ? "btn-primary" : "btn-secondary"} btn-xs`}
                      onClick={() => loadCandidate(cand)}
                    >
                      {isSelected ? "Active" : "Load"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Modules Quick Launcher */}
          <div className="side-widget modules-launcher-widget">
            <div className="widget-header">
              <div className="widget-title-row">
                <Layers size={16} className="text-indigo" />
                <h4>Core Modules</h4>
              </div>
              <span className="count-pill">5 Tools</span>
            </div>

            <div className="launcher-list">
              <Link to="/analytics" className="launcher-item">
                <div className="launcher-icon text-indigo bg-indigo-light">
                  <Activity size={16} />
                </div>
                <div className="launcher-copy">
                  <b>01 JD Analytics</b>
                  <span>Extract requirements & weights</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>

              <Link to="/resume" className="launcher-item">
                <div className="launcher-icon text-sky bg-sky-light">
                  <FileText size={16} />
                </div>
                <div className="launcher-copy">
                  <b>02 Resume Parsing</b>
                  <span>Extract signals & review levels</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>

              <Link to="/profile" className="launcher-item">
                <div className="launcher-icon text-emerald bg-emerald-light">
                  <UserRound size={16} />
                </div>
                <div className="launcher-copy">
                  <b>03 Profile Builder</b>
                  <span>One shared profile saved to DB</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>

              <Link to="/talent-check" className="launcher-item">
                <div className="launcher-icon text-amber bg-amber-light">
                  <Target size={16} />
                </div>
                <div className="launcher-copy">
                  <b>04 Talent Check</b>
                  <span>Evaluate company readiness bar</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>

              <Link to="/matching" className="launcher-item">
                <div className="launcher-icon text-rose bg-rose-light">
                  <Sparkles size={16} />
                </div>
                <div className="launcher-copy">
                  <b>05 Skill Matching</b>
                  <span>Specific JD fit & gap analysis</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="side-widget activity-widget">
            <div className="widget-header">
              <div className="widget-title-row">
                <Clock size={16} className="text-indigo" />
                <h4>Session Activity</h4>
              </div>
              <span className="count-pill">{activity.length} Items</span>
            </div>

            <div className="activity-feed-list">
              {activity.length > 0 ? (
                activity.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div className="feed-item" key={idx}>
                      <div
                        className={`feed-icon-box bg-${item.color}-light text-${item.color}`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="feed-content">
                        <p className="feed-title">{item.title}</p>
                        <span className="feed-detail">{item.detail}</span>
                        <div className="feed-meta">
                          <span className={`badge badge-${item.color}`}>
                            {item.status}
                          </span>
                          <span className="feed-time">· {item.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                    fontSize: "12px",
                  }}
                >
                  No actions recorded in current session. Select a benchmark
                  candidate or analyze a job description to get started.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
