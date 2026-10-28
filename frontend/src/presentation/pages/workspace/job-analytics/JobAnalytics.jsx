import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb, Sparkles, WandSparkles } from "lucide-react";
import { setAnalyzedJob } from "../../../../application/store/appSlice";
import { PageHeading } from "../../../components/shared/PagePrimitives";

const supportedKeywords = [
  "Accessibility",
  "Agile",
  "AI",
  "AWS",
  "Azure",
  "C#",
  "C++",
  "CSS",
  "Data analysis",
  "Docker",
  "Figma",
  "Git",
  "Java",
  "JavaScript",
  "Kubernetes",
  "Machine learning",
  "Node.js",
  "Python",
  "React",
  "Research",
  "SQL",
  "System design",
  "TypeScript",
  "UX",
];

function findSupportedKeywords(description) {
  const normalized = description.toLowerCase();
  return supportedKeywords.filter((keyword) => {
    const escaped = keyword
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const boundaryPattern = new RegExp(
      `(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
      "i",
    );
    return boundaryPattern.test(normalized);
  });
}

export function JobAnalytics() {
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [validationError, setValidationError] = useState("");
  const textareaRef = useRef(null);
  const dispatch = useDispatch();

  function analyze(event) {
    event.preventDefault();
    if (description.trim().length < 30) {
      setValidationError(
        "Enter at least 30 characters to create a keyword preview.",
      );
      textareaRef.current?.focus();
      return;
    }

    const keywords = findSupportedKeywords(description);
    const result = {
      title: "Job description keyword preview",
      keywords,
      characterCount: description.trim().length,
      createdAt: new Date().toISOString(),
    };
    setAnalysis(result);
    setValidationError("");
    dispatch(setAnalyzedJob(result));
  }

  return (
    <div className="page">
      <PageHeading
        eyebrow="UNDERSTAND THE OPPORTUNITY"
        title="Job description analytics"
        description="Review supported skill keywords found in the job description you provide."
      />
      <div className="analytics-layout">
        <section className="panel analyze-form-panel">
          <div className="panel-heading">
            <div>
              <span className="step-badge">01</span>
              <h2>Preview a job description</h2>
              <p>Paste a job description to find supported keyword mentions.</p>
            </div>
            <div className="soft-icon purple">
              <WandSparkles size={19} />
            </div>
          </div>
          <form onSubmit={analyze} noValidate>
            <label className="field-label" htmlFor="job-description">
              Job description
              <textarea
                id="job-description"
                ref={textareaRef}
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setValidationError("");
                }}
                aria-invalid={Boolean(validationError)}
                aria-describedby={
                  validationError
                    ? "job-description-error job-description-count"
                    : "job-description-count"
                }
                placeholder={
                  "Paste the job description here...\n\nThis local preview only flags supported keyword mentions. It does not infer requirements."
                }
                rows={9}
              />
            </label>
            <div className="textarea-footer" id="job-description-count">
              <span>{description.length} characters</span>
              <span>Text is analyzed in this browser.</span>
            </div>
            {validationError && (
              <p
                className="form-error inline-form-error"
                id="job-description-error"
                role="alert"
              >
                {validationError}
              </p>
            )}
            <button className="button button-primary" type="submit">
              <Sparkles size={16} /> Preview keywords
            </button>
          </form>
        </section>
        <aside className="analytics-side">
          <div className="panel insight-card">
            <div className="soft-icon blue">
              <Lightbulb size={19} />
            </div>
            <h3>About this preview</h3>
            <p>
              This demo checks the text you paste for a curated list of
              supported skill terms. It is not an AI analysis and may miss
              relevant skills or context.
            </p>
          </div>
          <div className="panel past-analysis">
            <div className="panel-heading">
              <div>
                <h3>What is checked</h3>
              </div>
            </div>
            <p className="preview-guidance">
              Keywords such as programming languages, cloud tools, data
              technologies, and design terms. No company, role, seniority, or
              experience requirement is guessed.
            </p>
          </div>
        </aside>
      </div>
      {analysis && (
        <section className="analysis-results panel" aria-live="polite">
          <div className="results-header">
            <div>
              <span className="eyebrow">LOCAL KEYWORD PREVIEW</span>
              <h2>Keywords found in your text</h2>
              <p>
                {analysis.characterCount} characters checked. No role,
                experience level, or company was inferred.
              </p>
            </div>
            <span className="status-badge">Demo preview</span>
          </div>
          <h3 className="results-subtitle">Supported keyword mentions</h3>
          {analysis.keywords.length ? (
            <div className="tag-list">
              {analysis.keywords.map((skill) => (
                <span className="skill-tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="preview-guidance">
              No supported keywords were found in this text. Nothing was
              inferred.
            </p>
          )}
          <Link className="button button-primary inline-button" to="/matching">
            Browse sample roles <ArrowRight size={15} />
          </Link>
        </section>
      )}
      <section className="tip-banner">
        <div className="tip-icon">
          <Lightbulb size={18} />
        </div>
        <div>
          <b>Use this as a quick text check</b>
          <span>
            Review the original job description for context before deciding
            which skills matter.
          </span>
        </div>
        <Link to="/matching">
          Browse sample roles <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
