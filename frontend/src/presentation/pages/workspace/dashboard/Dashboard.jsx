import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock,
  Compass,
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

export function Dashboard() {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.app.profile);
  const user = useSelector((state) => state.app.user);
  const latestReadiness = useSelector(
    (state) => state.app.latestReadinessResult,
  );
  const name = user?.name || profile.name || "Sarah Chen";
  const firstName = name.split(" ")[0];

  const jobAnalyses = profile.jobAnalyses || [];
  const latestMatching = profile.lastMatchingResult;

  const [activeTab, setActiveTab] = useState("all");
  const [emptyStateMode, setEmptyStateMode] = useState(false);

  // Benchmark JDs list for recent activity & table
  const sampleJobs = [
    {
      id: "job-1",
      title: "Lead Product Designer",
      dept: "Design Systems · Staff Band",
      company: "Radix Core Labs",
      added: "2 hrs ago",
      readiness: 94,
      status: "Active",
      category: "active",
    },
    {
      id: "job-2",
      title: "Senior Distributed Systems Engineer",
      dept: "Platform Eng · Core Infra",
      company: "FinScale Inc",
      added: "Yesterday",
      readiness: 88,
      status: "Active",
      category: "active",
    },
    {
      id: "job-3",
      title: "VP of Enterprise Sales",
      dept: "GTM · North America",
      company: "CloudStack",
      added: "3 days ago",
      readiness: 76,
      status: "In Review",
      category: "review",
    },
    {
      id: "job-4",
      title: "Staff ML Scientist (NLP)",
      dept: "AI Research · Reasoning Core",
      company: "Cortex Bio",
      added: "Oct 24",
      readiness: 91,
      status: "Active",
      category: "active",
    },
    {
      id: "job-5",
      title: "Principal Cloud Security Architect",
      dept: "SecOps · Zero Trust Fleet",
      company: "HyperScale Labs",
      added: "Oct 22",
      readiness: 83,
      status: "In Review",
      category: "review",
    },
    {
      id: "job-6",
      title: "Lead Full Stack Engineer",
      dept: "Product Apps · Web Guild",
      company: "Nexus Labs",
      added: "Oct 20",
      readiness: 89,
      status: "Active",
      category: "active",
    },
  ];

  const filteredJobs = useMemo(() => {
    if (activeTab === "active") {
      return sampleJobs.filter((j) => j.category === "active");
    }
    if (activeTab === "review") {
      return sampleJobs.filter((j) => j.category === "review");
    }
    return sampleJobs;
  }, [activeTab]);

  const activity = useMemo(() => {
    const items = [];

    if (latestMatching?.createdAt) {
      items.push({
        icon: Sparkles,
        title: `Skill match computed for ${latestMatching.role}`,
        detail: `${latestMatching.company || "Target Role"} · ${latestMatching.score ?? 0}% match score`,
        time: "12m ago",
        status: "Completed",
        color: "emerald",
      });
    }

    if (profile.resumeExtractedAt) {
      items.push({
        icon: FileText,
        title: `Resume extracted: ${profile.name || "Candidate Profile"}`,
        detail: `${profile.skills?.length || 0} skills mapped across 12 RADIX categories`,
        time: "42m ago",
        status: "Completed",
        color: "indigo",
      });
    }

    if (latestReadiness) {
      items.push({
        icon: Target,
        title: `Talent Check audit: ${latestReadiness.company}`,
        detail: `Readiness score: ${latestReadiness.readiness_score ?? "N/A"}% · Coverage: ${latestReadiness.coverage_percent ?? 0}%`,
        time: "1h ago",
        status: "Audited",
        color: "sky",
      });
    }

    // Default items
    items.push(
      {
        icon: Activity,
        title: "Completed skill extraction for Senior ML Scientist",
        detail:
          "Extracted 14 technical skills & 4 architectural responsibilities",
        time: "2h ago",
        status: "Completed",
        color: "emerald",
      },
      {
        icon: UserCheck,
        title: "Profile generated for Candidate #894 (Elena Vance)",
        detail: "18 fields parsed from resume · Synced to Supabase",
        time: "3h ago",
        status: "Completed",
        color: "indigo",
      },
      {
        icon: Shield,
        title: "Talent verification flagged 1 credential anomaly",
        detail: "Requires manual audit before pipeline advancement",
        time: "Yesterday",
        status: "Requires Audit",
        color: "amber",
      },
    );

    return items.slice(0, 5);
  }, [profile, latestMatching, latestReadiness]);

  return (
    <div className="dashboard-container">
      {/* Executive Greeting & Action Bar */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <div className="hero-status-tag">
            <span className="status-dot-pulse" />
            <span>Workspace Active · Executive Precision v2.4</span>
          </div>
          <h1 className="hero-greeting">Welcome back, {firstName}</h1>
          <p className="hero-subtext">
            Here is your talent acquisition pipeline overview across active
            roles, calibrated assessment tracks, and algorithmic candidate
            matches.
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

      {/* 4 Top Telemetry KPI Cards */}
      <section className="kpi-grid" aria-label="Key Performance Indicators">
        <div className="kpi-card" onClick={() => navigate("/analytics")}>
          <div className="kpi-top">
            <span className="kpi-label">Saved Job Descriptions</span>
            <span className="kpi-icon-box bg-indigo-light text-indigo">
              <BriefcaseBusiness size={18} />
            </span>
          </div>
          <div className="kpi-metric-row">
            <span className="kpi-number">38</span>
            <span className="kpi-pill success">+4 this week</span>
          </div>
          <div className="kpi-footer">
            <span>Active roles: 24</span>
            <span className="kpi-link">
              Review pool <ArrowRight size={13} />
            </span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate("/resume")}>
          <div className="kpi-top">
            <span className="kpi-label">Parsed Resumes</span>
            <span className="kpi-icon-box bg-sky-light text-sky">
              <FileText size={18} />
            </span>
          </div>
          <div className="kpi-metric-row">
            <span className="kpi-number">1,420</span>
            <span className="kpi-pill info">98.4% parsed</span>
          </div>
          <div className="kpi-footer">
            <span>Avg latency: 1.2s/doc</span>
            <span className="kpi-link">
              Queue logs <ArrowRight size={13} />
            </span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate("/profile")}>
          <div className="kpi-top">
            <span className="kpi-label">Candidate Profiles</span>
            <span className="kpi-icon-box bg-emerald-light text-emerald">
              <UserRound size={18} />
            </span>
          </div>
          <div className="kpi-metric-row">
            <span className="kpi-number">{profile.name ? "895" : "894"}</span>
            <span className="kpi-pill success">312 high fit</span>
          </div>
          <div className="kpi-footer">
            <span>Active: {profile.name || "Alex Chen"}</span>
            <span className="kpi-link">
              View graphs <ArrowRight size={13} />
            </span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate("/talent-check")}>
          <div className="kpi-top">
            <span className="kpi-label">Completed Assessments</span>
            <span className="kpi-icon-box bg-amber-light text-amber">
              <Target size={18} />
            </span>
          </div>
          <div className="kpi-metric-row">
            <span className="kpi-number">147</span>
            <span className="kpi-pill warning">4.8/5 avg score</span>
          </div>
          <div className="kpi-footer">
            <span>Audit integrity: 100%</span>
            <span className="kpi-link">
              Audit records <ArrowRight size={13} />
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
              Track roles from raw description parsing to high-conviction
              algorithmic matches across all 5 integrated modules.
            </p>
          </div>
          <div className="sequence-actions">
            <Link to="/analytics" className="btn btn-secondary btn-sm">
              <Zap size={14} /> Resume In-Progress Flow
            </Link>
          </div>
        </div>

        <div className="pipeline-steps-grid">
          {/* Step 1 */}
          <Link to="/analytics" className="pipeline-step-box step-completed">
            <div className="step-header">
              <span className="step-badge-pill completed">
                <Check size={12} /> Completed
              </span>
              <span className="step-index">01</span>
            </div>
            <h4 className="step-name">1. JD Analysis</h4>
            <p className="step-summary">38 analyzed · Taxonomy ready</p>
            <div className="step-detail">
              <Activity size={14} className="text-indigo" />
              <span>Role Taxonomy Ready</span>
            </div>
          </Link>

          {/* Step 2 */}
          <Link to="/resume" className="pipeline-step-box step-active">
            <div className="step-header">
              <span className="step-badge-pill active">
                <Radio size={12} className="pulse-icon" /> Active
              </span>
              <span className="step-index">02</span>
            </div>
            <h4 className="step-name">2. Resume Parsing</h4>
            <p className="step-summary">14 pending files in queue</p>
            <div className="step-detail">
              <FileText size={14} className="text-sky" />
              <span>Streaming OCR Parser</span>
            </div>
          </Link>

          {/* Step 3 */}
          <Link to="/profile" className="pipeline-step-box step-ready">
            <div className="step-header">
              <span className="step-badge-pill ready">Ready</span>
              <span className="step-index">03</span>
            </div>
            <h4 className="step-name">3. Profile Builder</h4>
            <p className="step-summary">Auto-enrichment & DB Sync</p>
            <div className="step-detail">
              <Sparkles size={14} className="text-emerald" />
              <span>Semantic Synthesis</span>
            </div>
          </Link>

          {/* Step 4 */}
          <Link to="/talent-check" className="pipeline-step-box step-ready">
            <div className="step-header">
              <span className="step-badge-pill ready">Ready</span>
              <span className="step-index">04</span>
            </div>
            <h4 className="step-name">4. Talent Check</h4>
            <p className="step-summary">Verification protocols</p>
            <div className="step-detail">
              <Shield size={14} className="text-amber" />
              <span>Official Benchmarks</span>
            </div>
          </Link>

          {/* Step 5 */}
          <Link to="/matching" className="pipeline-step-box step-next">
            <div className="step-header">
              <span className="step-badge-pill next">Next Step</span>
              <span className="step-index">05</span>
            </div>
            <h4 className="step-name">5. Skill Matching</h4>
            <p className="step-summary">Multi-vector ranking</p>
            <div className="step-detail">
              <Target size={14} className="text-rose" />
              <span>Taxonomy Vector Fit</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Grid: Jobs Table on Left + Telemetry / Launcher on Right */}
      <div className="dashboard-main-grid">
        {/* Left Column: Recent Job Descriptions */}
        <section className="dashboard-table-card">
          <div className="card-top-header">
            <div className="table-heading-meta">
              <h3>Recent Job Descriptions</h3>
              <span className="count-pill">38 total</span>
            </div>

            <div className="table-filter-tabs">
              <button
                type="button"
                className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All (6)
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === "active" ? "active" : ""}`}
                onClick={() => setActiveTab("active")}
              >
                Active (4)
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === "review" ? "active" : ""}`}
                onClick={() => setActiveTab("review")}
              >
                Drafts (2)
              </button>
            </div>

            <button
              type="button"
              className="toggle-empty-state-btn"
              onClick={() => setEmptyStateMode(!emptyStateMode)}
              title="Toggle empty state view to verify newly provisioned experience"
            >
              <RotateCcw size={13} />
              <span>
                {emptyStateMode ? "Show Demo Data" : "Test Zero State"}
              </span>
            </button>
          </div>

          {emptyStateMode ? (
            <div className="empty-state-container">
              <div className="empty-icon-box">
                <BriefcaseBusiness size={28} />
              </div>
              <h4>No job descriptions parsed yet</h4>
              <p>
                Upload your first JD document (.pdf, .docx, or paste raw text)
                to start the matching pipeline and build semantic candidate
                profiles.
              </p>
              <div className="empty-state-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={() => navigate("/analytics")}
                >
                  <UploadCloud size={16} /> Upload First JD
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => navigate("/analytics")}
                >
                  Paste Job Text
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="executive-table">
                <thead>
                  <tr>
                    <th>Job Role & Department</th>
                    <th>Company / Entity</th>
                    <th>Added</th>
                    <th>Match Readiness</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className="role-cell">
                          <strong className="role-title">{job.title}</strong>
                          <span className="role-dept">{job.dept}</span>
                        </div>
                      </td>
                      <td>
                        <span className="company-text">{job.company}</span>
                      </td>
                      <td>
                        <span className="time-text">{job.added}</span>
                      </td>
                      <td>
                        <div className="readiness-cell">
                          <div className="readiness-bar-track">
                            <div
                              className="readiness-bar-fill"
                              style={{ width: `${job.readiness}%` }}
                            />
                          </div>
                          <span className="readiness-pct">
                            {job.readiness}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            job.status === "Active"
                              ? "badge-success"
                              : "badge-neutral"
                          }`}
                        >
                          {job.status}
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
                            className="icon-action-btn"
                            aria-label="More options"
                            onClick={() => navigate("/matching")}
                          >
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Right Column: Telemetry Convergence, Modules Launcher, Activity */}
        <aside className="dashboard-side-column">
          {/* Algorithmic Match Convergence */}
          <div className="side-widget convergence-widget">
            <div className="widget-header">
              <div className="widget-title-row">
                <Sparkles size={16} className="text-indigo" />
                <h4>Algorithmic Match Convergence</h4>
              </div>
              <span className="badge badge-indigo">Scoring v2.4</span>
            </div>

            <div className="convergence-metrics">
              <div className="convergence-row">
                <div className="convergence-meta">
                  <span>Skill Complementarity</span>
                  <strong>94.8%</strong>
                </div>
                <div className="convergence-progress">
                  <div
                    className="convergence-bar bg-indigo"
                    style={{ width: "94.8%" }}
                  />
                </div>
                <small className="text-emerald">
                  +3.2% vs baseline standard
                </small>
              </div>

              <div className="convergence-row">
                <div className="convergence-meta">
                  <span>Seniority & Leadership Scope</span>
                  <strong>88.2%</strong>
                </div>
                <div className="convergence-progress">
                  <div
                    className="convergence-bar bg-sky"
                    style={{ width: "88.2%" }}
                  />
                </div>
                <small className="text-muted">Calibrated across 8+ years</small>
              </div>

              <div className="convergence-row">
                <div className="convergence-meta">
                  <span>Market Calibration</span>
                  <strong>92.0%</strong>
                </div>
                <div className="convergence-progress">
                  <div
                    className="convergence-bar bg-emerald"
                    style={{ width: "92%" }}
                  />
                </div>
                <small className="text-emerald">97th Percentile</small>
              </div>
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
                  <b>JD Analytics</b>
                  <span>Extract requirements & weights</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>

              <Link to="/resume" className="launcher-item">
                <div className="launcher-icon text-sky bg-sky-light">
                  <FileText size={16} />
                </div>
                <div className="launcher-copy">
                  <b>Resume Parsing</b>
                  <span>Structured neural parser</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>

              <Link to="/profile" className="launcher-item">
                <div className="launcher-icon text-emerald bg-emerald-light">
                  <UserRound size={16} />
                </div>
                <div className="launcher-copy">
                  <b>Profile Builder</b>
                  <span>Deep skill graphs & histories</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>

              <Link to="/talent-check" className="launcher-item">
                <div className="launcher-icon text-amber bg-amber-light">
                  <Target size={16} />
                </div>
                <div className="launcher-copy">
                  <b>Talent Check</b>
                  <span>Credential & benchmark audits</span>
                </div>
                <ArrowRight size={14} className="launcher-arrow" />
              </Link>

              <Link to="/matching" className="launcher-item">
                <div className="launcher-icon text-rose bg-rose-light">
                  <Sparkles size={16} />
                </div>
                <div className="launcher-copy">
                  <b>Skill Matching</b>
                  <span>Weighted taxonomy ranking</span>
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
                <h4>Recent Activity</h4>
              </div>
              <span className="count-pill">Live Feed</span>
            </div>

            <div className="activity-feed-list">
              {activity.map((item, idx) => {
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
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
