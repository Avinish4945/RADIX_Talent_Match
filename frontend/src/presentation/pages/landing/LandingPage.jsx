import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Layers,
  Lock,
  Network,
  Shield,
  Sparkles,
  Target,
  Terminal,
  UserCheck,
  UserRound,
  Zap,
} from "lucide-react";

export function LandingPage() {
  const [activeTab, setActiveTab] = useState("jd");

  const modules = [
    {
      id: "MOD-01",
      number: "01",
      title: "JD Analytics",
      category: "LLM EXTRACTION",
      to: "/analytics",
      icon: Activity,
      color: "indigo",
      tagline: "Taxonomy Normalization & Weighted Role Deconstruction",
      description:
        "Deconstructs unstructured job descriptions (PDF/DOCX) into normalized technical competencies across the 12 RADIX categories, complete with role seniority bands and importance weights.",
      features: [
        "ESCO & O*NET 28.1 taxonomy mapping",
        "Deterministic weights (Must-have vs Preferred)",
        "Contextual sentence extraction for proof quotes",
      ],
      stat: "142 JDs Parsed",
    },
    {
      id: "MOD-02",
      number: "02",
      title: "Resume Parsing",
      category: "NEURAL EXTRACTION",
      to: "/resume",
      icon: FileText,
      color: "blue",
      tagline: "Structured Evidence Extraction & Anti-Gaming",
      description:
        "Transforms dense candidate CVs into rich, structured competency graphs. Pulls education, employment history, flagship projects, and flagged heuristic proficiency estimates for candidate review.",
      features: [
        "Tolerance for varied PDF/DOCX layouts",
        "Clear heuristic proficiency alerts requiring review",
        "Extracts verifiable project & publication proof",
      ],
      stat: "98.4% Extraction Fidelity",
    },
    {
      id: "MOD-03",
      number: "03",
      title: "Profile Builder",
      category: "PLAIN CODE & PERSISTENCE",
      to: "/profile",
      icon: UserRound,
      color: "emerald",
      tagline: "One Shared Source of Truth Across All Modules",
      description:
        "Unified candidate profile editor supporting personal coordinates, granular 1-10 skill proficiencies across 12 RADIX categories, internships, hackathons, and direct Supabase database persistence.",
      features: [
        "One shared profile feeding all downstream modules",
        "Real POST /api/profiles persistence with retained ID",
        "Real-time completeness score & sync status",
      ],
      stat: "100% Database Sync",
    },
    {
      id: "MOD-04",
      number: "04",
      title: "Talent Check",
      category: "PLAIN CODE COMPARISON",
      to: "/talent-check",
      icon: Target,
      color: "amber",
      tagline: "Official Company Skillset Readiness Audits",
      description:
        "One-click evaluation comparing candidate skills against verified benchmark bars (Google LLC, Microsoft, Oracle) across all 12 RADIX categories, computing readiness scores and gap breakdowns.",
      features: [
        "Verified benchmark datasets for Tier-1 companies",
        "Deterministic per-skillset delta computation",
        "Zero black-box ranking with transparent gap lists",
      ],
      stat: "3 Official Benchmarks",
    },
    {
      id: "MOD-05",
      number: "05",
      title: "Skill Matching",
      category: "FUZZY & TAXONOMY MATCH",
      to: "/matching",
      icon: Sparkles,
      color: "rose",
      tagline: "Role-Specific Multi-Vector Fit & Gap Analysis",
      description:
        "Compares a candidate's profile against a specific extracted job description. Calculates match percentage and prioritizes what is missing over raw scores so candidates and recruiters know exact growth actions.",
      features: [
        "Deterministic backend matching algorithm",
        "Prioritized missing skills gap breakdown",
        "Cross-category competency coverage visualization",
      ],
      stat: "Auditable Match Logic",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Ingest & Deconstruct JD",
      module: "JD Analytics",
      description:
        "Upload a job spec (or select one of the 6 benchmark roles). The system decomposes natural prose into core competency pillars and requirement tiers.",
    },
    {
      num: "02",
      title: "Parse Candidate Resume",
      module: "Resume Parsing",
      description:
        "Ingest candidate resumes with multi-format tolerance. Extract skills, projects, and credentials while highlighting heuristic proficiency estimates for confirmation.",
    },
    {
      num: "03",
      title: "Consolidate Shared Profile",
      module: "Profile Builder",
      description:
        "Review pre-filled candidate details, calibrate 1-10 skill ratings, and commit to the database. This single profile feeds all assessment and matching tools.",
    },
    {
      num: "04",
      title: "Evaluate Company Readiness",
      module: "Talent Check",
      description:
        "Compare the candidate against official hiring expectations across all 12 RADIX skillsets for target companies like Google, Microsoft, and Oracle.",
    },
    {
      num: "05",
      title: "Score Algorithmic Fit",
      module: "Skill Matching",
      description:
        "Generate a transparent candidate-to-JD match score with explicit gap lists, matching proofs, and actionable qualification insights.",
    },
  ];

  return (
    <div className="landing-root">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <span className="brand-mark">R</span>
            <div className="brand-copy">
              <strong>RADIX</strong>
              <small>Talent Match</small>
            </div>
            <span className="landing-version-pill">v2.4</span>
          </Link>

          <nav className="landing-menu" aria-label="Main Navigation">
            <a href="#modules">Platform Modules</a>
            <a href="#pipeline">Interactive Pipeline</a>
            <a href="#workflow">How It Works</a>
            <a href="#architecture">Architecture</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Launch Workspace <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-eyebrow">
            <Sparkles size={14} className="landing-sparkle" />
            <span>
              AI-Powered Competency Intelligence & Recruitment Platform
            </span>
          </div>

          <h1 className="landing-title">
            Understand Your Skills.
            <br />
            <span className="text-gradient">Match Your Potential.</span>
          </h1>

          <p className="landing-subtitle">
            RADIX deconstructs unstructured job descriptions, extracts verified
            skills from candidate resumes, benchmarks enterprise readiness, and
            quantifies multidimensional candidate-to-job fit with auditable
            precision.
          </p>

          <div className="landing-hero-actions">
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Launch Workspace <ArrowRight size={16} />
            </Link>
            <a href="#pipeline" className="btn btn-secondary btn-lg">
              <Eye size={16} /> Explore Pipeline
            </a>
          </div>

          <div className="landing-trust-strip">
            <div className="trust-item">
              <Shield size={16} className="trust-icon text-emerald" />
              <span>Auditable semantic scoring</span>
            </div>
            <span className="trust-dot">•</span>
            <div className="trust-item">
              <Lock size={16} className="trust-icon text-indigo" />
              <span>Zero black-box ranking</span>
            </div>
            <span className="trust-dot">•</span>
            <div className="trust-item">
              <Zap size={16} className="trust-icon text-amber" />
              <span>Built for recruiters & career growth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pipeline Showcase */}
      <section id="pipeline" className="landing-section bg-surface-alt">
        <div className="section-container">
          <div className="section-header text-center">
            <div className="section-eyebrow">LIVE PIPELINE SHOWCASE</div>
            <h2>End-to-End Precision Convergence</h2>
            <p>
              See how RADIX seamlessly connects JD deconstruction, candidate
              evidence, and multidimensional readiness scoring in one continuous
              flow.
            </p>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-card-header">
              <div className="pipeline-context">
                <span className="target-pill">Target Role</span>
                <strong>Senior Distributed Systems Engineer</strong>
                <span className="dept-tag">Platform Eng · Infrastructure</span>
              </div>
              <div className="pipeline-candidate">
                <div className="candidate-badge">
                  <span className="candidate-avatar">AC</span>
                  <div>
                    <b>Alex Chen</b>
                    <small>Candidate Profile #894</small>
                  </div>
                </div>
                <div className="match-score-pill">
                  <span className="score-val">89%</span>
                  <span className="score-lbl">Match Score</span>
                </div>
              </div>
            </div>

            <div className="pipeline-tabs">
              <button
                type="button"
                className={`pipeline-tab ${activeTab === "jd" ? "active" : ""}`}
                onClick={() => setActiveTab("jd")}
              >
                <Activity size={16} />
                <span>1. JD Analytics</span>
                <span className="tab-badge">0.4s</span>
              </button>
              <button
                type="button"
                className={`pipeline-tab ${activeTab === "coverage" ? "active" : ""}`}
                onClick={() => setActiveTab("coverage")}
              >
                <FileCheck2 size={16} />
                <span>2. Skill Coverage & Evidence</span>
                <span className="tab-badge success">4/4 Clear</span>
              </button>
              <button
                type="button"
                className={`pipeline-tab ${activeTab === "talent" ? "active" : ""}`}
                onClick={() => setActiveTab("talent")}
              >
                <Target size={16} />
                <span>3. Talent Check Readiness</span>
                <span className="tab-badge primary">Calibrated</span>
              </button>
            </div>

            <div className="pipeline-tab-content">
              {activeTab === "jd" && (
                <div className="pipeline-pane">
                  <div className="pane-header">
                    <div>
                      <h4>Deconstructed Competency Pillars & Weights</h4>
                      <p>
                        Algorithmic extraction isolating 5 critical skill
                        categories and requirement distributions.
                      </p>
                    </div>
                    <span className="badge badge-success">100% Normalized</span>
                  </div>

                  <div className="weights-grid">
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          Distributed Systems (Raft / Paxos)
                        </span>
                        <span className="weight-tier must">Must-have</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "35%" }} />
                        <span className="weight-pct">35% Weight</span>
                      </div>
                    </div>
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          Go (Golang) & Concurrency Primitives
                        </span>
                        <span className="weight-tier must">Must-have</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "25%" }} />
                        <span className="weight-pct">25% Weight</span>
                      </div>
                    </div>
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          Kubernetes Operators & Cloud Native
                        </span>
                        <span className="weight-tier must">Must-have</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "20%" }} />
                        <span className="weight-pct">20% Weight</span>
                      </div>
                    </div>
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          Apache Kafka Event Streaming Pipelines
                        </span>
                        <span className="weight-tier nice">Nice-to-have</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "12%" }} />
                        <span className="weight-pct">12% Weight</span>
                      </div>
                    </div>
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          PostgreSQL Profiling & Partitioning
                        </span>
                        <span className="weight-tier nice">Nice-to-have</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "8%" }} />
                        <span className="weight-pct">8% Weight</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "coverage" && (
                <div className="pipeline-pane">
                  <div className="pane-header">
                    <div>
                      <h4>Verified Candidate Evidence Cross-Reference</h4>
                      <p>
                        Candidate signals cross-referenced against extracted
                        resume experience records, projects, and verified
                        credentials.
                      </p>
                    </div>
                    <span className="badge badge-success">
                      4 Critical Clear
                    </span>
                  </div>

                  <div className="evidence-list">
                    <div className="evidence-row">
                      <div className="evidence-head">
                        <span className="skill-name">Distributed Systems</span>
                        <span className="badge badge-emerald">
                          Verified 94%
                        </span>
                      </div>
                      <p className="evidence-proof">
                        <Check size={14} className="text-emerald" />{" "}
                        Demonstrated across 3 previous production roles: Raft
                        consensus storage engine yielding 150k QPS at ScaleOps
                        Inc.
                      </p>
                    </div>

                    <div className="evidence-row">
                      <div className="evidence-head">
                        <span className="skill-name">Go (Golang)</span>
                        <span className="badge badge-emerald">
                          Verified 92%
                        </span>
                      </div>
                      <p className="evidence-proof">
                        <Check size={14} className="text-emerald" />{" "}
                        High-concurrency event loops, custom goroutine pools,
                        and open-source raft-go contributions with benchmark
                        latency under 4ms.
                      </p>
                    </div>

                    <div className="evidence-row">
                      <div className="evidence-head">
                        <span className="skill-name">
                          Kubernetes Fleet Operations
                        </span>
                        <span className="badge badge-emerald">
                          Verified 90%
                        </span>
                      </div>
                      <p className="evidence-proof">
                        <Check size={14} className="text-emerald" /> CKA
                        verified, scaled multi-region Kubernetes cluster fleet
                        across 400+ bare-metal nodes with zero cluster outages.
                      </p>
                    </div>

                    <div className="evidence-row">
                      <div className="evidence-head">
                        <span className="skill-name">
                          Apache Kafka & Streaming
                        </span>
                        <span className="badge badge-emerald">
                          Verified 85%
                        </span>
                      </div>
                      <p className="evidence-proof">
                        <Check size={14} className="text-emerald" /> Constructed
                        real-time streaming pipeline processing 2.4B events/day
                        via Apache Kafka & Go worker fleet at CloudMatrix.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "talent" && (
                <div className="pipeline-pane">
                  <div className="pane-header">
                    <div>
                      <h4>Multidimensional Readiness Scoring</h4>
                      <p>
                        Calibrated benchmark vectors measured against target
                        engineering expectations.
                      </p>
                    </div>
                    <span className="badge badge-primary">
                      Advance to Technical
                    </span>
                  </div>

                  <div className="radar-metric-grid">
                    <div className="radar-stat-box">
                      <span className="radar-label">Technical Mastery</span>
                      <strong className="radar-num text-indigo">92%</strong>
                      <small>Top decile in concurrency</small>
                    </div>
                    <div className="radar-stat-box">
                      <span className="radar-label">Experience Depth</span>
                      <strong className="radar-num text-emerald">88%</strong>
                      <small>6.5 verified years</small>
                    </div>
                    <div className="radar-stat-box">
                      <span className="radar-label">Infrastructure Fit</span>
                      <strong className="radar-num text-sky">90%</strong>
                      <small>Direct stack overlap</small>
                    </div>
                    <div className="radar-stat-box">
                      <span className="radar-label">System Architecture</span>
                      <strong className="radar-num text-amber">84%</strong>
                      <small>RFC guild leadership</small>
                    </div>
                  </div>

                  <div className="audit-recommendation-card">
                    <CheckCircle2 size={20} className="text-emerald" />
                    <div className="audit-recommendation-copy">
                      <b>
                        Recommendation: Advance to Technical Assessment Stage
                      </b>
                      <span>
                        Auditable algorithmic decision signed by RADIX AI. Zero
                        black-box criteria; full gap breakdown available.
                      </span>
                    </div>
                    <Link
                      to="/talent-check"
                      className="btn btn-secondary btn-sm"
                    >
                      View Full Audit
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modular Architecture Section */}
      <section id="modules" className="landing-section">
        <div className="section-container">
          <div className="section-header text-center">
            <div className="section-eyebrow">ENGINEERED ARCHITECTURE</div>
            <h2>Modular Architecture for Precision Hiring & Alignment</h2>
            <p>
              Five decoupled yet synergistic modules that replace ambiguous
              keyword filtering with deep structural competency modeling.
            </p>
          </div>

          <div className="modules-grid">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div className={`module-card mod-${mod.color}`} key={mod.id}>
                  <div className="mod-top">
                    <span className="mod-num">{mod.number}</span>
                    <span className="mod-id">{mod.id}</span>
                  </div>
                  <div className="mod-icon-wrap">
                    <Icon size={24} />
                  </div>
                  <h3 className="mod-title">{mod.title}</h3>
                  <div className="mod-category">{mod.category}</div>
                  <p className="mod-desc">{mod.description}</p>
                  <ul className="mod-feature-list">
                    {mod.features.map((feat, idx) => (
                      <li key={idx}>
                        <Check size={14} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mod-footer">
                    <span className="mod-stat">{mod.stat}</span>
                    <Link to={mod.to} className="mod-link">
                      Launch <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How RADIX Operates Workflow */}
      <section id="workflow" className="landing-section bg-surface-alt">
        <div className="section-container">
          <div className="section-header text-center">
            <div className="section-eyebrow">ALGORITHMIC LIFECYCLE</div>
            <h2>How RADIX Operates</h2>
            <p>
              A seamless, transparent sequence from raw document ingestion to
              verified competency readiness.
            </p>
          </div>

          <div className="workflow-sequence">
            {steps.map((st, i) => (
              <div className="workflow-step-card" key={st.num}>
                <div className="step-num-pill">{st.num}</div>
                <div className="step-meta">
                  <span className="step-module">{st.module}</span>
                  <h4 className="step-title">{st.title}</h4>
                </div>
                <p className="step-desc">{st.description}</p>
                {i < steps.length - 1 && (
                  <div className="step-connector" aria-hidden="true">
                    <ChevronRight size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Value Pillars */}
      <section id="architecture" className="landing-section">
        <div className="section-container">
          <div className="section-header text-center">
            <div className="section-eyebrow">CORE VALUE PILLARS</div>
            <h2>Engineered for Evidence-Based Evaluation</h2>
            <p>
              Eliminate subjective bias and keyword stuffing with auditable
              skill verification at every step of the talent acquisition
              pipeline.
            </p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon text-indigo">
                <Layers size={22} />
              </div>
              <h4>Structured Skill Insights</h4>
              <p>
                Move beyond vague keyword tags to a normalized, multi-level
                hierarchy of competencies mapped to the 12 RADIX standards.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon text-emerald">
                <CheckCircle2 size={22} />
              </div>
              <h4>Evidence-Based Assessment</h4>
              <p>
                Every skill rating is backed by extracted evidence sentences,
                verifiable project history, and candidate confirmation.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon text-sky">
                <Database size={22} />
              </div>
              <h4>One Shared Profile</h4>
              <p>
                Candidate data persists to Supabase and seamlessly feeds JD
                Analytics, Resume Parsing, Talent Check, and Skill Matching.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon text-amber">
                <Shield size={22} />
              </div>
              <h4>Official Benchmarks</h4>
              <p>
                Verify company readiness against organizer-calibrated hiring
                expectations for Google, Microsoft, and Oracle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="landing-cta-banner">
        <div className="cta-banner-inner">
          <div className="cta-badge">
            <Zap size={14} /> Deploy Next-Gen Competency Matching
          </div>
          <h2>Ready to Transform Skill Assessment and Job Alignment?</h2>
          <p>
            Experience transparent, competency-first matching engineered for
            modern hiring workflows. Test the platform on your own role
            descriptions in under 60 seconds.
          </p>
          <div className="cta-actions">
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Launch Workspace Now <ArrowRight size={16} />
            </Link>
            <Link to="/analytics" className="btn btn-secondary btn-lg">
              Analyze a Job Description
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-logo-row">
              <span className="brand-mark">R</span>
              <strong>RADIX Talent Match</strong>
            </div>
            <p>
              Empowering evidence-based hiring and candidate potential through
              competency intelligence and verified semantic fit.
            </p>
          </div>

          <div className="footer-links-group">
            <h5>Product Modules</h5>
            <ul>
              <li>
                <Link to="/analytics">JD Analytics</Link>
              </li>
              <li>
                <Link to="/resume">Resume Parsing Graph</Link>
              </li>
              <li>
                <Link to="/profile">Profile Builder Portfolio</Link>
              </li>
              <li>
                <Link to="/talent-check">Talent Check Assessment</Link>
              </li>
              <li>
                <Link to="/matching">Skill Matching Engine</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h5>Architecture & Standards</h5>
            <ul>
              <li>
                <span className="muted-text">12 RADIX Categories</span>
              </li>
              <li>
                <span className="muted-text">ESCO & O*NET 28.1</span>
              </li>
              <li>
                <span className="muted-text">Supabase Persistence</span>
              </li>
              <li>
                <span className="muted-text">Auditable Scoring</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} RADIX Talent Match Platform.
            Executive Precision.
          </span>
          <div className="footer-bottom-links">
            <Link to="/dashboard">Open Workspace</Link>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
