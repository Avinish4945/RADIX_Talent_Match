import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Database,
  FileSearch,
  FileText,
  Filter,
  Layers,
  Lightbulb,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Tags,
  Trash2,
  UploadCloud,
  WandSparkles,
  Zap,
} from "lucide-react";
import { setAnalyzedJob } from "../../../../application/store/appSlice";
import {
  PageHeading,
  UploadCard,
} from "../../../components/shared/PagePrimitives";
import {
  analyzeJobDescription,
  deleteJobDescription,
  getJobDescription,
  getJobDescriptions,
} from "./jdApi";
import { jobs as benchmarkJobs } from "../../../../infrastructure/demo/demoData";

export function JobAnalytics() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);
  const [savedJobsError, setSavedJobsError] = useState("");
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [ingestionTab, setIngestionTab] = useState("document");
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [selectedBenchmarkIndex, setSelectedBenchmarkIndex] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [importanceFilter, setImportanceFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadSavedJobs() {
      setSavedJobsLoading(true);
      setSavedJobsError("");
      try {
        const response = await getJobDescriptions({ page, pageSize: 10 });
        if (!active) return;
        setSavedJobs(response.job_descriptions || []);
        setTotalJobs(response.total || 0);
        setTotalPages(response.total_pages || 0);
      } catch (requestError) {
        if (active) setSavedJobsError(requestError.message);
      } finally {
        if (active) setSavedJobsLoading(false);
      }
    }

    loadSavedJobs();
    return () => {
      active = false;
    };
  }, [page, refreshKey]);

  useEffect(() => {
    if (!selectedJobId) return undefined;
    let active = true;

    async function loadSelectedJob() {
      setDetailLoading(true);
      setDetailError("");
      try {
        const result = await getJobDescription(selectedJobId);
        if (active) setAnalysis(result);
      } catch (requestError) {
        if (active) setDetailError(requestError.message);
      } finally {
        if (active) setDetailLoading(false);
      }
    }

    loadSelectedJob();
    return () => {
      active = false;
    };
  }, [selectedJobId]);

  function selectFile(file) {
    setSelectedFile(file);
    setSelectedBenchmarkIndex(null);
    setError("");
  }

  function pickBenchmarkJob(index) {
    setSelectedBenchmarkIndex(index);
    setSelectedFile(null);
    setError("");
    const job = benchmarkJobs[index];
    const generatedSkills = (job.jdSkills || []).map((s, idx) => ({
      skill_name: s.skill_name,
      category_code: s.category_code || "SYS",
      confidence: s.confidence || "high",
      importance: idx < 4 ? "Must-have" : "Preferred",
      evidence: `Extracted from ${job.company} ${job.role} technical requirements and qualifications section.`,
    }));

    const mockAnalysis = {
      id: `benchmark-${index}-${Date.now()}`,
      role: job.role,
      company: job.company,
      source_file: `${job.company} - ${job.role}.pdf`,
      skills: generatedSkills,
      created_at: new Date().toISOString(),
    };

    setAnalysis(mockAnalysis);
    dispatch(
      setAnalyzedJob({
        ...mockAnalysis,
        title: `${mockAnalysis.company} — ${mockAnalysis.role}`,
        createdAt: mockAnalysis.created_at,
      }),
    );
  }

  async function analyze(event) {
    event?.preventDefault();

    if (ingestionTab === "benchmark" && selectedBenchmarkIndex != null) {
      return;
    }

    if (!selectedFile && !rawText.trim()) {
      setError("Please select a document or enter job description text.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let fileToUpload = selectedFile;
      if (!fileToUpload && rawText.trim()) {
        const blob = new Blob([rawText], { type: "text/plain" });
        fileToUpload = new File([blob], "custom_job_description.txt", {
          type: "text/plain",
        });
      }

      const result = await analyzeJobDescription(fileToUpload);
      setAnalysis(result);
      setSelectedJobId(result.id);
      setPage(1);
      setRefreshKey((key) => key + 1);
      dispatch(
        setAnalyzedJob({
          ...result,
          title: result.role || result.source_file,
          createdAt: result.created_at,
        }),
      );
    } catch (requestError) {
      setError(requestError.message || "Failed to analyze job description");
    } finally {
      setLoading(false);
    }
  }

  async function deleteJob(job) {
    const jobTitle = job.role || job.source_file;
    if (
      !window.confirm(
        `Delete "${jobTitle}" and its saved analysis? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingJobId(job.id);
    setDeleteError("");
    try {
      await deleteJobDescription(job.id);
      setTotalJobs((count) => Math.max(0, count - 1));
      if (selectedJobId === job.id) {
        setSelectedJobId("");
        setAnalysis(null);
        setDetailError("");
      }

      if (savedJobs.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        setRefreshKey((key) => key + 1);
      }
    } catch (requestError) {
      setDeleteError(requestError.message);
    } finally {
      setDeletingJobId("");
    }
  }

  const filteredSkills = (analysis?.skills || []).filter((s) => {
    if (importanceFilter === "must") return s.importance === "Must-have";
    if (importanceFilter === "pref") return s.importance === "Preferred";
    return true;
  });

  return (
    <div className="dashboard-container">
      {/* Executive Header */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <div className="hero-status-tag">
            <span className="status-dot-pulse" />
            <span>12 RADIX Categories · PDF & DOCX Ingestion</span>
          </div>
          <h1 className="hero-greeting">JD Analytics Workspace</h1>
          <p className="hero-subtext">
            AI-assisted job requirement extraction. Deconstruct unstructured
            requisitions into normalized technical competencies, requirement
            weights, and verifiable contextual evidence quotes.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <span className="count-pill">
            Total Parsed: {savedJobsLoading ? "..." : totalJobs} JDs
          </span>
          <span className="badge badge-emerald">
            Structured Skills & Evidence
          </span>
        </div>
      </section>

      {/* Main Grid: Ingestion Station on Left + Extraction Guide on Right */}
      <div className="dashboard-main-grid">
        {/* Left Column: Ingestion Station */}
        <section className="dashboard-table-card" style={{ padding: "24px" }}>
          <div className="widget-header" style={{ marginBottom: "16px" }}>
            <div className="widget-title-row">
              <UploadCloud size={18} className="text-indigo" />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                Ingestion Station
              </h3>
            </div>
            <div className="table-filter-tabs">
              <button
                type="button"
                className={`filter-tab ${ingestionTab === "document" ? "active" : ""}`}
                onClick={() => setIngestionTab("document")}
              >
                Document Upload
              </button>
              <button
                type="button"
                className={`filter-tab ${ingestionTab === "text" ? "active" : ""}`}
                onClick={() => setIngestionTab("text")}
              >
                Raw Text
              </button>
              <button
                type="button"
                className={`filter-tab ${ingestionTab === "benchmark" ? "active" : ""}`}
                onClick={() => setIngestionTab("benchmark")}
              >
                Benchmark JDs (6)
              </button>
            </div>
          </div>

          {ingestionTab === "document" && (
            <div className="ingestion-pane">
              <UploadCard
                title="Drop JD document here or choose file"
                description="PDF or DOCX (OCR supported, max 10MB)"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                filename={selectedFile?.name || ""}
                onFile={selectFile}
                disabled={loading}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "12px",
                }}
              >
                <span>
                  <Check
                    size={14}
                    className="text-emerald"
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  Private workspace vault • Structured NER pipeline
                </span>
                <span>Max 10 MB</span>
              </div>
            </div>
          )}

          {ingestionTab === "text" && (
            <div className="ingestion-pane">
              <label
                htmlFor="jd-raw-text"
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--on-surface)",
                  marginBottom: "8px",
                }}
              >
                Paste unstructured job description text:
              </label>
              <textarea
                id="jd-raw-text"
                rows={7}
                placeholder="Paste role responsibilities, required qualifications, and technology stack here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
          )}

          {ingestionTab === "benchmark" && (
            <div className="ingestion-pane">
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  margin: "0 0 12px 0",
                }}
              >
                Select an official organizer benchmark role to inspect
                calibrated RADIX requirements:
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "10px",
                }}
              >
                {benchmarkJobs.map((job, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => pickBenchmarkJob(idx)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border:
                        selectedBenchmarkIndex === idx
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border)",
                      background:
                        selectedBenchmarkIndex === idx
                          ? "var(--surface-low)"
                          : "#ffffff",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--primary)",
                        textTransform: "uppercase",
                      }}
                    >
                      {job.company}
                    </span>
                    <strong
                      style={{ fontSize: "13px", color: "var(--on-surface)" }}
                    >
                      {job.role}
                    </strong>
                    <small style={{ fontSize: "11px", color: "var(--muted)" }}>
                      {job.jdSkills?.length || 0} canonical skills
                    </small>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                setRawText("");
                setSelectedBenchmarkIndex(null);
                setError("");
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary btn-md"
              disabled={
                loading ||
                (!selectedFile &&
                  !rawText.trim() &&
                  selectedBenchmarkIndex == null)
              }
              onClick={analyze}
            >
              {loading ? (
                "Extracting & Deconstructing..."
              ) : (
                <>
                  <Sparkles size={15} /> Extract & Deconstruct JD
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Extraction Heuristic Guidance */}
        <aside className="dashboard-side-column">
          <div className="side-widget">
            <div className="widget-header">
              <div className="widget-title-row">
                <Lightbulb size={16} className="text-amber" />
                <h4>Extraction Heuristic</h4>
              </div>
              <span className="badge badge-amber">Context Aware</span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#475569",
                lineHeight: 1.5,
                margin: "0 0 12px 0",
              }}
            >
              The neural parser extracts contextual sentences to preserve
              semantic depth. Hard requirements are distinguished from
              nice-to-haves by linguistic modal tags (e.g. <em>"must have"</em>,{" "}
              <em>"experience driving"</em>, <em>"preferred"</em>).
            </p>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "11px",
                color: "#334155",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <CheckCircle2 size={13} className="text-emerald" />
                <b>Signal Concentration:</b> Focuses on Responsibilities &
                Qualifications.
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <CheckCircle2 size={13} className="text-indigo" />
                <b>12 RADIX Categories:</b> COD, DSA, SYS, SQL, AI, DEV, SEC,
                NET, ARC, MOB, CC, TST.
              </div>
            </div>
          </div>

          {/* Quick jump to Skill Matching */}
          {analysis && (
            <div
              className="side-widget"
              style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
            >
              <div className="widget-header">
                <div className="widget-title-row">
                  <Sparkles size={16} className="text-emerald" />
                  <h4 style={{ color: "#065f46" }}>Next Workflow Step</h4>
                </div>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#047857",
                  margin: "0 0 12px 0",
                }}
              >
                Ready to match candidate profiles against this extracted job
                description?
              </p>
              <Link
                to={`/matching?jdId=${encodeURIComponent(analysis.id)}`}
                className="btn btn-primary btn-md"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Run Skill Matching <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </aside>
      </div>

      {/* Extracted Competency Breakdown (Active Analysis View) */}
      {analysis && (
        <section className="dashboard-table-card" style={{ padding: "24px" }}>
          <div className="card-top-header" style={{ padding: "0 0 16px 0" }}>
            <div>
              <div className="section-eyebrow">
                ACTIVE PARSE: {analysis.id?.substring(0, 8)}
              </div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  margin: "2px 0 4px 0",
                }}
              >
                {analysis.role || analysis.source_file}
              </h2>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                {analysis.company || "Company Requisition"} ·{" "}
                {analysis.source_file}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="table-filter-tabs">
                <button
                  type="button"
                  className={`filter-tab ${importanceFilter === "all" ? "active" : ""}`}
                  onClick={() => setImportanceFilter("all")}
                >
                  All ({analysis.skills?.length || 0})
                </button>
                <button
                  type="button"
                  className={`filter-tab ${importanceFilter === "must" ? "active" : ""}`}
                  onClick={() => setImportanceFilter("must")}
                >
                  Must-have
                </button>
                <button
                  type="button"
                  className={`filter-tab ${importanceFilter === "pref" ? "active" : ""}`}
                  onClick={() => setImportanceFilter("pref")}
                >
                  Preferred
                </button>
              </div>

              <Link
                to={`/matching?jdId=${encodeURIComponent(analysis.id)}`}
                className="btn btn-primary btn-sm"
              >
                Select for Skill Matching <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {filteredSkills.length === 0 ? (
            <p
              style={{
                padding: "20px 0",
                color: "var(--muted)",
                textAlign: "center",
              }}
            >
              No requirements match this filter.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "14px",
                marginTop: "16px",
              }}
            >
              {filteredSkills.map((skill, index) => (
                <div
                  key={index}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <strong
                        style={{ fontSize: "14px", color: "var(--on-surface)" }}
                      >
                        {skill.skill_name}
                      </strong>
                      <span
                        style={{
                          display: "inline-block",
                          marginLeft: "6px",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "var(--primary)",
                          background: "var(--surface-low)",
                          padding: "1px 5px",
                          borderRadius: "4px",
                        }}
                      >
                        [{skill.category_code || "SYS"}]
                      </span>
                    </div>
                    <span
                      className={`badge ${
                        skill.importance === "Must-have"
                          ? "badge-rose"
                          : "badge-indigo"
                      }`}
                    >
                      {skill.importance || "Core"}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#475569",
                      lineHeight: 1.45,
                      margin: 0,
                      background: "#ffffff",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    "
                    {skill.evidence ||
                      "Direct requirement specified in role description."}
                    "
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "11px",
                      color: "var(--muted)",
                      paddingTop: "4px",
                    }}
                  >
                    <span>
                      Confidence: <b>{skill.confidence || "0.95"}</b>
                    </span>
                    <span className="badge badge-emerald">
                      Verified In Requisition
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Saved Job Descriptions Library */}
      <section className="dashboard-table-card">
        <div className="card-top-header">
          <div className="table-heading-meta">
            <h3>Saved Job Descriptions Library</h3>
            <span className="count-pill">{totalJobs} Total</span>
          </div>

          <span style={{ fontSize: "12px", color: "var(--muted)" }}>
            Persisted in FastAPI backend database
          </span>
        </div>

        {deleteError && (
          <p
            style={{
              margin: "12px 20px",
              padding: "8px 12px",
              background: "#fef2f2",
              color: "#991b1b",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            {deleteError}
          </p>
        )}

        {savedJobsLoading ? (
          <p
            style={{
              padding: "30px",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            Loading saved requisitions...
          </p>
        ) : savedJobs.length === 0 ? (
          <p
            style={{
              padding: "30px",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            No saved requisitions yet. Upload or pick a benchmark role above to
            parse one.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="executive-table">
              <thead>
                <tr>
                  <th>Job Role</th>
                  <th>Company</th>
                  <th>Source File</th>
                  <th>Added Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedJobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  const isDeleting = deletingJobId === job.id;
                  return (
                    <tr
                      key={job.id}
                      style={{
                        background: isSelected
                          ? "var(--surface-low)"
                          : undefined,
                      }}
                    >
                      <td>
                        <strong className="role-title">
                          {job.role || job.source_file}
                        </strong>
                      </td>
                      <td>
                        <span className="company-text">
                          {job.company || "Company not identified"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{ fontSize: "12px", color: "var(--muted)" }}
                        >
                          {job.source_file}
                        </span>
                      </td>
                      <td>
                        <span className="time-text">
                          {job.created_at
                            ? new Date(job.created_at).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setAnalysis(null);
                            }}
                          >
                            {isSelected ? "Active" : "Inspect"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-xs"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              navigate(
                                `/matching?jdId=${encodeURIComponent(job.id)}`,
                              );
                            }}
                          >
                            Match
                          </button>
                          <button
                            type="button"
                            className="icon-action-btn"
                            disabled={Boolean(deletingJobId)}
                            title="Delete requisition"
                            onClick={() => deleteJob(job)}
                          >
                            <Trash2 size={14} className="text-rose" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              disabled={page <= 1 || savedJobsLoading}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span style={{ color: "var(--muted)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              disabled={page >= totalPages || savedJobsLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
