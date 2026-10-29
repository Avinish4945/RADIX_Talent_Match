import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
<<<<<<< HEAD
  Database,
  FileText,
  FileUp,
=======
>>>>>>> f47fe0f (fix)
  Lightbulb,
  Plus,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  addProfileEntry,
  updateProfile,
} from "../../../../application/store/appSlice";
import {
  createProfile,
  toProfilePayload,
  updateProfile as updateProfileApi,
} from "../../../../infrastructure/api/profile";
<<<<<<< HEAD
import { apiRequest } from "../../../../infrastructure/api/apiClient";
=======
>>>>>>> f47fe0f (fix)
import { PageHeading } from "../../../components/shared/PagePrimitives";

const profileTabs = [
  "Personal info",
  "Skills",
  "Projects",
  "Experience",
  "Hackathons",
  "Certifications",
  "CV Upload",
];

export function ProfileBuilder() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.app.profile);
  const [tab, setTab] = useState("Personal info");
  const [skillInput, setSkillInput] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
<<<<<<< HEAD
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  // CV Upload state
  const [cvFile, setCvFile] = useState(null);
  const [cvParsing, setCvParsing] = useState(false);
  const [cvMessage, setCvMessage] = useState(null);

  async function submit(event) {
    event.preventDefault();
    let updatedProfile = { ...profile };

    if (tab === "Personal info") {
      const form =
        event.currentTarget instanceof HTMLFormElement
          ? event.currentTarget
          : event.currentTarget.closest("form");
      const data = form ? new FormData(form) : null;
      if (data) {
        updatedProfile.name = data.get("name") ?? profile.name ?? "";
        updatedProfile.email = data.get("email") ?? profile.email ?? "";
        updatedProfile.education =
          data.get("education") ?? profile.education ?? "";
        updatedProfile.university =
          data.get("university") ?? profile.university ?? "";
        updatedProfile.year = data.get("year") ?? profile.year ?? "";
        updatedProfile.role = data.get("role") ?? profile.role ?? "";
        dispatch(updateProfile(updatedProfile));
      }
    }

    setSaving(true);
    setSaveResult(null);

    try {
      const payload = toProfilePayload(updatedProfile);
      const existingId =
        updatedProfile.backendProfileId ||
        updatedProfile.profileId ||
        updatedProfile.id;
      const response = existingId
        ? await updateProfileApi(existingId, payload)
        : await createProfile(payload);

      const savedId = response?.id || existingId || "saved-profile";
      dispatch(
        updateProfile({
          id: savedId,
          profileId: savedId,
          backendProfileId: savedId,
        }),
      );
      localStorage.setItem("radix-saved-profile-id", savedId);
      setSaveResult({
        success: true,
        id: savedId,
        message: `Saved to backend database (ID: ${savedId.slice(0, 8)}...)`,
      });
      window.setTimeout(() => setSaveResult(null), 4000);
    } catch (requestError) {
      setSaveResult({
        success: false,
        message: requestError.message,
      });
=======
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const updatedProfile = {
      ...profile,
      name: data.get("name") ?? profile.name ?? "",
      email: data.get("email") ?? profile.email ?? "",
      education: data.get("education") ?? profile.education ?? "",
      university: data.get("university") ?? profile.university ?? "",
      year: data.get("year") ?? profile.year ?? "",
      role: data.get("role") ?? profile.role ?? "",
    };
    dispatch(updateProfile(updatedProfile));
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const savedProfileId =
        profile.backendProfileId || profile.profileId || profile.id;
      const payload = {
        ...toProfilePayload(updatedProfile),
        id: savedProfileId || undefined,
      };
      const response = savedProfileId
        ? await updateProfileApi(savedProfileId, payload)
        : await createProfile(payload);
      const profileId = response.id || savedProfileId;
      dispatch(
        updateProfile({
          id: profileId,
          profileId,
          backendProfileId: profileId,
        }),
      );
      localStorage.setItem("radix-saved-profile-id", profileId);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (requestError) {
      setSaveError(requestError.message);
>>>>>>> f47fe0f (fix)
    } finally {
      setSaving(false);
    }
  }

  function addEntry(event) {
    event.preventDefault();
    const title = entryTitle.trim();
    if (!title) return;

    let section = "certifications";
    if (tab === "Projects") section = "projects";
    else if (tab === "Experience") section = "experience";
    else if (tab === "Hackathons") section = "hackathons";

    dispatch(
      addProfileEntry({
        section,
        entry: { title, description: entryDescription.trim() },
      }),
    );
    setEntryTitle("");
    setEntryDescription("");
<<<<<<< HEAD
    setSaveResult(null);
=======
    setSaved(false);
    setSaveError("");
>>>>>>> f47fe0f (fix)
  }

  function addSkill(event) {
    event.preventDefault();
    const skill = skillInput.trim();
    if (
      !skill ||
      (profile.skills || []).some((item) => {
        const name = typeof item === "object" ? item.skill_name : item;
        return name.toLowerCase() === skill.toLowerCase();
      })
    )
      return;

    const newSkillObj = {
      skill_name: skill,
      category_code: "OTHER",
      level: 6,
      evidence: "Added in Profile Builder",
      confidence: "medium",
      inferred: false,
      confirmed_by_candidate: true,
      review_status: "confirmed",
    };

    dispatch(
      updateProfile({ skills: [...(profile.skills || []), newSkillObj] }),
    );
    setSkillInput("");
    setSaveResult(null);
  }

  function removeSkill(skillToRemove) {
    const targetName =
      typeof skillToRemove === "object"
        ? skillToRemove.skill_name
        : skillToRemove;
    dispatch(
      updateProfile({
        skills: (profile.skills || []).filter((item) => {
          const name = typeof item === "object" ? item.skill_name : item;
          return name !== targetName;
        }),
      }),
    );
    setSaveResult(null);
  }

  function updateSkillLevel(index, newLevel) {
    const updated = [...(profile.skills || [])];
    const item = updated[index];
    if (typeof item === "object") {
      updated[index] = {
        ...item,
        level: Number(newLevel),
        inferred: false,
        confirmed_by_candidate: true,
        review_status: "confirmed",
      };
    } else {
      updated[index] = {
        skill_name: item,
        category_code: "OTHER",
        level: Number(newLevel),
        evidence: "Confirmed by candidate in Profile Builder",
        confidence: "medium",
        inferred: false,
        confirmed_by_candidate: true,
        review_status: "confirmed",
      };
    }
    dispatch(updateProfile({ skills: updated }));
  }

  function confirmSkill(index) {
    const updated = [...(profile.skills || [])];
    const item = updated[index];
    if (typeof item === "object") {
      updated[index] = {
        ...item,
        inferred: false,
        confirmed_by_candidate: true,
        review_status: "confirmed",
      };
      dispatch(updateProfile({ skills: updated }));
    }
  }

  async function handleCvExtract() {
    if (!cvFile) return;
    setCvParsing(true);
    setCvMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", cvFile);
      const response = await apiRequest("/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (response?.profile) {
        const p = response.profile;
        const edu =
          Array.isArray(p.education) && p.education[0] ? p.education[0] : {};
        dispatch(
          updateProfile({
            name: p.name || profile.name || "",
            email: p.email || profile.email || "",
            education: edu.degree || profile.education || "",
            university: edu.university || profile.university || "",
            year: edu.year || profile.year || "",
            skills: p.skills || profile.skills || [],
            role:
              (p.preferred_roles && p.preferred_roles[0]) || profile.role || "",
            projects: p.projects || profile.projects || [],
            experience: p.internships || profile.experience || [],
            hackathons: p.hackathons || profile.hackathons || [],
            certifications: p.certifications || profile.certifications || [],
            preferred_roles: p.preferred_roles || profile.preferred_roles || [],
            cv_file: response.filename || cvFile.name,
          }),
        );
        setCvMessage({
          success: true,
          text: `Extracted ${p.skills?.length || 0} skills and filled profile from ${response.filename || cvFile.name}!`,
        });
      }
    } catch (err) {
      setCvMessage({
        success: false,
        text: `CV extraction error: ${err.message}`,
      });
    } finally {
      setCvParsing(false);
    }
  }

  const currentEntries =
    tab === "Projects"
      ? profile.projects || []
      : tab === "Experience"
        ? profile.experience || []
        : tab === "Hackathons"
          ? profile.hackathons || []
          : profile.certifications || [];

  return (
    <div className="page">
      <PageHeading
        eyebrow="YOUR STORY, YOUR WAY"
        title="Profile Builder"
        description="Bring your experience, skills, and goals together in one profile. Persisted directly to database."
        action={
          <div className="completion-chip">
            <div>
              <span>PROFILE DATABASE STATUS</span>
              <b>
                {profile.backendProfileId || profile.id ? "SYNCED" : "LOCAL"}
              </b>
            </div>
            <div className="mini-progress">
              <i
                style={{
                  width:
                    profile.backendProfileId || profile.id ? "100%" : "60%",
                }}
              />
            </div>
          </div>
        }
      />
      <div className="profile-builder-layout">
        <section className="panel profile-editor">
          <div className="profile-tabs">
            {profileTabs.map((item) => (
              <button
                key={item}
                className={tab === item ? "active" : ""}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
                {item === "Skills" && (
                  <span className="tab-count">
                    {(profile.skills || []).length}
                  </span>
                )}
                {item === "Projects" && (
                  <span className="tab-count">
                    {(profile.projects || []).length}
                  </span>
                )}
                {item === "Experience" && (
                  <span className="tab-count">
                    {(profile.experience || []).length}
                  </span>
                )}
                {item === "Hackathons" && (
                  <span className="tab-count">
                    {(profile.hackathons || []).length}
                  </span>
                )}
                {item === "Certifications" && (
                  <span className="tab-count">
                    {(profile.certifications || []).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="profile-form">
            <div className="form-section-intro">
              <div>
                <h2>
                  {tab === "Personal info"
                    ? "Let's start with the basics"
                    : tab === "Skills"
                      ? "Your skills & proficiency"
                      : tab === "Projects"
                        ? "Projects you're proud of"
                        : tab === "Experience"
                          ? "Where you've made an impact"
                          : tab === "Hackathons"
                            ? "Hackathons & Competitions"
                            : tab === "Certifications"
                              ? "Certifications & Credentials"
                              : "Upload Candidate CV"}
                </h2>
                <p>
                  {tab === "Personal info"
                    ? "A few details help us make your profile feel like you."
                    : tab === "Skills"
                      ? "Review and confirm proficiency levels (0-10) for accurate Talent Check evaluation."
                      : tab === "CV Upload"
                        ? "Attach a CV file to auto-populate your entire profile via Resume Parsing."
                        : "This is your space. Add details that help tell your story."}
                </p>
              </div>
              <span className="required-note">* Required</span>
            </div>
            {tab === "Personal info" && (
              <div className="form-grid">
                <label className="field-label">
                  Full name <span>*</span>
                  <input name="name" defaultValue={profile.name} required />
                </label>
                <label className="field-label">
                  Email address <span>*</span>
                  <input
                    name="email"
                    type="email"
                    defaultValue={profile.email}
                    required
                  />
                </label>
                <label className="field-label">
                  Education
                  <input name="education" defaultValue={profile.education} />
                </label>
                <label className="field-label">
                  University
                  <input name="university" defaultValue={profile.university} />
                </label>
                <label className="field-label">
                  Graduation year
                  <input name="year" defaultValue={profile.year} />
                </label>
                <label className="field-label">
                  Preferred role
                  <input name="role" defaultValue={profile.role} />
                </label>
              </div>
            )}
            {tab === "Skills" && (
              <div className="skills-editor">
                <div
                  style={{
                    background: "#f7f5ff",
                    border: "1px solid #e0d8fa",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    marginBottom: "14px",
                    fontSize: "12.5px",
                    color: "#5433b2",
                  }}
                >
                  <Sparkles
                    size={14}
                    style={{ verticalAlign: "middle", marginRight: "6px" }}
                  />
                  <b>Heuristic Proficiency Review:</b> Skills extracted from
                  your resume are provisional estimates. Review and confirm your
                  proficiency levels (1–10) below.
                </div>
                <p className="field-label">
                  Your skills ({(profile.skills || []).length})
                  <span>Skills help us calculate accurate role matches.</span>
                </p>
                <div className="editable-tags">
                  {(profile.skills || []).map((skill, index) => {
                    const name =
                      typeof skill === "object" ? skill.skill_name : skill;
                    const cat =
                      typeof skill === "object" ? skill.category_code : null;
                    const lvl =
                      typeof skill === "object" && skill.level != null
                        ? skill.level
                        : null;
                    const isInferred =
                      typeof skill === "object" &&
                      (skill.inferred || !skill.confirmed_by_candidate);

                    return (
                      <span
                        className="editable-tag"
                        key={`${name}-${index}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background: isInferred ? "#fffef0" : "#f5fbf7",
                          borderColor: isInferred ? "#fde047" : "#bbf7d0",
                        }}
                      >
                        <b>{name}</b>
                        {cat && (
                          <small
                            style={{
                              color: "#6841cf",
                              fontSize: "10px",
                              fontWeight: "600",
                            }}
                          >
                            [{cat}]
                          </small>
                        )}
                        {lvl != null ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <select
                              value={lvl}
                              onChange={(e) =>
                                updateSkillLevel(index, e.target.value)
                              }
                              style={{
                                fontSize: "10px",
                                padding: "1px 2px",
                                border: isInferred
                                  ? "1px dashed #ca8a04"
                                  : "1px solid #16a34a",
                                borderRadius: "4px",
                                background: isInferred ? "#fef9c3" : "#dcfce7",
                                color: isInferred ? "#854d0e" : "#14532d",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                              title={
                                isInferred
                                  ? "Heuristic estimate requiring confirmation"
                                  : "Confirmed candidate proficiency level"
                              }
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
                                <option key={l} value={l}>
                                  Lvl {l}
                                </option>
                              ))}
                            </select>
                            {isInferred && (
                              <button
                                type="button"
                                style={{
                                  background: "#fef08a",
                                  border: "none",
                                  borderRadius: "3px",
                                  padding: "1px 4px",
                                  fontSize: "9px",
                                  fontWeight: "700",
                                  color: "#854d0e",
                                  cursor: "pointer",
                                }}
                                title="Confirm this proficiency level"
                                onClick={() => confirmSkill(index)}
                              >
                                Confirm
                              </button>
                            )}
                          </span>
                        ) : (
                          <button
                            type="button"
                            style={{
                              background: "#f1f5f9",
                              border: "1px dashed #cbd5e1",
                              borderRadius: "3px",
                              padding: "1px 4px",
                              fontSize: "9px",
                              color: "#475569",
                              cursor: "pointer",
                            }}
                            onClick={() => updateSkillLevel(index, 6)}
                          >
                            + Set Lvl
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          aria-label={`Remove ${name}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <div className="add-skill-bar">
                  <input
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    placeholder="Type a skill and press Add"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSkill(event);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={addSkill}
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>
              </div>
            )}
            {[
              "Projects",
              "Experience",
              "Hackathons",
              "Certifications",
            ].includes(tab) && (
              <div className="entry-editor">
                <div className="form-grid">
                  <label className="field-label">
                    {tab === "Projects"
                      ? "Project name"
                      : tab === "Experience"
                        ? "Role or organization"
                        : tab === "Hackathons"
                          ? "Hackathon or contest name"
                          : "Certification name"}
                    <input
                      value={entryTitle}
                      onChange={(event) => setEntryTitle(event.target.value)}
                      placeholder={
                        tab === "Projects"
                          ? "e.g. Distributed Job Scheduler"
                          : tab === "Experience"
                            ? "e.g. Software Engineering Intern"
                            : tab === "Hackathons"
                              ? "e.g. Smart India Hackathon Winner"
                              : "e.g. AWS Certified Solutions Architect"
                      }
                    />
                  </label>
                  <label className="field-label">
                    Details & Impact
                    <input
                      value={entryDescription}
                      onChange={(event) =>
                        setEntryDescription(event.target.value)
                      }
                      placeholder="What did you build, achieve, or learn?"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="button button-outline entry-add-button"
                  onClick={addEntry}
                >
                  <Plus size={15} /> Add{" "}
                  {tab === "Hackathons"
                    ? "hackathon"
                    : tab === "Certifications"
                      ? "certification"
                      : tab.toLowerCase()}
                </button>
                <div className="profile-entry-list">
                  {currentEntries.map((entry, index) => {
                    const title =
                      typeof entry === "object" ? entry.title : entry;
                    const desc =
                      typeof entry === "object" ? entry.description : "";
                    return (
                      <div key={`${title}-${index}`}>
                        <span className="entry-icon">
                          {tab === "Hackathons" ? (
                            <Trophy size={15} />
                          ) : tab === "Certifications" ? (
                            <Award size={15} />
                          ) : (
                            <BriefcaseBusiness size={15} />
                          )}
                        </span>
                        <div>
                          <b>{title}</b>
                          <small>{desc || "Added to your profile"}</small>
                        </div>
                        <CheckCircle2 size={15} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tab === "CV Upload" && (
              <div
                className="cv-upload-tab"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  padding: "10px 0",
                }}
              >
                <div
                  style={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "10px",
                    padding: "24px",
                    textAlign: "center",
                    background: "#f8fafc",
                  }}
                >
                  <FileUp
                    size={32}
                    style={{ margin: "0 auto 10px", color: "#6841cf" }}
                  />
                  <p style={{ fontWeight: 600, marginBottom: "6px" }}>
                    Select CV / Resume (PDF or DOCX)
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "14px",
                    }}
                  >
                    Extracts structured skills, experience, and education to
                    pre-fill this form automatically.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    style={{ fontSize: "13px" }}
                  />
                  {cvFile && (
                    <div style={{ marginTop: "14px" }}>
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={handleCvExtract}
                        disabled={cvParsing}
                      >
                        <Sparkles size={15} />{" "}
                        {cvParsing
                          ? "Extracting..."
                          : "Extract & Pre-fill Profile"}
                      </button>
                    </div>
                  )}
                </div>
                {cvMessage && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      background: cvMessage.success ? "#dcfce7" : "#fee2e2",
                      color: cvMessage.success ? "#14532d" : "#991b1b",
                    }}
                  >
                    {cvMessage.success ? "✓ " : "⚠️ "} {cvMessage.text}
                  </div>
                )}
                {profile.cv_file && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#475569",
                    }}
                  >
                    <FileText size={16} color="#6841cf" />
                    <span>
                      Attached CV file: <b>{profile.cv_file}</b>
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="profile-form-footer">
              <span>
                {saving ? (
<<<<<<< HEAD
                  <span
                    className="saving-message"
                    style={{
                      color: "#6841cf",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Database size={15} /> Saving profile to database...
                  </span>
                ) : saveResult?.success ? (
                  <span
                    className="saved-message"
                    style={{
                      color: "#16a34a",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <CheckCircle2 size={16} /> {saveResult.message}
                  </span>
                ) : saveResult && !saveResult.success ? (
                  <span
                    className="form-error"
                    role="alert"
                    style={{ color: "#dc2626", fontSize: "13px" }}
                  >
                    ⚠️ Could not save profile: {saveResult.message}
                  </span>
                ) : profile.backendProfileId || profile.id ? (
                  <span style={{ color: "#64748b", fontSize: "12.5px" }}>
                    Database ID:{" "}
                    <b>
                      {(profile.backendProfileId || profile.id).slice(0, 8)}...
                    </b>{" "}
                    · Synced
=======
                  "Saving profile..."
                ) : saveError ? (
                  <span className="form-error" role="alert">
                    Could not save profile: {saveError}
                  </span>
                ) : saved ? (
                  <span className="saved-message">
                    <CheckCircle2 size={15} /> Profile saved to backend
>>>>>>> f47fe0f (fix)
                  </span>
                ) : profile.backendProfileId || profile.id ? (
                  `Database ID: ${(profile.backendProfileId || profile.id).slice(0, 8)}... · Synced`
                ) : (
                  "Your profile is stored securely in the database."
                )}
              </span>
              <button
                className="button button-primary"
                type="submit"
                disabled={saving}
              >
<<<<<<< HEAD
                <Check size={16} />{" "}
                {saving ? "Saving..." : "Save profile to database"}
=======
                <Check size={16} /> {saving ? "Saving..." : "Save profile"}
>>>>>>> f47fe0f (fix)
              </button>
            </div>
          </form>
        </section>
        <aside className="profile-aside">
          <section className="panel profile-card">
            <div className="profile-card-cover">
              <div className="profile-avatar">
                {(profile.name || "A").charAt(0)}
              </div>
              <span className="status-badge success">
                <i />{" "}
                {profile.backendProfileId || profile.id
                  ? "Synced"
                  : "In progress"}
              </span>
            </div>
            <div className="profile-card-body">
              <h3>{profile.name || "Candidate"}</h3>
              <p>{profile.role || "Software Engineer"}</p>
              <span className="profile-location">
                <Users size={14} />{" "}
                {profile.university || "University / Institute"}
              </span>
              <div className="profile-card-divider" />
              <div className="profile-card-label">YOUR SKILLS</div>
              <div className="tag-list compact-tags">
                {(profile.skills || []).slice(0, 6).map((skill, i) => {
                  const sName =
                    typeof skill === "object" ? skill.skill_name : skill;
                  return (
                    <span className="skill-tag" key={`${sName}-${i}`}>
                      {sName}
                    </span>
                  );
                })}
              </div>
              {profile.cv_file && (
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  <FileText
                    size={13}
                    style={{ verticalAlign: "middle", marginRight: "4px" }}
                  />
                  {profile.cv_file}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
