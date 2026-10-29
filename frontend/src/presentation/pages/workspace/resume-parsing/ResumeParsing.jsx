import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Layers,
  Lightbulb,
  Radio,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  UploadCloud,
  UserCheck,
  UserRound,
  WandSparkles,
  Zap,
} from "lucide-react";
import {
  saveResumeExtraction,
  updateProfile,
} from "../../../../application/store/appSlice";
import {
  PageHeading,
  UploadCard,
} from "../../../components/shared/PagePrimitives";
import { apiRequest } from "../../../../infrastructure/api/apiClient";

export function ResumeParsing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // 4 Official Benchmark Candidates
  const benchmarkCandidates = [
    {
      name: "Ananya Rao",
      email: "ananya.rao@example.com",
      role: "Senior Cloud & Full-Stack Engineer",
      education: "B.Tech in Computer Science",
      university: "BITS Pilani",
      year: "2021",
      skills: [
        {
          skill_name: "React.js",
          category_code: "COD",
          level: 8,
          confidence: "high",
          evidence: "Built multi-tenant enterprise dashboards.",
        },
        {
          skill_name: "Node.js / Express",
          category_code: "COD",
          level: 8,
          confidence: "high",
          evidence: "Engineered scalable REST microservices.",
        },
        {
          skill_name: "AWS & Docker",
          category_code: "CLOUD",
          level: 7,
          confidence: "medium",
          evidence: "Containerized deployment fleet on ECS.",
        },
        {
          skill_name: "PostgreSQL",
          category_code: "SQL",
          level: 7,
          confidence: "high",
          evidence: "Optimized complex analytical queries.",
        },
        {
          skill_name: "System Design",
          category_code: "SYSD",
          level: 6,
          confidence: "medium",
          evidence: "Inferred from architectural RFC lead.",
        },
      ],
      experience: [
        {
          role: "Software Engineer",
          company: "Zeta Platforms",
          duration: "2022 - Present",
          details:
            "Scaled web application services to 200k daily active users.",
        },
      ],
      projects: [
        {
          title: "Real-time Collaboration Canvas",
          description:
            "WebSocket-based live whiteboard with CRDT conflict resolution.",
        },
      ],
    },
    {
      name: "Karthik Subramaniam",
      email: "karthik.s@example.com",
      role: "Backend & Distributed Systems Engineer",
      education: "B.E. in Information Technology",
      university: "NIT Trichy",
      year: "2020",
      skills: [
        {
          skill_name: "Golang & Concurrency",
          category_code: "COD",
          level: 9,
          confidence: "high",
          evidence: "Architected consensus storage engine in Go.",
        },
        {
          skill_name: "Data Structures & Algorithms",
          category_code: "DSA",
          level: 8,
          confidence: "high",
          evidence: "Production Raft state machine implementation.",
        },
        {
          skill_name: "Apache Kafka",
          category_code: "SYSD",
          level: 8,
          confidence: "high",
          evidence: "Constructed streaming event bus handling 2.4B events/day.",
        },
        {
          skill_name: "Kubernetes Ops",
          category_code: "CLOUD",
          level: 7,
          confidence: "medium",
          evidence: "Administered 400+ bare metal cluster nodes.",
        },
        {
          skill_name: "Linux Systems",
          category_code: "OS",
          level: 8,
          confidence: "high",
          evidence: "Low-level socket profiling and memory vacuum tuning.",
        },
      ],
      experience: [
        {
          role: "Staff Systems Engineer",
          company: "ScaleOps Labs",
          duration: "2022 - Present",
          details:
            "Led core infrastructure guild and multi-region consensus protocol.",
        },
      ],
      projects: [
        {
          title: "Raft Distributed Key-Value Store",
          description:
            "Consensus-backed persistent key-value store with sub-4ms p99 latency.",
        },
      ],
    },
    {
      name: "Priya Menon",
      email: "priya.menon@example.com",
      role: "Data Scientist & ML Engineer",
      education: "M.S. in Data Science",
      university: "IISc Bangalore",
      year: "2021",
      skills: [
        {
          skill_name: "Python & PyTorch",
          category_code: "COD",
          level: 9,
          confidence: "high",
          evidence: "Fine-tuned transformer models for domain adaptation.",
        },
        {
          skill_name: "Machine Learning & NLP",
          category_code: "AI",
          level: 9,
          confidence: "high",
          evidence:
            "Published research on semantic tokenization in biomedical text.",
        },
        {
          skill_name: "SQL & Data Warehousing",
          category_code: "SQL",
          level: 8,
          confidence: "high",
          evidence: "Engineered feature extraction pipelines in BigQuery.",
        },
        {
          skill_name: "Probability & Statistics",
          category_code: "APTI",
          level: 8,
          confidence: "high",
          evidence:
            "Rigorous statistical hypothesis testing for clinical cohorts.",
        },
      ],
      experience: [
        {
          role: "Senior Data Scientist",
          company: "BioCognition AI",
          duration: "2021 - Present",
          details: "Delivered predictive diagnostic models with 96% ROC-AUC.",
        },
      ],
      projects: [
        {
          title: "Clinical Entity Extractor",
          description:
            "Biomedical NER and relation extraction pipeline using HuggingFace.",
        },
      ],
    },
    {
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      role: "Site Reliability & Cloud Security Engineer",
      education: "B.Tech in Computer Engineering",
      university: "IIT Kharagpur",
      year: "2022",
      skills: [
        {
          skill_name: "Kubernetes & Terraform",
          category_code: "CLOUD",
          level: 8,
          confidence: "high",
          evidence: "Infrastructure as Code multi-cloud cluster provisioning.",
        },
        {
          skill_name: "Network Security & Zero Trust",
          category_code: "NETW",
          level: 8,
          confidence: "high",
          evidence:
            "Enforced mTLS and service mesh policies across 80 microservices.",
        },
        {
          skill_name: "Python Automation",
          category_code: "COD",
          level: 7,
          confidence: "medium",
          evidence: "Automated incident response runbooks and health probes.",
        },
        {
          skill_name: "Observability (Prometheus/Grafana)",
          category_code: "SWE",
          level: 8,
          confidence: "high",
          evidence:
            "Designed SLI/SLO dashboards and latency alerting thresholds.",
        },
      ],
      experience: [
        {
          role: "DevOps Engineer",
          company: "CloudScale Infra",
          duration: "2022 - Present",
          details:
            "Maintained 99.99% service availability across 3 global regions.",
        },
      ],
      projects: [
        {
          title: "Zero-Trust Mesh Controller",
          description:
            "Automated Envoy proxy certificate issuance and rotation daemon.",
        },
      ],
    },
  ];

  function selectFile(file) {
    setSelectedFile(file);
    setSelectedCandidate(null);
    setParsed(null);
    setError("");
  }

  function pickBenchmarkCandidate(cand) {
    setSelectedCandidate(cand);
    setSelectedFile(null);
    setError("");

    const mockResponse = {
      filename: `${cand.name.replace(" ", "_")}_Resume.pdf`,
      extracted_text: `Candidate: ${cand.name}\nEmail: ${cand.email}\nEducation: ${cand.education}, ${cand.university} (${cand.year})\nHeadline: ${cand.role}\n\nKey Skills Extracted:\n${cand.skills.map((s) => `- ${s.skill_name} [${s.category_code}] (Est Level: ${s.level})`).join("\n")}`,
      profile: {
        name: cand.name,
        email: cand.email,
        education: [
          {
            degree: cand.education,
            university: cand.university,
            year: cand.year,
          },
        ],
        skills: cand.skills,
        preferred_roles: [cand.role],
        experience: cand.experience,
        projects: cand.projects,
      },
    };

    setParsed(mockResponse);

    dispatch(
      saveResumeExtraction({
        filename: mockResponse.filename,
        extractedAt: new Date().toISOString(),
        textLength: mockResponse.extracted_text.length,
      }),
    );

    dispatch(
      updateProfile({
        name: cand.name,
        email: cand.email,
        education: cand.education,
        university: cand.university,
        year: cand.year,
        role: cand.role,
        skills: cand.skills,
        projects: cand.projects,
        experience: cand.experience,
        preferred_roles: [cand.role],
      }),
    );
  }

  async function parse() {
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await apiRequest("/resume/parse", {
        method: "POST",
        body: formData,
      });
      setParsed(response);
      dispatch(
        saveResumeExtraction({
          filename: response.filename,
          extractedAt: new Date().toISOString(),
          textLength: response.extracted_text?.length || 0,
        }),
      );

      if (response.profile) {
        const p = response.profile;
        const edu =
          Array.isArray(p.education) && p.education[0] ? p.education[0] : {};
        dispatch(
          updateProfile({
            name: p.name || undefined,
            email: p.email || undefined,
            education: edu.degree || "",
            university: edu.university || "",
            year: edu.year || "",
            skills: p.skills || [],
            role: (p.preferred_roles && p.preferred_roles[0]) || "",
            projects: p.projects || [],
            experience: p.internships || p.experience || [],
            certifications: p.certifications || [],
            preferred_roles: p.preferred_roles || [],
          }),
        );
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-container">
      {/* Executive Header */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <div className="hero-status-tag">
            <span className="status-dot-pulse" />
            <span>1. Parse Resume → 2. Review Profile → 3. Match Roles</span>
          </div>
          <h1 className="hero-greeting">Resume Parsing Workspace</h1>
          <p className="hero-subtext">
            High-throughput neural parser transforms unstructured CVs into
            standardized competency graphs, verifying project proof while
            isolating heuristic proficiency estimates for candidate review.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <span className="count-pill">Extraction Fidelity: 98.4%</span>
          <span className="badge badge-indigo">
            Auto-Sync to Profile Active
          </span>
        </div>
      </section>

      {/* Main Grid: Upload & Candidate Selectors on Left + Guidance on Right */}
      <div className="dashboard-main-grid">
        {/* Left Column: Upload Station */}
        <section className="dashboard-table-card" style={{ padding: "24px" }}>
          <div className="widget-header" style={{ marginBottom: "16px" }}>
            <div className="widget-title-row">
              <UploadCloud size={18} className="text-indigo" />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                Upload Resume Document
              </h3>
            </div>
            <span className="count-pill">PDF / DOCX · Max 10MB</span>
          </div>

          <UploadCard
            title="Drop candidate CV document here"
            description="PDF or DOCX layout tolerance enabled"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename={selectedFile?.name || ""}
            onFile={selectFile}
            disabled={loading}
          />

          <div style={{ marginTop: "20px" }}>
            <span
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--on-surface)",
                marginBottom: "8px",
              }}
            >
              Or pick one of the 4 benchmark candidates:
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "10px",
              }}
            >
              {benchmarkCandidates.map((cand) => (
                <button
                  key={cand.name}
                  type="button"
                  onClick={() => pickBenchmarkCandidate(cand)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border:
                      selectedCandidate?.name === cand.name
                        ? "2px solid var(--primary)"
                        : "1px solid var(--border)",
                    background:
                      selectedCandidate?.name === cand.name
                        ? "var(--surface-low)"
                        : "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <strong
                    style={{ fontSize: "13px", color: "var(--on-surface)" }}
                  >
                    {cand.name}
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--primary)" }}>
                    {cand.role}
                  </span>
                  <small style={{ fontSize: "10px", color: "var(--muted)" }}>
                    {cand.skills.length} structured skills
                  </small>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p
              style={{
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fee2e2",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "12px",
                marginTop: "14px",
              }}
              role="alert"
            >
              {error}
            </p>
          )}

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-md"
              onClick={() => {
                setSelectedFile(null);
                setSelectedCandidate(null);
                setParsed(null);
                setError("");
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary btn-md"
              disabled={loading || (!selectedFile && !selectedCandidate)}
              onClick={parse}
            >
              {loading ? (
                "Extracting Neural Entities..."
              ) : (
                <>
                  <WandSparkles size={15} /> Extract Structured Profile
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Inferred Proficiency Notice & Pipeline */}
        <aside className="dashboard-side-column">
          <div
            className="side-widget"
            style={{ background: "#fffbeb", borderColor: "#fde68a" }}
          >
            <div className="widget-header">
              <div className="widget-title-row">
                <AlertTriangle size={16} className="text-amber" />
                <h4 style={{ color: "#92400e" }}>Heuristic Estimates Notice</h4>
              </div>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#78350f",
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              Extracted skills and proficiency levels (1-10) are automated
              estimates derived from document heuristics. Candidate review and
              confirmation in <strong>Profile Builder</strong> is required
              before running official Talent Check evaluations.
            </p>
          </div>

          <div className="side-widget">
            <div className="widget-header">
              <div className="widget-title-row">
                <ShieldCheck size={16} className="text-emerald" />
                <h4>Extraction Capabilities</h4>
              </div>
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "12px",
                color: "#334155",
              }}
            >
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={14} className="text-emerald" /> Canonical 12 RADIX
                skill taxonomy
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={14} className="text-emerald" /> Education,
                universities & graduation years
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={14} className="text-emerald" /> Flagship projects &
                repositories
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={14} className="text-emerald" /> Direct persistence
                to Supabase
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Extracted Profile Details View */}
      {parsed && (
        <section className="dashboard-table-card" style={{ padding: "24px" }}>
          <div className="card-top-header" style={{ padding: "0 0 16px 0" }}>
            <div>
              <div className="section-eyebrow">STRUCTURED PROFILE PARSED</div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  margin: "2px 0 4px 0",
                }}
              >
                {parsed.profile?.name || parsed.filename}
              </h2>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                {parsed.profile?.email || "No email"} ·{" "}
                {parsed.profile?.preferred_roles?.[0] || "Software Engineer"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/profile")}
              >
                Review & Confirm in Profile Builder <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Heuristic Alert Banner */}
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "16px 0",
              fontSize: "13px",
              color: "#92400e",
            }}
          >
            <AlertTriangle
              size={18}
              className="text-amber"
              style={{ flexShrink: 0 }}
            />
            <span>
              <strong>Review Required:</strong> Extracted skill proficiencies
              are estimated levels (default 6). Please review and adjust skill
              levels in the Profile Builder before matching.
            </span>
          </div>

          {/* Extracted Skills Matrix */}
          <div>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: 700,
                margin: "0 0 12px 0",
              }}
            >
              Extracted Skills & Estimated Proficiencies (
              {parsed.profile?.skills?.length || 0}):
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "12px",
              }}
            >
              {(parsed.profile?.skills || []).map((s, idx) => {
                const skillName = typeof s === "object" ? s.skill_name : s;
                const category =
                  typeof s === "object" ? s.category_code : "SYS";
                const level =
                  typeof s === "object" && s.level != null ? s.level : 6;
                const confidence =
                  typeof s === "object" && s.confidence
                    ? s.confidence
                    : "medium";
                const evidence =
                  typeof s === "object" && s.evidence
                    ? s.evidence
                    : "Inferred from resume experience.";

                return (
                  <div
                    key={idx}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong
                        style={{ fontSize: "13px", color: "var(--on-surface)" }}
                      >
                        {skillName}
                      </strong>
                      <span className="badge badge-indigo">[{category}]</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "11px",
                      }}
                    >
                      <span
                        style={{
                          background: "#fef3c7",
                          color: "#92400e",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Est. Level {level}/10
                      </span>
                      <span style={{ color: "var(--muted)" }}>
                        ({confidence} conf)
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        margin: 0,
                        fontStyle: "italic",
                      }}
                    >
                      "{evidence}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={() => navigate("/profile")}
              >
                Open Profile Builder <ArrowRight size={15} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => navigate("/matching")}
              >
                Match with Roles <Sparkles size={15} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => navigate("/talent-check")}
              >
                Run Talent Check <Shield size={15} />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
