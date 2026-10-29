import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { apiRequest } from "../../../../infrastructure/api/apiClient";
import { markReadinessChecked } from "../../../../application/store/appSlice";
import {
  PageHeading,
  ProgressRing,
} from "../../../components/shared/PagePrimitives";

const EMPTY_JOB_ANALYSES = [];

export function TalentCheck() {
  const dispatch = useDispatch();
  const jobAnalyses = useSelector(
    (state) => state.app.profile.jobAnalyses || EMPTY_JOB_ANALYSES,
  );
  const extractedCompanies = useMemo(
    () =>
      jobAnalyses
        .map((analysis) =>
          typeof analysis?.company === "string" ? analysis.company.trim() : "",
        )
        .filter(Boolean),
    [jobAnalyses],
  );
  const [configuredCompanies, setConfiguredCompanies] = useState([]);
  const companies = useMemo(
    () => [
      ...new Map(
        [...configuredCompanies, ...extractedCompanies].map((name) => [
          name.toLocaleLowerCase(),
          name,
        ]),
      ).values(),
    ],
    [configuredCompanies, extractedCompanies],
  );
  const [candidates, setCandidates] = useState([]);
  const [company, setCompany] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsAttempt, setOptionsAttempt] = useState(0);
  const [checking, setChecking] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);
  const selectedCompanyConfigured = configuredCompanies.some(
    (name) => name.toLocaleLowerCase() === company.toLocaleLowerCase(),
  );

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setOptionsLoading(true);
      setCompanyError("");
      setCandidateError("");
      const [companyResponse, candidateResponse] = await Promise.allSettled([
        apiRequest("/talent-check/companies"),
        apiRequest("/talent-check/candidates"),
      ]);

      if (!active) return;

      if (companyResponse.status === "fulfilled") {
        const availableCompanies = companyResponse.value.companies || [];
        setConfiguredCompanies(availableCompanies);
        setCompany(availableCompanies[0] || extractedCompanies[0] || "");
        setCompanyError(
          availableCompanies.length
            ? ""
            : "No official company requirements are configured.",
        );
      } else {
        setCompanyError(companyResponse.reason.message);
      }

      if (candidateResponse.status === "fulfilled") {
        const availableCandidates = candidateResponse.value.candidates || [];
        setCandidates(availableCandidates);
        setCandidateId("active-profile");
        setCandidateError(
          availableCandidates.length
            ? ""
            : "No candidates are available for assessment.",
        );
      } else {
        setCandidateError(candidateResponse.reason.message);
      }

      setOptionsLoading(false);
    }

    loadOptions();
    return () => {
      active = false;
    };
  }, [extractedCompanies, optionsAttempt]);

  const activeProfile = useSelector((state) => state.app.profile);

  async function runTalentCheck() {
    setChecking(true);
    setApiError("");
    setResult(null);

    try {
      const body =
        candidateId === "active-profile"
          ? { profile: activeProfile, company }
          : { candidate_id: candidateId, company };

      const response = await apiRequest("/talent-check/", {
        method: "POST",
        body,
      });
      setResult(response);
      dispatch(markReadinessChecked(response));
    } catch (error) {
      setApiError(error.message);
    } finally {
      setChecking(false);
    }
  }

  const selectedCandidate = candidates.find(
    (candidate) => candidate.id === candidateId,
  );
  const assessedGaps =
    result?.skillset_gap.filter(
      (skill) => skill.status === "assessed" && skill.gap,
    ) || [];
  const unknownSkills =
    result?.skillset_gap.filter((skill) => skill.status === "unknown") || [];

  return (
    <div className="page talent-check-page">
      <PageHeading
        eyebrow="KNOW WHERE YOU STAND"
        title="Talent Check"
        description="Compare assessed skills with configured company requirements. Candidate profiles in this demo are sample data."
        action={
          <span className="secure-note">
            <ShieldCheck size={16} /> Demo candidate data
          </span>
        }
      />
      <section className="panel check-controls">
        <div className="check-control-copy">
          <div className="soft-icon purple">
            <Target size={19} />
          </div>
          <div>
            <b>Choose a company and candidate</b>
            <span>
              Results use the configured company requirements and candidate
              profile.
            </span>
          </div>
        </div>
        <div className="check-control-actions">
          <label className="talent-select-label">
            <span>Company</span>
            <select
              value={company}
              onChange={(event) => {
                setCompany(event.target.value);
                setResult(null);
                setApiError("");
              }}
              aria-label="Select company"
              disabled={optionsLoading || companies.length === 0}
            >
              {companies.length === 0 && (
                <option value="">
                  {optionsLoading
                    ? "Loading companies..."
                    : "No companies available"}
                </option>
              )}
              {companies.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <small>
              {!company
                ? "Choose a company to see whether assessment requirements are available."
                : selectedCompanyConfigured
                  ? "Company requirements are available for this selection."
                  : "This company came from Job Analytics, but has no configured assessment requirements."}
            </small>
          </label>
          <label className="talent-select-label">
            <span>Candidate</span>
            <select
              value={candidateId}
              onChange={(event) => {
                setCandidateId(event.target.value);
                setResult(null);
                setApiError("");
              }}
              aria-label="Select candidate"
              disabled={optionsLoading || candidates.length === 0}
            >
              {candidates.length === 0 && (
                <option value="">
                  {optionsLoading
                    ? "Loading candidates..."
                    : "No candidates available"}
                </option>
              )}
              <option value="active-profile">
                ★ My Active Profile (
                {activeProfile?.name || "Workspace Profile"})
              </option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button-primary"
            onClick={runTalentCheck}
            disabled={
              optionsLoading ||
              checking ||
              !company ||
              !candidateId ||
              !selectedCompanyConfigured ||
              Boolean(candidateError)
            }
          >
            <Target size={16} />
            {optionsLoading
              ? "Loading options..."
              : checking
                ? "Checking..."
                : "Run talent check"}
          </button>
        </div>
      </section>

      {(companyError || candidateError || apiError) && (
        <section className="talent-alert" aria-live="polite">
          <div role="alert">
            {companyError && (
              <p>
                <b>Company requirements unavailable:</b> {companyError}
              </p>
            )}
            {candidateError && (
              <p>
                <b>Candidate unavailable:</b> {candidateError}
              </p>
            )}
            {apiError && (
              <p>
                <b>Talent check failed:</b> {apiError}
              </p>
            )}
          </div>
          {(companyError || candidateError) && (
            <button
              className="button button-outline"
              onClick={() => setOptionsAttempt((attempt) => attempt + 1)}
              disabled={optionsLoading}
            >
              {optionsLoading ? "Retrying..." : "Retry loading options"}
            </button>
          )}
        </section>
      )}

      {checking && (
        <div className="talent-loading" role="status">
          Checking the selected candidate against {company} requirements...
        </div>
      )}

      {result ? (
        <div className="readiness-layout">
          <section className="panel readiness-score-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">YOUR READINESS</span>
                <h2>
                  {result.company} · {selectedCandidate?.name || candidateId}
                </h2>
                <p>
                  Assessment based on configured company skill requirements.
                </p>
              </div>
              <span className="status-badge success">Assessment complete</span>
            </div>
            <div className="score-overview">
              {result.readiness_score === null ? (
                <div
                  className="score-unavailable"
                  aria-label="Readiness score unavailable"
                >
                  <b>—</b>
                  <small>not assessed</small>
                </div>
              ) : (
                <ProgressRing
                  value={result.readiness_score}
                  size={148}
                  stroke={11}
                  label="ready"
                />
              )}
              <div className="score-details">
                <h3>
                  {result.readiness_score === null
                    ? "No required skills have been assessed."
                    : `${result.readiness_score}% readiness`}
                </h3>
                <p>
                  Unknown skill levels are excluded from the readiness score.
                  Coverage shows how much of the company's requirements were
                  assessed.
                </p>
                <div className="score-metrics">
                  <div>
                    <span>Coverage</span>
                    <b>{result.coverage_percent}%</b>
                  </div>
                  <div>
                    <span>Assessed skills</span>
                    <b>
                      {result.skillset_gap.length - unknownSkills.length}/
                      {result.skillset_gap.length}
                    </b>
                  </div>
                </div>
              </div>
            </div>
            <div className="readiness-breakdown">
              <div className="breakdown-heading">
                <b>Skill-wise breakdown</b>
                <span>Candidate level compared with company requirement</span>
              </div>
              <div
                className="breakdown-table"
                role="region"
                aria-label="Skill breakdown; scroll horizontally to view every column"
                tabIndex={0}
              >
                <div className="breakdown-row table-head">
                  <span>Category</span>
                  <span>Candidate</span>
                  <span>Required</span>
                  <span>Status</span>
                </div>
                {result.skillset_gap.map((skill) => {
                  const unknown = skill.status === "unknown";
                  const meets = !unknown && !skill.gap;
                  return (
                    <div className="breakdown-row" key={skill.category_code}>
                      <b>{skill.category_code}</b>
                      <span>
                        {skill.candidate_level === null
                          ? "Unknown"
                          : `${skill.candidate_level}/10`}
                      </span>
                      <span>{skill.required_level}/10</span>
                      <span
                        className={`status-word ${unknown ? "unknown" : meets ? "meets" : "gap"}`}
                      >
                        {unknown
                          ? "Not assessed"
                          : meets
                            ? "Meets"
                            : `Gap: ${skill.gap_size}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          <aside className="panel improve-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">YOUR NEXT STEPS</span>
                <h2>Assessment summary</h2>
              </div>
              <span className="soft-icon orange">
                <Lightbulb size={18} />
              </span>
            </div>
            <p className="improve-intro">
              {assessedGaps.length
                ? "Focus on the assessed categories below to reduce your skill gaps."
                : "No assessed skill gaps were found for this candidate."}
            </p>
            <div className="improve-list">
              {assessedGaps.length ? (
                assessedGaps.map((skill, index) => (
                  <div key={skill.category_code}>
                    <span className="improve-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      {skill.category_code} · {skill.gap_size} level
                      {skill.gap_size === 1 ? "" : "s"} to close
                    </span>
                    <ArrowRight size={14} />
                  </div>
                ))
              ) : (
                <p className="assessment-note">
                  {unknownSkills.length
                    ? `${unknownSkills.length} required ${unknownSkills.length === 1 ? "skill has" : "skills have"} no assessed candidate level.`
                    : "The candidate meets all assessed requirements."}
                </p>
              )}
            </div>
            <Link to="/profile" className="button button-outline full-button">
              My profile <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      ) : (
        <section className="panel talent-empty-state">
          <Sparkles size={20} />
          <b>Run an assessment to see readiness results</b>
          <span>
            Select an available company and candidate. Results will include
            readiness, coverage, assessed skill gaps, and unknown levels.
          </span>
        </section>
      )}
      <div className="tip-banner">
        <div className="tip-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <b>Progress over perfection</b>
          <span>
            Readiness is a guide, not a gate. Unknown means a skill level was
            not available to assess.
          </span>
        </div>
        <Link to="/profile">
          My profile <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
