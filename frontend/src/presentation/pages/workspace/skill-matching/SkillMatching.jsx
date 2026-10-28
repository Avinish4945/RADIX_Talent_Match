import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { setMatchingResults } from "../../../../application/store/appSlice";
import { jobs } from "../../../../infrastructure/demo/demoData";
import { PageHeading } from "../../../components/shared/PagePrimitives";

export function SkillMatching() {
  const profile = useSelector((state) => state.app.profile);
  const [role, setRole] = useState("Software Engineer");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const dispatch = useDispatch();
  const profileSkills = (profile.skills || [])
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);

  const filteredJobs = useMemo(
    () =>
      matches.filter((job) =>
        `${job.role} ${job.company} ${job.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [matches, query],
  );

  function runMatching() {
    const roleMatches = jobs
      .filter((job) => job.role.toLowerCase().includes(role.toLowerCase()))
      .map((job) => {
        const matchedSkills = job.tags.filter((tag) =>
          profileSkills.includes(tag.trim().toLowerCase()),
        );
        return {
          ...job,
          matchedSkills,
          score: job.tags.length
            ? Math.round((matchedSkills.length / job.tags.length) * 100)
            : 0,
        };
      });

    setMatches(roleMatches);
    setSelectedJob(null);
    setHasRun(true);
    dispatch(
      setMatchingResults({
        role,
        count: roleMatches.length,
        createdAt: new Date().toISOString(),
      }),
    );
  }

  return (
    <div className="page">
      <PageHeading
        eyebrow="YOUR SKILLS, THE RIGHT ROLE"
        title="Skill matching"
        description="Compare your profile skills with a small set of sample roles. These are illustrative, not live vacancies."
        action={<span className="secure-note">Sample role data</span>}
      />
      <section className="panel matching-controls">
        <div className="matching-control-copy">
          <div className="soft-icon pink">
            <Target size={19} />
          </div>
          <div>
            <b>What kind of role are you looking for?</b>
            <span>
              The preview compares your listed skills with sample role tags.
            </span>
          </div>
        </div>
        <div className="matching-control-actions">
          <label className="talent-select-label">
            <span>Target role</span>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setHasRun(false);
                setSelectedJob(null);
              }}
            >
              <option>Software Engineer</option>
              <option>Frontend Engineer</option>
              <option>Product Analyst</option>
              <option>Data Analyst</option>
            </select>
          </label>
          <button className="button button-primary" onClick={runMatching}>
            <Sparkles size={16} /> Match my skills
          </button>
        </div>
      </section>
      {hasRun && matches.length > 0 && (
        <div className="match-summary">
          <div>
            <div className="eyebrow">SAMPLE ROLE RESULTS</div>
            <h2>Roles matching “{role}”</h2>
            <p>
              {filteredJobs.length} of {matches.length} sample roles shown ·
              skill overlap is based on your profile
            </p>
          </div>
          <label className="result-search">
            <Search size={16} />
            <input
              aria-label="Search sample role results"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sample roles..."
            />
          </label>
        </div>
      )}
      {!hasRun && (
        <div className="panel no-results">
          <Sparkles size={22} />
          <h3>Ready when you are</h3>
          <p>Choose a target role and run a preview against sample roles.</p>
        </div>
      )}
      {hasRun && matches.length === 0 && (
        <div className="panel no-results" aria-live="polite">
          <Search size={22} />
          <h3>No sample roles for {role}</h3>
          <p>
            This demo dataset covers Software Engineer and Frontend Engineer
            roles. It does not contain live vacancies.
          </p>
        </div>
      )}
      {hasRun && matches.length > 0 && filteredJobs.length === 0 && (
        <div className="panel no-results" aria-live="polite">
          <Search size={22} />
          <h3>No sample roles found</h3>
          <p>Try a different search term.</p>
        </div>
      )}
      <div className="job-match-grid">
        {filteredJobs.map((job) => (
          <article className="panel job-card" key={job.company}>
            <div className="job-card-heading">
              <div className={`company-mark company-${job.color}`}>
                {job.initials}
              </div>
              <span className="status-badge">Sample role</span>
            </div>
            <h3>{job.role}</h3>
            <p className="job-company">
              {job.company} <span>·</span> Demo dataset
            </p>
            <div className="job-score-line">
              <div>
                <b>{job.score}%</b>
                <span>profile skill overlap</span>
              </div>
              <div
                className="job-progress"
                role="progressbar"
                aria-label={`${job.role} skill overlap`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={job.score}
              >
                <i style={{ width: `${job.score}%` }} />
              </div>
            </div>
            <div className="job-match-stats">
              <span>
                <CheckCircle2 size={14} /> {job.matchedSkills.length} of{" "}
                {job.tags.length} listed skills overlap
              </span>
            </div>
            <div className="job-tags">
              {job.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <button
              className="button button-outline full-button"
              aria-expanded={selectedJob?.company === job.company}
              onClick={() =>
                setSelectedJob(
                  selectedJob?.company === job.company ? null : job,
                )
              }
            >
              {selectedJob?.company === job.company
                ? "Hide details"
                : "View skill details"}{" "}
              <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>
      {selectedJob && (
        <section className="panel selected-match-details" aria-live="polite">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SAMPLE ROLE DETAILS</span>
              <h2>{selectedJob.role}</h2>
              <p>{selectedJob.company} · illustrative sample data</p>
            </div>
            <span className="status-badge">
              {selectedJob.matchedSkills.length} matching skills
            </span>
          </div>
          <div className="tag-list">
            {selectedJob.tags.map((skill) => (
              <span
                className={
                  selectedJob.matchedSkills.includes(skill)
                    ? "skill-tag"
                    : "skill-tag missing"
                }
                key={skill}
              >
                {skill}
                {selectedJob.matchedSkills.includes(skill)
                  ? " · in profile"
                  : " · not listed"}
              </span>
            ))}
          </div>
        </section>
      )}
      <div className="tip-banner">
        <div className="tip-icon">
          <Lightbulb size={18} />
        </div>
        <div>
          <b>Sample comparisons are a starting point</b>
          <span>
            Add your skills to your profile to see the overlap calculation.
          </span>
        </div>
        <Link to="/profile">
          Edit skills in My profile <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
