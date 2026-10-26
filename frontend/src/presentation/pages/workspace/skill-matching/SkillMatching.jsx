import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Lightbulb,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { jobs } from "../../../../infrastructure/demo/demoData";
import { PageHeading } from "../../../components/shared/PagePrimitives";

export function SkillMatching() {
  const profile = useSelector((state) => state.app.profile);
  const [role, setRole] = useState("Software Engineer");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(jobs);
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
    setMatches(
      [...jobs].sort(
        (a, b) =>
          b.score + profile.skills.length - (a.score + profile.skills.length),
      ),
    );
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="YOUR SKILLS, THE RIGHT ROLE"
        title="Skill matching"
        description="Find opportunities that make sense for your experience, strengths, and next career move."
        action={
          <span className="secure-note">
            <Sparkles size={16} /> Personalized for you
          </span>
        }
      />
      <section className="panel matching-controls">
        <div className="matching-control-copy">
          <div className="soft-icon pink">
            <Target size={19} />
          </div>
          <div>
            <b>What kind of role are you looking for?</b>
            <span>
              We'll compare your skills with roles that match your goals.
            </span>
          </div>
        </div>
        <div className="matching-control-actions">
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            aria-label="Select role"
          >
            <option>Software Engineer</option>
            <option>Frontend Engineer</option>
            <option>Product Analyst</option>
            <option>Data Analyst</option>
          </select>
          <button className="button button-primary" onClick={runMatching}>
            <Sparkles size={16} /> Match my skills
          </button>
        </div>
      </section>
      <div className="match-summary">
        <div>
          <div className="eyebrow">YOUR RESULTS</div>
          <h2>Roles that fit your skills</h2>
          <p>
            Based on your profile with {profile.skills.length} skills ·{" "}
            {filteredJobs.length} strong matches
          </p>
        </div>
        <label className="result-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search matches..."
          />
        </label>
      </div>
      <div className="job-match-grid">
        {filteredJobs.map((job) => (
          <article className="panel job-card" key={job.company}>
            <div className="job-card-heading">
              <div className={`company-mark company-${job.color}`}>
                {job.initials}
              </div>
              <span className="status-badge success">
                <i /> Good match
              </span>
            </div>
            <h3>{job.role}</h3>
            <p className="job-company">
              {job.company} <span>·</span> {role}
            </p>
            <div className="job-score-line">
              <div>
                <b>{job.score}%</b>
                <span>skills match</span>
              </div>
              <div className="job-progress">
                <i style={{ width: `${job.score}%` }} />
              </div>
            </div>
            <div className="job-match-stats">
              <span>
                <CheckCircle2 size={14} /> {Math.round(job.score / 12)} matched
                skills
              </span>
              <span>
                <CircleHelp size={14} />{" "}
                {Math.max(1, 12 - Math.round(job.score / 12))} to explore
              </span>
            </div>
            <div className="job-tags">
              {job.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <button
              className="button button-outline full-button"
              onClick={() =>
                window.alert(
                  `${job.role} at ${job.company} is a ${job.score}% match for your profile.`,
                )
              }
            >
              View match details <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>
      {filteredJobs.length === 0 && (
        <div className="panel no-results">
          <Search size={22} />
          <h3>No matches found</h3>
          <p>
            Try another search or update your skills to discover more roles.
          </p>
        </div>
      )}
      <div className="tip-banner">
        <div className="tip-icon">
          <Lightbulb size={18} />
        </div>
        <div>
          <b>A match is a starting point</b>
          <span>
            Use the skill breakdown to decide which opportunities are worth
            exploring.
          </span>
        </div>
        <Link to="/profile">
          Update skills <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
