import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Database,
  Lightbulb,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  addProfileEntry,
  updateProfile,
} from "../../../../application/store/appSlice";
<<<<<<< HEAD
import { saveProfileToApi } from "../../../../infrastructure/api/profileApi";
=======
import {
  createProfile,
  toProfilePayload,
  updateProfile as updateProfileApi,
} from "../../../../infrastructure/api/profile";
>>>>>>> 8cf6984 (api link)
import { PageHeading } from "../../../components/shared/PagePrimitives";

const profileTabs = [
  "Personal info",
  "Skills",
  "Projects",
  "Experience",
  "More",
];

export function ProfileBuilder() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.app.profile);
  const [tab, setTab] = useState("Personal info");
  const [skillInput, setSkillInput] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
<<<<<<< HEAD
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSaveResult(null);

    const form =
      event.currentTarget instanceof HTMLFormElement
        ? event.currentTarget
        : event.currentTarget.closest("form");
    const data = form ? new FormData(form) : null;

    const name = data?.get("name") ?? profile.name ?? "";
    const email = data?.get("email") ?? profile.email ?? "";
    const education = data?.get("education") ?? profile.education ?? "";
    const university = data?.get("university") ?? profile.university ?? "";
    const year = data?.get("year") ?? profile.year ?? "";
    const role = data?.get("role") ?? profile.role ?? "";

    const localUpdates = {
      name,
      email,
      education,
      university,
      year,
      role,
    };
    dispatch(updateProfile(localUpdates));

    const payload = {
      id: profile.profileId || profile.id || undefined,
      name,
      email,
      role,
      education: [
        {
          degree: education,
          university,
          year,
        },
      ],
      skills: profile.skills || [],
      projects: profile.projects || [],
      experience: profile.experience || [],
      internships: profile.internships || profile.experience || [],
      certifications: (profile.certifications || []).map((c) =>
        typeof c === "object" ? c.title || JSON.stringify(c) : c,
      ),
      preferred_roles: role
        ? [role]
        : profile.preferred_roles || ["Software Engineer"],
    };

    try {
      const res = await saveProfileToApi(payload);
      const savedId = res?.id || profile.id || "saved-profile";
      dispatch(updateProfile({ id: savedId, profileId: savedId }));
      localStorage.setItem("radix-saved-profile-id", savedId);
      setSaveResult({
        success: true,
        id: savedId,
        message: `Saved to database (ID: ${savedId.slice(0, 8)}...)`,
      });
    } catch (err) {
      setSaveResult({
        success: false,
        message: `Saved locally (DB: ${err.message})`,
      });
    } finally {
      setIsSaving(false);
      window.setTimeout(() => setSaveResult(null), 5000);
=======
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function submit(event) {
    event.preventDefault();
    let updatedProfile = profile;
    if (tab !== "Personal info") {
      updatedProfile = profile;
    } else {
      const data = new FormData(event.currentTarget);
      updatedProfile = {
        ...profile,
        name: data.get("name"),
        email: data.get("email"),
        education: data.get("education"),
        university: data.get("university"),
        year: data.get("year"),
        role: data.get("role"),
      };
      dispatch(updateProfile(updatedProfile));
    }

    setSaving(true);
    setSaveError("");
    try {
      const payload = toProfilePayload(updatedProfile);
      const response = updatedProfile.backendProfileId
        ? await updateProfileApi(updatedProfile.backendProfileId, payload)
        : await createProfile(payload);
      if (!updatedProfile.backendProfileId) {
        dispatch(updateProfile({ backendProfileId: response.id }));
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
>>>>>>> 8cf6984 (api link)
    }
  }

  function addEntry(event) {
    event.preventDefault();
    const title = entryTitle.trim();
    if (!title) return;
    const section =
      tab === "Projects"
        ? "projects"
        : tab === "Experience"
          ? "experience"
          : "certifications";
    dispatch(
      addProfileEntry({
        section,
        entry: { title, description: entryDescription.trim() },
      }),
    );
    setEntryTitle("");
    setEntryDescription("");
<<<<<<< HEAD
=======
    setSaved(false);
>>>>>>> 8cf6984 (api link)
  }

  function addSkill(event) {
    event.preventDefault();
    const skill = skillInput.trim();
    if (
      !skill ||
      profile.skills.some((item) => {
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

    dispatch(updateProfile({ skills: [...profile.skills, newSkillObj] }));
    setSkillInput("");
    setSaved(false);
  }

  function removeSkill(skillToRemove) {
    const targetName =
      typeof skillToRemove === "object"
        ? skillToRemove.skill_name
        : skillToRemove;
    dispatch(
      updateProfile({
        skills: profile.skills.filter((item) => {
          const name = typeof item === "object" ? item.skill_name : item;
          return name !== targetName;
        }),
      }),
    );
    setSaved(false);
  }

  function updateSkillLevel(index, newLevel) {
    const updated = [...profile.skills];
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
    const updated = [...profile.skills];
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
              <b>{profile.id ? "SYNCED" : "LOCAL"}</b>
            </div>
            <div className="mini-progress">
              <i style={{ width: profile.id ? "100%" : "60%" }} />
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
              >
                {item}
                {item === "Skills" && (
                  <span className="tab-count">{profile.skills.length}</span>
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
                          : "A few more details"}
                </h2>
                <p>
                  {tab === "Personal info"
                    ? "A few details help us make your profile feel like you."
                    : tab === "Skills"
                      ? "Review and confirm proficiency levels (0-10) for accurate Talent Check evaluation."
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
                  Your skills ({profile.skills.length})
                  <span>Skills help us calculate accurate role matches.</span>
                </p>
                <div className="editable-tags">
                  {profile.skills.map((skill, index) => {
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
                          aria-label={`Remove ${name}`}
                          onClick={() => removeSkill(skill)}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <div className="add-skill-form">
                  <input
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addSkill(event);
                    }}
                    placeholder="Add a skill, e.g. TypeScript"
                  />
                  <button
                    className="button button-outline"
                    type="button"
                    onClick={addSkill}
                  >
                    <Plus size={15} /> Add skill
                  </button>
                </div>
                <div className="suggested-skills">
                  <span>Popular for your role</span>
                  {["TypeScript", "AWS", "Communication"]
                    .filter(
                      (item) =>
                        !profile.skills.some((s) => {
                          const n = typeof s === "object" ? s.skill_name : s;
                          return n.toLowerCase() === item.toLowerCase();
                        }),
                    )
                    .map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() =>
                          dispatch(
                            updateProfile({
                              skills: [
                                ...profile.skills,
                                {
                                  skill_name: skill,
                                  category_code: "OTHER",
                                  level: 6,
                                  evidence: "Added from popular suggestions",
                                  confidence: "medium",
                                  inferred: false,
                                  confirmed_by_candidate: true,
                                },
                              ],
                            }),
                          )
                        }
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>
            )}
            {!["Personal info", "Skills"].includes(tab) && (
              <div className="entry-editor">
                <div className="form-grid">
                  <label className="field-label">
                    {tab === "Projects"
                      ? "Project name"
                      : tab === "Experience"
                        ? "Role or organization"
                        : "Certification name"}
                    <input
                      value={entryTitle}
                      onChange={(event) => setEntryTitle(event.target.value)}
                      placeholder={
                        tab === "Projects"
                          ? "e.g. Campus event planner"
                          : tab === "Experience"
                            ? "e.g. Frontend intern"
                            : "e.g. AWS Cloud Practitioner"
                      }
                    />
                  </label>
                  <label className="field-label">
                    A few details
                    <input
                      value={entryDescription}
                      onChange={(event) =>
                        setEntryDescription(event.target.value)
                      }
                      placeholder="What did you work on or learn?"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="button button-outline entry-add-button"
                  onClick={addEntry}
                >
                  <Plus size={15} /> Add{" "}
                  {tab === "More" ? "certification" : tab.toLowerCase()}
                </button>
                <div className="profile-entry-list">
                  {(tab === "Projects"
                    ? profile.projects
                    : tab === "Experience"
                      ? profile.experience
                      : profile.certifications
                  ).map((entry, index) => (
                    <div key={`${entry.title}-${index}`}>
                      <span className="entry-icon">
                        <BriefcaseBusiness size={15} />
                      </span>
                      <div>
                        <b>{entry.title}</b>
                        <small>
                          {entry.description || "Added to your profile"}
                        </small>
                      </div>
                      <CheckCircle2 size={15} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="profile-form-footer">
              <span>
<<<<<<< HEAD
                {isSaving ? (
                  <span
                    className="saving-message"
                    style={{ color: "#6841cf", fontWeight: "500" }}
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
                    className="error-message"
                    style={{ color: "#dc2626", fontSize: "13px" }}
                  >
                    ⚠️ {saveResult.message}
                  </span>
                ) : profile.id ? (
                  <span style={{ color: "#64748b", fontSize: "12.5px" }}>
                    Database ID: <b>{profile.id.slice(0, 8)}...</b> · Synced
=======
                {saveError && (
                  <span className="form-error" role="alert">
                    Could not save profile: {saveError}
                  </span>
                )}
                {saved ? (
                  <span className="saved-message">
                    <CheckCircle2 size={15} /> Profile saved to backend
>>>>>>> 8cf6984 (api link)
                  </span>
                ) : (
                  "Your profile is stored securely in the database."
                )}
              </span>
              <button
                className="button button-primary"
                type="submit"
<<<<<<< HEAD
                disabled={isSaving}
              >
                <Check size={16} />{" "}
                {isSaving ? "Saving..." : "Save profile to database"}
=======
                disabled={saving}
              >
                <Check size={16} /> {saving ? "Saving..." : "Save profile"}
>>>>>>> 8cf6984 (api link)
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
                <i /> {profile.id ? "Synced" : "In progress"}
              </span>
            </div>
            <div className="profile-card-body">
              <h3>{profile.name}</h3>
              <p>{profile.role}</p>
              <span className="profile-location">
                <Users size={14} /> {profile.university}
              </span>
              <div className="profile-card-divider" />
              <div className="profile-card-label">YOUR SKILLS</div>
              <div className="tag-list compact-tags">
                {profile.skills.slice(0, 5).map((skill, i) => {
                  const sName =
                    typeof skill === "object" ? skill.skill_name : skill;
                  return (
                    <span className="skill-tag" key={`${sName}-${i}`}>
                      {sName}
                    </span>
                  );
                })}
                {profile.skills.length > 5 && (
                  <span className="skill-tag">
                    +{profile.skills.length - 5}
                  </span>
                )}
              </div>
              <Link to="/matching" className="profile-match-link">
                Preview job matches <ArrowRight size={14} />
              </Link>
            </div>
          </section>
          <section className="panel profile-tip">
            <span className="soft-icon orange">
              <Lightbulb size={18} />
            </span>
            <div>
              <b>Make your skills work for you</b>
              <p>
                Confirm your estimated skill levels to get precise match ratings
                and gap calculations.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
