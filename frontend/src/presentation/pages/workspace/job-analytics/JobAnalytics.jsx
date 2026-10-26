import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { setAnalyzedJob } from "../../../../application/store/appSlice";
import { PageHeading } from "../../../components/shared/PagePrimitives";

export function JobAnalytics() {
  const [description, setDescription] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const dispatch = useDispatch();
  function analyze(event) {
    event.preventDefault();
    if (description.trim().length < 30) {
      window.alert(
        "Add a little more detail to the job description (at least 30 characters).",
      );
      return;
    }
    setAnalyzed(true);
    dispatch(setAnalyzedJob("Google · Software Engineer"));
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="UNDERSTAND THE OPPORTUNITY"
        title="Job description analytics"
        description="Make sense of a job description before you apply. See the skills, experience, and signals employers are looking for."
      />
      <div className="analytics-layout">
        <section className="panel analyze-form-panel">
          <div className="panel-heading">
            <div>
              <span className="step-badge">01</span>
              <h2>Analyze a job description</h2>
              <p>Paste a job description or upload the file.</p>
            </div>
            <div className="soft-icon purple">
              <WandSparkles size={19} />
            </div>
          </div>
          <form onSubmit={analyze}>
            <label className="field-label">
              Job description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={
                  "Paste the full job description here...\n\nInclude responsibilities, qualifications, and skills for the clearest analysis."
                }
                rows={9}
              />
            </label>
            <div className="textarea-footer">
              <span>{description.length} characters</span>
              <span>We only use this to create your analysis.</span>
            </div>
            <button className="button button-primary" type="submit">
              <Sparkles size={16} /> Analyze job description
            </button>
          </form>
        </section>
        <aside className="analytics-side">
          <div className="panel insight-card">
            <div className="soft-icon blue">
              <Lightbulb size={19} />
            </div>
            <h3>Get more from your analysis</h3>
            <p>
              For the best results, include the complete job description,
              especially the skills and qualifications sections.
            </p>
          </div>
          <div className="panel past-analysis">
            <div className="panel-heading">
              <div>
                <h3>Recent analyses</h3>
              </div>
              <span className="count-pill">3</span>
            </div>
            {[
              "Software Engineer · Google",
              "Frontend Engineer · Atlassian",
              "Product Analyst · Airbnb",
            ].map((job, i) => (
              <div className="past-row" key={job}>
                <span className={`company-mark company-${i}`}>
                  {["G", "A", "a"][i]}
                </span>
                <div>
                  <b>{job.split(" · ")[0]}</b>
                  <span>
                    {job.split(" · ")[1]} · {i ? "Oct 21" : "Today"}
                  </span>
                </div>
                <ArrowRight size={15} />
              </div>
            ))}
          </div>
        </aside>
      </div>
      {analyzed && (
        <section className="analysis-results panel">
          <div className="results-header">
            <div>
              <span className="eyebrow">ANALYSIS COMPLETE</span>
              <h2>Software Engineer at Google</h2>
              <p>
                Here's what this role is looking for. Use it to focus your next
                steps.
              </p>
            </div>
            <span className="status-badge success">
              <CheckCircle2 size={15} /> Job analyzed
            </span>
          </div>
          <div className="results-metrics">
            <div>
              <span>Experience</span>
              <b>2–4 years</b>
            </div>
            <div>
              <span>Seniority</span>
              <b>Mid-level</b>
            </div>
            <div>
              <span>Key skills</span>
              <b>12 identified</b>
            </div>
          </div>
          <h3 className="results-subtitle">Most requested skills</h3>
          <div className="tag-list">
            {[
              "Java",
              "DSA",
              "System design",
              "React",
              "SQL",
              "AWS",
              "Docker",
            ].map((skill) => (
              <span className="skill-tag" key={skill}>
                {skill}
              </span>
            ))}
          </div>
          <Link className="button button-primary inline-button" to="/matching">
            Compare with my profile <ArrowRight size={15} />
          </Link>
        </section>
      )}
      <section className="tip-banner">
        <div className="tip-icon">
          <Lightbulb size={18} />
        </div>
        <div>
          <b>Turn insight into action</b>
          <span>
            Compare the role with your profile to spot strengths and close your
            skill gaps.
          </span>
        </div>
        <Link to="/matching">
          Check my fit <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
