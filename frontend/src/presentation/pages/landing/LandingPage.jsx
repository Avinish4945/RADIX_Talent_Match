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
      tagline: "Requirement Extraction & Evidence Grounding",
      description:
        "Deconstructs unstructured job descriptions (PDF/DOCX) into normalized technical competencies across the 12 RADIX categories, complete with confidence levels and verbatim evidence quotes.",
      features: [
        "PDF and Word DOCX document parsing",
        "Maps requirements onto 12 RADIX categories + OTHER",
        "Evidence quote and confidence extraction",
      ],
      stat: "PDF / DOCX Ingestion",
    },
    {
      id: "MOD-02",
      number: "02",
      title: "Resume Parsing",
      category: "LLM EXTRACTION",
      to: "/resume",
      icon: FileText,
      color: "blue",
      tagline: "Technical Signal & Reviewable Proficiency",
      description:
        "Transforms candidate CVs into structured candidate data. Pulls education, employment history, flagship projects, and flagged heuristic proficiency estimates for candidate confirmation.",
      features: [
        "Tolerance for varied PDF/DOCX layouts",
        "Flags provisional proficiency levels for candidate review",
        "Extracts projects, education, and technical signal",
      ],
      stat: "Candidate Review Flow",
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
        "Unified candidate profile editor supporting personal details, calibrated 1-10 skill proficiencies across 12 RADIX categories, internships, hackathons, and direct database persistence.",
      features: [
        "One shared profile feeding all downstream modules",
        "Real POST /api/profiles persistence with retained ID",
        "Pre-fills directly from resume parsing output",
      ],
      stat: "POST /api/profiles",
    },
    {
      id: "MOD-04",
      number: "04",
      title: "Talent Check",
      category: "PLAIN CODE COMPARISON",
      to: "/talent-check",
      icon: Target,
      color: "amber",
      tagline: "Company Skillset Readiness Audits",
      description:
        "One-button evaluation comparing candidate skills against official company expectations (Google LLC, Microsoft, Oracle) across all 12 RADIX categories, computing readiness scores and gap breakdowns.",
      features: [
        "Official benchmark datasets for Google, Microsoft & Oracle",
        "Deterministic per-skillset delta computation",
        "Prioritized improvement roadmap based on largest gap",
      ],
      stat: "3 Official Benchmarks",
    },
    {
      id: "MOD-05",
      number: "05",
      title: "Skill Matching",
      category: "MULTI-TIER FUZZY MATCH",
      to: "/matching",
      icon: Sparkles,
      color: "rose",
      tagline: "Role-Specific Fit & Gap Analysis",
      description:
        "Compares a candidate's profile against a specific extracted job description. Calculates match percentage and prioritizes what is missing over raw scores so candidates and recruiters know exact growth actions.",
      features: [
        "Multi-tier matching: exact, aliases, fuzzy, containment",
        "Prioritized missing skills gap breakdown with next steps",
        "Skill Evidence Matrix with filterable tabs",
      ],
      stat: "Prioritized Gap Analysis",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Ingest & Deconstruct JD",
      module: "JD Analytics",
      description:
        "Upload a job specification (or select one of the 6 benchmark roles). The system decomposes natural prose into core competency pillars and requirement tiers.",
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
              Evidence-Based Competency Intelligence & Matching Platform
            </span>
          </div>

          <h1 className="landing-title">
            Understand Your Skills.
            <br />
            <span className="text-gradient">Match Your Potential.</span>
          </h1>

          <p className="landing-subtitle">
            RADIX deconstructs unstructured job descriptions, extracts verified
            skills from candidate resumes, benchmarks enterprise readiness
            across 12 standardized categories, and quantifies multidimensional
            candidate-to-job fit with auditable gap analysis.
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
              <Shield size={16} className="trust-icon text-indigo" />
              <span>12 Standardized RADIX Competencies</span>
            </div>
            <span className="trust-dot">•</span>
            <div className="trust-item">
              <Lock size={16} className="trust-icon text-emerald" />
              <span>Evidence-Backed Skill Proofs</span>
            </div>
            <span className="trust-dot">•</span>
            <div className="trust-item">
              <Zap size={16} className="trust-icon text-amber" />
              <span>Official Benchmark Datasets</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pipeline Showcase - Grounded in Real Benchmark Role & Candidate */}
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
                <span className="target-pill">Official Benchmark Target</span>
                <strong>Google LLC — Software Engineer</strong>
                <span className="dept-tag">
                  Systems & Algorithms · Official Spec
                </span>
              </div>
              <div className="pipeline-candidate">
                <div className="candidate-badge">
                  <span className="candidate-avatar">KS</span>
                  <div>
                    <b>Karthik Subramaniam</b>
                    <small>NIT Trichy · Backend & Distributed Systems</small>
                  </div>
                </div>
                <div className="match-score-pill">
                  <span className="score-val">88%</span>
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
                <span className="tab-badge">Extracted</span>
              </button>
              <button
                type="button"
                className={`pipeline-tab ${activeTab === "coverage" ? "active" : ""}`}
                onClick={() => setActiveTab("coverage")}
              >
                <FileCheck2 size={16} />
                <span>2. Skill Coverage & Evidence</span>
                <span className="tab-badge success">Verified</span>
              </button>
              <button
                type="button"
                className={`pipeline-tab ${activeTab === "talent" ? "active" : ""}`}
                onClick={() => setActiveTab("talent")}
              >
                <Target size={16} />
                <span>3. Talent Check Readiness</span>
                <span className="tab-badge primary">Audited</span>
              </button>
            </div>

            <div className="pipeline-tab-content">
              {activeTab === "jd" && (
                <div className="pipeline-pane">
                  <div className="pane-header">
                    <div>
                      <h4>
                        Deconstructed Competency Requirements (Google LLC — SWE)
                      </h4>
                      <p>
                        Requirements extracted from the official job
                        specification mapped onto canonical RADIX categories
                        with evidence quotes.
                      </p>
                    </div>
                    <span className="badge badge-success">
                      Official Benchmark
                    </span>
                  </div>

                  <div className="weights-grid">
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          Data Structures & Algorithms (Trees, Graphs, DP)
                        </span>
                        <span className="weight-tier must">DSA · Core</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "90%" }} />
                        <span className="weight-pct">High Confidence</span>
                      </div>
                    </div>
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          C++ / Python / Go Systems Programming
                        </span>
                        <span className="weight-tier must">COD · Core</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "85%" }} />
                        <span className="weight-pct">High Confidence</span>
                      </div>
                    </div>
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          Distributed Systems & High-Throughput Architecture
                        </span>
                        <span className="weight-tier must">SYSD · Core</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "80%" }} />
                        <span className="weight-pct">High Confidence</span>
                      </div>
                    </div>
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          Operating Systems & Concurrency Internals
                        </span>
                        <span className="weight-tier nice">OS · Core</span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "70%" }} />
                        <span className="weight-pct">High Confidence</span>
                      </div>
                    </div>
                    <div className="weight-item">
                      <div className="weight-info">
                        <span className="weight-title">
                          Computer Networks & Socket Protocols
                        </span>
                        <span className="weight-tier nice">
                          NETW · Supporting
                        </span>
                      </div>
                      <div className="weight-bar-wrap">
                        <div className="weight-bar" style={{ width: "65%" }} />
                        <span className="weight-pct">Medium Confidence</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "coverage" && (
                <div className="pipeline-pane">
                  <div className="pane-header">
                    <div>
                      <h4>
                        Candidate Evidence Cross-Reference (Karthik Subramaniam)
                      </h4>
                      <p>
                        Candidate skills extracted from resume, matched against
                        coursework, projects, and confirmed proficiencies.
                      </p>
                    </div>
                    <span className="badge badge-success">
                      4 Core Competencies
                    </span>
                  </div>

                  <div className="evidence-list">
                    <div className="evidence-row">
                      <div className="evidence-head">
                        <span className="skill-name">
                          Golang & Concurrency (COD)
                        </span>
                        <span className="badge badge-emerald">
                          Level 9 / 10 · Confirmed
                        </span>
                      </div>
                      <p className="evidence-proof">
                        <Check size={14} className="text-emerald" /> Architected
                        consensus storage engine in Go with custom goroutine
                        pools and sub-4ms p99 latency.
                      </p>
                    </div>

                    <div className="evidence-row">
                      <div className="evidence-head">
                        <span className="skill-name">
                          Data Structures & Algorithms (DSA)
                        </span>
                        <span className="badge badge-emerald">
                          Level 8 / 10 · Confirmed
                        </span>
                      </div>
                      <p className="evidence-proof">
                        <Check size={14} className="text-emerald" /> Production
                        Raft state machine implementation with 350+ solved
                        algorithm benchmarks.
                      </p>
                    </div>

                    <div className="evidence-row">
                      <div className="evidence-head">
                        <span className="skill-name">
                          Distributed Systems & Apache Kafka (SYSD)
                        </span>
                        <span className="badge badge-emerald">
                          Level 8 / 10 · Confirmed
                        </span>
                      </div>
                      <p className="evidence-proof">
                        <Check size={14} className="text-emerald" /> Constructed
                        streaming event bus handling 2.4B events/day with
                        partition fault tolerance.
                      </p>
                    </div>

                    <div className="evidence-row">
                      <div className="evidence-head">
                        <span className="skill-name">
                          Linux Systems & Kernel Tuning (OS)
                        </span>
                        <span className="badge badge-emerald">
                          Level 8 / 10 · Confirmed
                        </span>
                      </div>
                      <p className="evidence-proof">
                        <Check size={14} className="text-emerald" /> Low-level
                        socket profiling, memory vacuum tuning, and process
                        scheduling optimization.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "talent" && (
                <div className="pipeline-pane">
                  <div className="pane-header">
                    <div>
                      <h4>Talent Check: Google LLC Expected Bar Comparison</h4>
                      <p>
                        Candidate proficiency scores calibrated against Google
                        LLC's hiring expectations across all evaluated RADIX
                        skillsets.
                      </p>
                    </div>
                    <span className="badge badge-primary">
                      Ready for Technical
                    </span>
                  </div>

                  <div className="radar-metric-grid">
                    <div className="radar-stat-box">
                      <span className="radar-label">Coding (COD)</span>
                      <strong className="radar-num text-indigo">9 / 8</strong>
                      <small>Exceeds bar (+1)</small>
                    </div>
                    <div className="radar-stat-box">
                      <span className="radar-label">Algorithms (DSA)</span>
                      <strong className="radar-num text-emerald">8 / 9</strong>
                      <small>Near bar (-1)</small>
                    </div>
                    <div className="radar-stat-box">
                      <span className="radar-label">Architecture (SYSD)</span>
                      <strong className="radar-num text-sky">8 / 8</strong>
                      <small>Meets expected bar</small>
                    </div>
                    <div className="radar-stat-box">
                      <span className="radar-label">
                        Operating Systems (OS)
                      </span>
                      <strong className="radar-num text-amber">8 / 7</strong>
                      <small>Exceeds bar (+1)</small>
                    </div>
                  </div>

                  <div className="audit-recommendation-card">
                    <CheckCircle2 size={20} className="text-emerald" />
                    <div className="audit-recommendation-copy">
                      <b>
                        Target Recommendation: Review Object-Oriented Design &
                        Network Protocols
                      </b>
                      <span>
                        Strong match on core systems and coding. Actionable next
                        steps prioritize closing gaps in Object-Oriented Design
                        (OOD) and Computer Networks (NETW).
                      </span>
                    </div>
                    <Link
                      to="/talent-check"
                      className="btn btn-secondary btn-sm"
                    >
                      View Talent Check
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
              keyword filtering with structured competency modeling.
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
                Move beyond vague keyword tags to a normalized hierarchy of
                competencies mapped to the 12 RADIX standards.
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
                Candidate data persists to database storage and seamlessly feeds
                JD Analytics, Resume Parsing, Talent Check, and Skill Matching.
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
            <Zap size={14} /> Deploy Competency Matching
          </div>
          <h2>Ready to Transform Skill Assessment and Job Alignment?</h2>
          <p>
            Experience transparent, competency-first matching engineered for
            modern hiring workflows. Test the platform on your own role
            descriptions or benchmark candidate profiles.
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
                <Link to="/resume">Resume Parsing</Link>
              </li>
              <li>
                <Link to="/profile">Profile Builder</Link>
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
                <span className="muted-text">
                  Google, MSFT & Oracle Benchmarks
                </span>
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
