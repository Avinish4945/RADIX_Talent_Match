import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { setMatchingResults } from "../../../../application/store/appSlice";
import { getProfile } from "../../../../infrastructure/api/profile";
import { runSkillMatch } from "../../../../infrastructure/api/skillMatch";
import { getJobDescriptions } from "../job-analytics/jdApi";
import { PageHeading } from "../../../components/shared/PagePrimitives";
import { PieChart } from "../../../components/shared/PieChart";

const EMPTY_SKILLS = [];

function MatchSkills({ title, skills, type }) {
  const Icon = type === "missing" ? XCircle : CheckCircle2;

  return (
    <section className={`match-outcome match-outcome-${type}`}>
      <h3>
        <Icon size={16} />
        {title} <span>{skills.length}</span>
      </h3>
      {skills.length ? (
        <div className="match-outcome-list">
          {skills.map((skill) => (
            <article
              className="match-outcome-skill"
              key={`${skill.category_code}-${skill.skill_name}`}
            >
              <div>
                <b>{skill.skill_name}</b>
                <span className="status-badge">{skill.category_code}</span>
              </div>
              {skill.candidate_skill && (
                <p>
                  Profile match: {skill.candidate_skill}
                  {skill.match_type === "partial" ? " · partial" : ""}
                </p>
              )}
              {skill.evidence && <small>{skill.evidence}</small>}
            </article>
          ))}
        </div>
      ) : (
        <p className="preview-guidance">None</p>
      )}
    </section>
  );
}

export function SkillMatching() {
  const profile = useSelector((state) => state.app.profile);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get("jdId") || "";
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(
    Boolean(profile.backendProfileId),
  );
  const [profileError, setProfileError] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [result, setResult] = useState(null);

  const selectedJob = useMemo(
    () => jobDescriptions.find((job) => job.id === selectedJobId) || null,
    [jobDescriptions, selectedJobId],
  );

  const effectiveProfile = useMemo(() => {
    if (candidateProfile) return candidateProfile;
    if (profile && (profile.skills?.length > 0 || profile.name)) {
      return {
        id: profile.backendProfileId || profile.id || "current-profile",
        name: profile.name || "Candidate",
        email: profile.email || "",
        skills: profile.skills || [],
        preferred_roles:
          profile.preferred_roles || (profile.role ? [profile.role] : []),
        education: profile.education
          ? [
              {
                degree: profile.education || "",
                university: profile.university || "",
                year: profile.year || "",
              },
            ]
          : [],
      };
    }
    return null;
  }, [candidateProfile, profile]);

  const candidateSkills = useMemo(
    () =>
      (effectiveProfile?.skills || []).map((skill) =>
        typeof skill === "string"
          ? {
              skill_name: skill,
              category_code: "OTHER",
              evidence: "Listed in candidate profile",
              confidence: "medium",
            }
          : skill,
      ),
    [effectiveProfile],
  );

  useEffect(() => {
    let active = true;

    async function loadJobDescriptions() {
      setJobsLoading(true);
      setJobsError("");
      try {
        const firstPage = await getJobDescriptions({ page: 1, pageSize: 100 });
        const remainingPages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstPage.total_pages - 1) },
            (_, index) =>
              getJobDescriptions({ page: index + 2, pageSize: 100 }),
          ),
        );
        if (active) {
          setJobDescriptions([
            ...(firstPage.job_descriptions || []),
            ...remainingPages.flatMap((page) => page.job_descriptions || []),
          ]);
        }
      } catch (requestError) {
        if (active) setJobsError(requestError.message);
      } finally {
        if (active) setJobsLoading(false);
      }
    }

    loadJobDescriptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCandidateProfile() {
      const pid =
        profile.backendProfileId ||
        localStorage.getItem("radix-saved-profile-id");
      if (!pid) {
        setCandidateProfile(null);
        setProfileLoading(false);
        setProfileError("");
        return;
      }

      setProfileLoading(true);
      setProfileError("");
      try {
        const savedProfile = await getProfile(pid);
        if (active) setCandidateProfile(savedProfile);
      } catch (requestError) {
        if (active) setProfileError(requestError.message);
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadCandidateProfile();
    return () => {
      active = false;
    };
  }, [profile.backendProfileId]);

  function selectJob(jobId) {
    setResult(null);
    setMatchError("");
    setSearchParams(jobId ? { jdId: jobId } : {});
  }

  async function runMatching() {
    if (!selectedJob || !effectiveProfile) return;
    setMatching(true);
    setMatchError("");
    try {
      const matchResult = await runSkillMatch({
        candidateSkills,
        jdSkills: selectedJob.skills || [],
        candidateId: effectiveProfile.id,
        jdSourceFile: selectedJob.source_file,
        company: selectedJob.company,
        role: selectedJob.role,
      });
      setResult(matchResult);
      dispatch(
        setMatchingResults({
          role: selectedJob.role || selectedJob.source_file,
          company: selectedJob.company,
          score: matchResult.match_score,
          count: matchResult.summary.jd_skill_count,
          createdAt: new Date().toISOString(),
        }),
      );
    } catch (requestError) {
      setMatchError(requestError.message);
    } finally {
      setMatching(false);
    }
  }

  const jdSkills = selectedJob?.skills || EMPTY_SKILLS;
  const hasSkills = jdSkills.length > 0;
  const hasProfileSkills = candidateSkills.length > 0;

  return (
    <div className="page skill-matching-page">
      <PageHeading
        eyebrow="YOUR SKILLS, THE RIGHT ROLE"
        title="Skill Matching"
        description="Compare your profile skills against requirements extracted from a saved job description."
        action={<span className="secure-note">Saved JD data</span>}
      />
      {effectiveProfile && (
        <section className="panel candidate-match-preview">
          <div className="candidate-match-heading">
            <div className="candidate-match-avatar">
              {(effectiveProfile.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="eyebrow">CANDIDATE PROFILE</span>
              <h2>{effectiveProfile.name || "Candidate"}</h2>
              <p>{effectiveProfile.email || "No email provided"}</p>
            </div>
            <span className="status-badge">
              {candidateSkills.length} profile skills
            </span>
          </div>
          <div className="candidate-match-meta">
            {(effectiveProfile.preferred_roles || []).length > 0 && (
              <span>
                Preferred role: {effectiveProfile.preferred_roles.join(", ")}
              </span>
            )}
            {(effectiveProfile.education || []).map((education, index) => (
              <span key={`${education.university}-${index}`}>
                {[education.degree, education.university, education.year]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            ))}
          </div>
          {hasProfileSkills ? (
            <div className="candidate-match-skills">
              {candidateSkills.map((skill, index) => (
                <span key={`${skill.skill_name}-${index}`}>
                  {skill.skill_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="preview-guidance">
              This saved candidate profile has no skills to match yet.
            </p>
          )}
        </section>
      )}
      <section className="panel matching-controls">
        <div className="matching-control-copy">
          <div className="soft-icon pink">
            <Target size={19} />
          </div>
          <div>
            <b>Select a job description</b>
            <span>
              Match your profile against the skills extracted in JD Analytics.
            </span>
          </div>
        </div>
        <div className="matching-control-actions">
          <label className="talent-select-label">
            <span>Saved job description</span>
            <select
              value={selectedJobId}
              onChange={(event) => selectJob(event.target.value)}
              disabled={jobsLoading || jobDescriptions.length === 0}
              aria-label="Select saved job description"
            >
              <option value="">
                {jobsLoading ? "Loading saved jobs..." : "Choose a saved JD"}
              </option>
              {jobDescriptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.role || job.source_file}
                  {job.company ? ` · ${job.company}` : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button-primary"
            type="button"
            onClick={runMatching}
            disabled={
              !selectedJob ||
              !hasSkills ||
              !effectiveProfile ||
              !hasProfileSkills ||
              matching ||
              profileLoading
            }
          >
            <Sparkles size={16} />
            {profileLoading
              ? "Loading profile..."
              : matching
                ? "Matching skills..."
                : "Match my skills"}
          </button>
        </div>
      </section>
      {jobsError && (
        <p className="form-error" role="alert">
          Could not load saved job descriptions: {jobsError}
        </p>
      )}
      {profileError && (
        <p className="form-error" role="alert">
          Could not load your saved profile: {profileError}
        </p>
      )}
      {!profileLoading && !effectiveProfile && (
        <div className="panel no-results">
          <Target size={22} />
          <h3>No profile found</h3>
          <p>
            Build your profile in Profile Builder or parse a resume to compare
            against job descriptions.
          </p>
          <Link className="button button-outline" to="/profile">
            Go to Profile Builder <ArrowRight size={15} />
          </Link>
        </div>
      )}
      {!profileLoading && effectiveProfile && !hasProfileSkills && (
        <div className="panel no-results">
          <Target size={22} />
          <h3>No skills in your profile</h3>
          <p>Add profile skills before comparing against a job description.</p>
          <Link className="button button-outline" to="/profile">
            Add profile skills <ArrowRight size={15} />
          </Link>
        </div>
      )}
      {!jobsLoading && !jobsError && jobDescriptions.length === 0 && (
        <div className="panel no-results">
          <Search size={22} />
          <h3>No saved job descriptions yet</h3>
          <p>Analyze a job description first to use its requirements here.</p>
          <Link className="button button-outline" to="/analytics">
            Go to JD Analytics <ArrowRight size={15} />
          </Link>
        </div>
      )}
      {selectedJob && (
        <section className="panel match-jd-preview">
          <div className="match-jd-heading">
            <div>
              <span className="eyebrow">SELECTED JOB DESCRIPTION</span>
              <h2>{selectedJob.role || selectedJob.source_file}</h2>
              <p>
                {selectedJob.company || "Company not identified"} ·{" "}
                {selectedJob.source_file}
              </p>
            </div>
            <span className="status-badge">
              {jdSkills.length} extracted skills
            </span>
          </div>
          {hasSkills ? (
            <div className="job-tags">
              {jdSkills.map((skill) => (
                <span key={`${skill.category_code}-${skill.skill_name}`}>
                  {skill.skill_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="preview-guidance">
              No required skills were extracted for this job description.
            </p>
          )}
        </section>
      )}
      {matchError && (
        <p className="form-error" role="alert">
          Skill matching failed: {matchError}
        </p>
      )}
      {!result && selectedJob && (
        <div className="panel no-results">
          <Sparkles size={22} />
          <h3>Ready when you are</h3>
          <p>Select a saved job description and run a skill match.</p>
        </div>
      )}
      {result && (
        <section className="panel match-result" aria-live="polite">
          <div className="match-result-heading">
            <div>
              <span className="eyebrow">SKILL MATCH RESULTS</span>
              <h2>{selectedJob?.role || selectedJob?.source_file}</h2>
              <p>
                {selectedJob?.company || "Company not identified"} ·{" "}
                {result.summary.candidate_skill_count} profile skills compared
                with {result.summary.jd_skill_count} JD requirements
              </p>
            </div>
            <div className="match-result-score">
              <b>{result.match_score}%</b>
              <span>skill match</span>
            </div>
          </div>
          <div className="match-result-summary">
            <span className="match-summary-matched">
              <CheckCircle2 size={14} />
              {result.summary.matched} matched
            </span>
            <span className="match-summary-partial">
              <Sparkles size={14} />
              {result.summary.partial} partial
            </span>
            <span className="match-summary-missing">
              <XCircle size={14} />
              {result.summary.missing} not found
            </span>
          </div>
          <PieChart
            title="Skill match breakdown"
            centerLabel="JD skills"
            data={[
              {
                label: "Matched",
                value: result.summary.matched,
                color: "#25a875",
              },
              {
                label: "Partial",
                value: result.summary.partial,
                color: "#e5a436",
              },
              {
                label: "Not found",
                value: result.summary.missing,
                color: "#df6570",
              },
            ]}
          />
          <div className="match-outcome-grid">
            <MatchSkills
              title="Matched skills"
              skills={result.matched_skills}
              type="matched"
            />
            <MatchSkills
              title="Partial matches"
              skills={result.partial_matches}
              type="partial"
            />
            <MatchSkills
              title="Not found in profile (Gap List)"
              skills={result.missing_skills}
              type="missing"
            />
          </div>
          <p className="match-result-note">
            <Lightbulb size={15} />
            Missing means the skill was not found in your profile; it does not
            prove you lack that skill.
          </p>
        </section>
      )}
      <div className="tip-banner">
        <div className="tip-icon">
          <Lightbulb size={18} />
        </div>
        <div>
          <b>Improve the comparison with your profile</b>
          <span>
            Add skills you can support with experience or evidence before
            matching against a job description.
          </span>
        </div>
        <Link to="/profile">
          Edit skills in My profile <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
