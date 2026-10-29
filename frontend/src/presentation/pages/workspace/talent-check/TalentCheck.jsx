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
import {
  markReadinessChecked,
  updateProfile as updateAppProfile,
} from "../../../../application/store/appSlice";
import {
  createProfile,
  getProfile,
  toProfilePayload,
  updateProfile as updateProfileApi,
} from "../../../../infrastructure/api/profile";
import { getJobDescriptions } from "../job-analytics/jdApi";
import {
  PageHeading,
  ProgressRing,
} from "../../../components/shared/PagePrimitives";
import { PieChart } from "../../../components/shared/PieChart";

const EMPTY_JOB_ANALYSES = [];
const CURRENT_PROFILE_ID = "current-profile";

export function TalentCheck() {
  const dispatch = useDispatch();
  const appProfile = useSelector((state) => state.app.profile);
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
  const [jdCompanies, setJdCompanies] = useState([]);
  const [jdCompanyRoles, setJdCompanyRoles] = useState({});
  const [jdCompaniesError, setJdCompaniesError] = useState("");
  const companies = useMemo(
    () => [
      ...new Map(
        [...configuredCompanies, ...jdCompanies, ...extractedCompanies]
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [name.toLocaleLowerCase(), name]),
      ).values(),
    ],
    [configuredCompanies, extractedCompanies, jdCompanies],
  );
  const [candidates, setCandidates] = useState([]);
  const [company, setCompany] = useState("");
  const [jdId, setJdId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [candidateProfileError, setCandidateProfileError] = useState("");
  const [candidateProfileLoading, setCandidateProfileLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsAttempt, setOptionsAttempt] = useState(0);
  const [checking, setChecking] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);
  const selectedCompanyConfigured = configuredCompanies.some(
    (name) => name.toLocaleLowerCase() === company.toLocaleLowerCase(),
  );
  const selectedCompanyJds =
    jdCompanyRoles[company.toLocaleLowerCase()]?.jobDescriptions || [];
  const selectedJdHasSkills = selectedCompanyJds.some(
    (job) => job.id === jdId && job.hasSkills,
  );
  const hasCurrentProfile = Boolean(
    appProfile.name?.trim() ||
    appProfile.email?.trim() ||
    appProfile.skills?.length,
  );

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setOptionsLoading(true);
      setCompanyError("");
      setCandidateError("");
      setJdCompaniesError("");
      const [companyResponse, candidateResponse, jdResponse] =
        await Promise.allSettled([
          apiRequest("/talent-check/companies"),
          apiRequest("/talent-check/candidates"),
          getJobDescriptions({ page: 1, pageSize: 100 }),
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

      if (jdResponse.status === "fulfilled") {
        try {
          const firstPage = jdResponse.value;
          const remainingPages = await Promise.all(
            Array.from(
              { length: Math.max(0, firstPage.total_pages - 1) },
              (_, index) =>
                getJobDescriptions({ page: index + 2, pageSize: 100 }),
            ),
          );
          if (!active) return;
          const jobDescriptions = [
            ...(firstPage.job_descriptions || []),
            ...remainingPages.flatMap((page) => page.job_descriptions || []),
          ];
          const rolesByCompany = {};
          for (const job of jobDescriptions) {
            const name =
              typeof job.company === "string" ? job.company.trim() : "";
            if (!name) continue;
            const key = name.toLocaleLowerCase();
            rolesByCompany[key] ||= { name, roles: [], jobDescriptions: [] };
            rolesByCompany[key].jobDescriptions.push({
              id: job.id,
              role: job.role,
              sourceFile: job.source_file,
              hasSkills: Array.isArray(job.skills) && job.skills.length > 0,
            });
            if (job.role && !rolesByCompany[key].roles.includes(job.role)) {
              rolesByCompany[key].roles.push(job.role);
            }
          }
          const importedCompanies = Object.values(rolesByCompany);
          setJdCompanies(importedCompanies.map(({ name }) => name));
          setJdCompanyRoles(rolesByCompany);
          const defaultCompany =
            extractedCompanies[0] || importedCompanies[0]?.name || "";
          setCompany((current) => current || defaultCompany);
          setJdId((current) => {
            const selectedCompany = company || defaultCompany;
            const companyJobs =
              rolesByCompany[selectedCompany.toLocaleLowerCase()]
                ?.jobDescriptions || [];
            return current || companyJobs[0]?.id || "";
          });
        } catch (error) {
          if (active) setJdCompaniesError(error.message);
        }
      } else {
        setJdCompaniesError(jdResponse.reason.message);
      }

      if (candidateResponse.status === "fulfilled") {
        const availableCandidates = candidateResponse.value.candidates || [];
        setCandidates(availableCandidates);
        const savedProfileId = appProfile.backendProfileId;
        const selectedProfile = availableCandidates.find(
          (candidate) => candidate.id === savedProfileId,
        );
        setCandidateId(
          (current) =>
            current ||
            selectedProfile?.id ||
            (hasCurrentProfile
              ? CURRENT_PROFILE_ID
              : availableCandidates[0]?.id || ""),
        );
        setCandidateError(
          availableCandidates.length || hasCurrentProfile
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
  }, [
    appProfile.backendProfileId,
    extractedCompanies,
    hasCurrentProfile,
    optionsAttempt,
  ]);

  useEffect(() => {
    let active = true;

    async function loadCandidateProfile() {
      if (!candidateId) {
        setCandidateProfile(null);
        setCandidateProfileError("");
        return;
      }

      if (candidateId === CURRENT_PROFILE_ID) {
        setCandidateProfile(toProfilePayload(appProfile));
        setCandidateProfileError("");
        return;
      }

      setCandidateProfileLoading(true);
      setCandidateProfileError("");
      try {
        const savedProfile = await getProfile(candidateId);
        if (active) setCandidateProfile(savedProfile);
      } catch (error) {
        if (active) {
          setCandidateProfile(null);
          setCandidateProfileError(error.message);
        }
      } finally {
        if (active) setCandidateProfileLoading(false);
      }
    }

    loadCandidateProfile();
    return () => {
      active = false;
    };
  }, [appProfile, candidateId]);

  async function runTalentCheck() {
    setChecking(true);
    setApiError("");
    setResult(null);

    try {
      let assessmentCandidateId = candidateId;
      if (candidateId === CURRENT_PROFILE_ID) {
        const savedProfile = await createProfile(toProfilePayload(appProfile));
        assessmentCandidateId = savedProfile.id;
        dispatch(updateAppProfile({ backendProfileId: savedProfile.id }));
        setCandidateId(savedProfile.id);
        setCandidates((current) => [
          {
            id: savedProfile.id,
            name: appProfile.name || "Unnamed candidate",
          },
          ...current.filter((candidate) => candidate.id !== savedProfile.id),
        ]);
      } else if (candidateId === appProfile.backendProfileId) {
        await updateProfileApi(candidateId, toProfilePayload(appProfile));
      }
      const response = await apiRequest("/talent-check/", {
        method: "POST",
        body: {
          candidate_id: assessmentCandidateId,
          company,
          ...(!selectedCompanyConfigured ? { jd_id: jdId } : {}),
        },
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
  const isPresenceAssessment = result?.assessment_type === "skills_presence";
  const presentSkills =
    result?.skillset_gap.filter((skill) => skill.status === "present") || [];
  const partialSkills =
    result?.skillset_gap.filter((skill) => skill.status === "partial") || [];
  const missingSkills =
    result?.skillset_gap.filter((skill) => skill.status === "missing") || [];
  const pieData = isPresenceAssessment
    ? [
        { label: "Present", value: presentSkills.length, color: "#25a875" },
        { label: "Partial", value: partialSkills.length, color: "#e5a436" },
        { label: "Missing", value: missingSkills.length, color: "#df6570" },
      ]
    : [
        {
          label: "Meets requirement",
          value:
            result?.skillset_gap.filter(
              (skill) => skill.status === "assessed" && !skill.gap,
            ).length || 0,
          color: "#25a875",
        },
        {
          label: "Skill gap",
          value: assessedGaps.length,
          color: "#df6570",
        },
        {
          label: "Not assessed",
          value: unknownSkills.length,
          color: "#9aa6b2",
        },
      ];

  return (
    <div className="page talent-check-page">
      <PageHeading
        eyebrow="KNOW WHERE YOU STAND"
        title="Talent Check"
        description="Compare a saved candidate profile with configured company requirements or skills from a saved job description."
        action={
          <span className="secure-note">
            <ShieldCheck size={16} /> Saved profile data
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
              Choose a configured assessment or a saved JD for a presence-only
              skill check.
            </span>
          </div>
        </div>
        <div className="check-control-actions">
          <label className="talent-select-label">
            <span>Company</span>
            <select
              value={company}
              onChange={(event) => {
                const nextCompany = event.target.value;
                setCompany(nextCompany);
                setJdId(
                  jdCompanyRoles[nextCompany.toLocaleLowerCase()]
                    ?.jobDescriptions[0]?.id || "",
                );
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
                  {jdCompanyRoles[name.toLocaleLowerCase()]?.roles.length
                    ? ` · JD: ${jdCompanyRoles[name.toLocaleLowerCase()].roles.join(", ")}`
                    : ""}
                </option>
              ))}
            </select>
            <small>
              {!company
                ? "Choose a company to see whether assessment requirements are available."
                : selectedCompanyConfigured
                  ? "Company requirements are available for this selection."
                  : jdCompanyRoles[company.toLocaleLowerCase()]?.roles.length
                    ? `Imported from JD Analytics for ${jdCompanyRoles[
                        company.toLocaleLowerCase()
                      ].roles.join(
                        ", ",
                      )}, but no company assessment requirements are configured.`
                    : "This company came from Job Analytics, but has no configured assessment requirements."}
            </small>
          </label>
          {!selectedCompanyConfigured && selectedCompanyJds.length > 0 && (
            <label className="talent-select-label">
              <span>Job description</span>
              <select
                value={jdId}
                onChange={(event) => {
                  setJdId(event.target.value);
                  setResult(null);
                  setApiError("");
                }}
                aria-label="Select job description"
              >
                {selectedCompanyJds.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.role || job.sourceFile}
                  </option>
                ))}
              </select>
              <small>
                {selectedJdHasSkills
                  ? "JD-based assessment checks exact skill presence only; fuzzy and partial matches are reported separately."
                  : "This job description has no extracted skills to assess."}
              </small>
            </label>
          )}
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
              disabled={
                optionsLoading ||
                (!hasCurrentProfile && candidates.length === 0)
              }
            >
              {candidates.length === 0 && (
                <option value="">
                  {optionsLoading
                    ? "Loading candidates..."
                    : "No candidates available"}
                </option>
              )}
              {!appProfile.backendProfileId && hasCurrentProfile && (
                <option value={CURRENT_PROFILE_ID}>
                  My Profile{appProfile.name ? ` · ${appProfile.name}` : ""}
                </option>
              )}
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
              (!selectedCompanyConfigured &&
                (!selectedCompanyJds.length || !selectedJdHasSkills)) ||
              Boolean(candidateError) ||
              Boolean(candidateProfileError) ||
              candidateProfileLoading
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

      {candidateProfile && (
        <section className="panel talent-candidate-preview">
          <div className="talent-candidate-heading">
            <div className="candidate-match-avatar">
              {(candidateProfile.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="eyebrow">SELECTED CANDIDATE</span>
              <h2>{candidateProfile.name || selectedCandidate?.name}</h2>
              <p>{candidateProfile.email || "No email provided"}</p>
            </div>
            <span className="status-badge">
              {(candidateProfile.skills || []).length} profile skills
            </span>
          </div>
          <div className="candidate-match-skills">
            {(candidateProfile.skills || []).map((skill, index) => {
              const skillName =
                typeof skill === "string" ? skill : skill.skill_name;
              const skillLevel = typeof skill === "string" ? null : skill.level;
              return (
                <span key={`${skillName}-${index}`}>
                  {skillName}
                  {skillLevel == null
                    ? " · level unknown"
                    : ` · ${skillLevel}/10`}
                </span>
              );
            })}
          </div>
          {!(candidateProfile.skills || []).length && (
            <p className="preview-guidance">
              This saved candidate profile has no skills to assess.
            </p>
          )}
        </section>
      )}
      {candidateProfileLoading && (
        <p className="preview-guidance" role="status">
          Loading selected candidate profile...
        </p>
      )}
      {(companyError ||
        jdCompaniesError ||
        candidateError ||
        candidateProfileError ||
        apiError) && (
        <section className="talent-alert" aria-live="polite">
          <div role="alert">
            {companyError && (
              <p>
                <b>Company requirements unavailable:</b> {companyError}
              </p>
            )}
            {jdCompaniesError && (
              <p>
                <b>JD companies unavailable:</b> {jdCompaniesError}
              </p>
            )}
            {candidateError && (
              <p>
                <b>Candidate unavailable:</b> {candidateError}
              </p>
            )}
            {candidateProfileError && (
              <p>
                <b>Candidate profile unavailable:</b> {candidateProfileError}
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
                  {isPresenceAssessment
                    ? "Presence-only assessment based on the selected saved job description."
                    : "Assessment based on configured company skill requirements."}
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
                  <small>
                    {isPresenceAssessment ? "no JD levels" : "not assessed"}
                  </small>
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
                  {isPresenceAssessment
                    ? "JD skill presence"
                    : result.readiness_score === null
                      ? "No required skills have been assessed."
                      : `${result.readiness_score}% readiness`}
                </h3>
                <p>
                  {isPresenceAssessment
                    ? "Coverage counts exact and alias matches only. Fuzzy and partial matches are shown separately; no proficiency or readiness score is inferred."
                    : "Unknown skill levels are excluded from the readiness score. Coverage shows how much of the company's requirements were assessed."}
                </p>
                <div className="score-metrics">
                  <div>
                    <span>
                      {isPresenceAssessment ? "Exact coverage" : "Coverage"}
                    </span>
                    <b>{result.coverage_percent}%</b>
                  </div>
                  <div>
                    <span>
                      {isPresenceAssessment
                        ? "Skills found"
                        : "Assessed skills"}
                    </span>
                    <b>
                      {isPresenceAssessment
                        ? `${presentSkills.length}/${result.skillset_gap.length}`
                        : `${result.skillset_gap.length - unknownSkills.length}/${result.skillset_gap.length}`}
                    </b>
                  </div>
                </div>
              </div>
            </div>
            <PieChart
              title={
                isPresenceAssessment
                  ? "JD skill presence breakdown"
                  : "Requirement assessment breakdown"
              }
              centerLabel={isPresenceAssessment ? "JD skills" : "requirements"}
              data={pieData}
            />
            <div className="readiness-breakdown">
              <div className="breakdown-heading">
                <b>Skill-wise breakdown</b>
                <span>
                  {isPresenceAssessment
                    ? "JD skills checked against the selected candidate profile"
                    : "Candidate level compared with company requirement"}
                </span>
              </div>
              <div
                className="breakdown-table"
                role="region"
                aria-label="Skill breakdown; scroll horizontally to view every column"
                tabIndex={0}
              >
                <div className="breakdown-row table-head">
                  <span>{isPresenceAssessment ? "JD skill" : "Category"}</span>
                  <span>
                    {isPresenceAssessment ? "Profile match" : "Candidate"}
                  </span>
                  <span>{isPresenceAssessment ? "Category" : "Required"}</span>
                  <span>Status</span>
                </div>
                {result.skillset_gap.map((skill) => {
                  const unknown = skill.status === "unknown";
                  const meets = !unknown && !skill.gap;
                  if (isPresenceAssessment) {
                    return (
                      <div
                        className="breakdown-row"
                        key={`${skill.category_code}-${skill.skill_name}`}
                      >
                        <b>{skill.skill_name}</b>
                        <span>{skill.candidate_skill || "—"}</span>
                        <span>{skill.category_code}</span>
                        <span
                          className={`status-word ${skill.status === "present" ? "meets" : skill.status === "partial" ? "unknown" : "gap"}`}
                        >
                          {skill.status === "present"
                            ? "Present"
                            : skill.status === "partial"
                              ? "Partial match"
                              : "Missing"}
                        </span>
                      </div>
                    );
                  }
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
              {isPresenceAssessment
                ? "Review missing JD skills and partial matches below."
                : assessedGaps.length
                  ? "Focus on the assessed categories below to reduce your skill gaps."
                  : "No assessed skill gaps were found for this candidate."}
            </p>
            <div className="improve-list">
              {isPresenceAssessment &&
              (missingSkills.length || partialSkills.length) ? (
                [...missingSkills, ...partialSkills].map((skill, index) => (
                  <div key={`${skill.category_code}-${skill.skill_name}`}>
                    <span className="improve-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      {skill.skill_name} ·{" "}
                      {skill.status === "missing"
                        ? "not found"
                        : "partial match"}
                    </span>
                    <ArrowRight size={14} />
                  </div>
                ))
              ) : !isPresenceAssessment && assessedGaps.length ? (
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
                  {isPresenceAssessment
                    ? "All JD skills have an exact or partial profile match."
                    : unknownSkills.length
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
            Select a company and candidate. Configured requirements provide
            readiness scoring; saved JDs provide a presence-only skill check.
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
            Configured readiness is a guide, not a gate. JD-based checks only
            show skill presence and never infer proficiency levels.
          </span>
        </div>
        <Link to="/profile">
          My profile <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
