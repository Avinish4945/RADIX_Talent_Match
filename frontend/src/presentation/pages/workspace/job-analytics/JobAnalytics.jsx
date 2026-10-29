import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileSearch,
  Lightbulb,
  Sparkles,
  Tags,
  Trash2,
  WandSparkles,
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

export function JobAnalytics() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);
  const [savedJobsError, setSavedJobsError] = useState("");
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const dispatch = useDispatch();

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
  }, [selectedJobId, detailRefreshKey]);

  function selectFile(file) {
    setSelectedFile(file);
    setError("");
  }

  async function analyze(event) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Choose a PDF or DOCX job description to analyze.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Choose a file that is 10 MB or smaller.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await analyzeJobDescription(selectedFile);
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
      setError(requestError.message);
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

  return (
    <div className="page">
      <PageHeading
        eyebrow="UNDERSTAND THE OPPORTUNITY"
        title="JD Analytics"
        description="Upload a job description to extract its role, company, and required skills."
      />
      <div className="analytics-layout">
        <section className="panel analyze-form-panel">
          <div className="panel-heading">
            <div>
              <span className="step-badge">01</span>
              <h2>Analyze a job description</h2>
              <p>Upload a PDF or DOCX file (maximum 10 MB).</p>
            </div>
            <div className="soft-icon purple">
              <WandSparkles size={19} />
            </div>
          </div>
          <form className="jd-upload-form" onSubmit={analyze}>
            <UploadCard
              title="Drop your job description here"
              description="Use a PDF or DOCX job description to get started."
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              filename={selectedFile?.name || ""}
              onFile={selectFile}
              disabled={loading}
            />
            <div className="jd-upload-trust">
              <span>
                <Check size={14} /> PDF or DOCX · Up to 10 MB
              </span>
              <span>Analyzed by the RADIX backend</span>
            </div>
            {error && (
              <p className="form-error inline-form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button-primary"
              type="submit"
              disabled={loading || !selectedFile}
            >
              {loading ? null : <Sparkles size={16} />}
              {loading
                ? "Analyzing job description..."
                : "Analyze job description"}
            </button>
          </form>
        </section>
        <aside className="analytics-side">
          <div className="panel analytics-guide">
            <div className="panel-heading">
              <div>
                <h3>What you’ll get</h3>
                <p>Key details extracted from your job description.</p>
              </div>
              <div className="soft-icon blue">
                <Lightbulb size={19} />
              </div>
            </div>
            <div className="preview-list">
              <div>
                <span className="preview-check">
                  <Check size={13} />
                </span>
                <span>
                  <b>Role and company</b>
                  <small>Identify the position and hiring organization</small>
                </span>
              </div>
              <div>
                <span className="preview-check">
                  <Tags size={13} />
                </span>
                <span>
                  <b>Required skills</b>
                  <small>Organized into RADIX skill categories</small>
                </span>
              </div>
              <div>
                <span className="preview-check">
                  <FileSearch size={13} />
                </span>
                <span>
                  <b>Evidence and confidence</b>
                  <small>
                    Review each skill against the source description
                  </small>
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <section className="panel jd-saved-panel" aria-live="polite">
        <div className="panel-heading">
          <div className="jd-saved-title">
            <span className="soft-icon purple">
              <BriefcaseBusiness size={17} />
            </span>
            <div>
              <h2>Saved job descriptions</h2>
              <p>
                Saved analyses are loaded from the backend and remain available
                after refresh.
              </p>
            </div>
          </div>
          <span className="status-badge">
            {savedJobsLoading ? "Loading..." : `${totalJobs} saved`}
          </span>
        </div>
        {deleteError && (
          <p className="form-error jd-delete-error" role="alert">
            Could not delete job description: {deleteError}
          </p>
        )}
        {savedJobsError && (
          <p className="form-error" role="alert">
            Could not load saved job descriptions: {savedJobsError}
          </p>
        )}
        {!savedJobsLoading && !savedJobsError && savedJobs.length === 0 && (
          <p className="preview-guidance">
            No saved job descriptions yet. Analyze a PDF or DOCX above to add
            one.
          </p>
        )}
        {savedJobs.length > 0 && (
          <div className="jd-saved-list">
            {savedJobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              const isDeleting = deletingJobId === job.id;
              return (
                <div
                  className={`jd-saved-row${isSelected ? " is-selected" : ""}`}
                  key={job.id}
                >
                  <button
                    className="jd-saved-item"
                    type="button"
                    aria-pressed={isSelected}
                    disabled={Boolean(deletingJobId)}
                    onClick={() => {
                      if (isSelected) {
                        if (detailError) {
                          setDetailRefreshKey((key) => key + 1);
                        }
                        return;
                      }
                      setSelectedJobId(job.id);
                      setAnalysis(null);
                      setDetailError("");
                    }}
                  >
                    <span className="jd-saved-item-icon">
                      <BriefcaseBusiness size={17} />
                    </span>
                    <span className="jd-saved-item-copy">
                      <b>{job.role || job.source_file}</b>
                      <small>
                        {job.company || "Company not identified"} ·{" "}
                        {job.source_file}
                      </small>
                    </span>
                    <span className="jd-saved-item-meta">
                      <span className="jd-saved-item-date">
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString()
                          : ""}
                      </span>
                      <span className="jd-open-label">
                        {isSelected ? "Selected" : "View details"}
                      </span>
                    </span>
                  </button>
                  <button
                    className="jd-delete-button"
                    type="button"
                    aria-label={`Delete ${job.role || job.source_file}`}
                    title="Delete saved job"
                    disabled={Boolean(deletingJobId)}
                    onClick={() => deleteJob(job)}
                  >
                    <Trash2 size={16} />
                    <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="jd-pagination">
            <button
              className="button button-outline"
              type="button"
              disabled={page <= 1 || savedJobsLoading}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="button button-outline"
              type="button"
              disabled={page >= totalPages || savedJobsLoading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
      {(detailLoading || detailError) && (
        <section className="panel" aria-live="polite">
          {detailLoading && (
            <p className="preview-guidance">Loading job description...</p>
          )}
          {detailError && (
            <p className="form-error" role="alert">
              Could not load this job description: {detailError}
            </p>
          )}
        </section>
      )}
      {analysis && (
        <section className="analysis-results panel" aria-live="polite">
          <div className="results-header">
            <div>
              <span className="eyebrow">JOB DESCRIPTION ANALYZED</span>
              <h2>{analysis.role || analysis.source_file}</h2>
              <p>
                {analysis.company || "Company not identified"} ·{" "}
                {analysis.source_file}
              </p>
            </div>
            <span className="status-badge">
              {analysis.skills.length} skills extracted
            </span>
          </div>
          <h3 className="results-subtitle">Required skills</h3>
          {analysis.skills.length ? (
            <div className="jd-skill-list">
              {analysis.skills.map((skill) => (
                <article
                  className="jd-skill"
                  key={`${skill.category_code}-${skill.skill_name}`}
                >
                  <div className="jd-skill-heading">
                    <b>{skill.skill_name}</b>
                    <span className="status-badge">{skill.category_code}</span>
                  </div>
                  <p>{skill.evidence}</p>
                  <small>Confidence: {skill.confidence}</small>
                </article>
              ))}
            </div>
          ) : (
            <p className="preview-guidance">
              No skills were extracted from this job description.
            </p>
          )}
          <Link
            className="button button-primary inline-button"
            to={`/matching?jdId=${encodeURIComponent(analysis.id)}`}
          >
            Match my skills to this JD <ArrowRight size={15} />
          </Link>
        </section>
      )}
      <section className="tip-banner">
        <div className="tip-icon">
          <Lightbulb size={18} />
        </div>
        <div>
          <b>Review extracted requirements in context</b>
          <span>
            Confirm the extracted skills against the full job description before
            deciding which requirements matter.
          </span>
        </div>
        <Link to="/matching">
          Match against a saved JD <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
