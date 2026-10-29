import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Lightbulb,
  Plus,
  Users,
  X,
} from "lucide-react";
import {
  addProfileEntry,
  updateProfile,
} from "../../../../application/store/appSlice";
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
  const [saved, setSaved] = useState(false);
  function submit(event) {
    event.preventDefault();
    if (tab !== "Personal info") {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
      return;
    }
    const data = new FormData(event.currentTarget);
    dispatch(
      updateProfile({
        name: data.get("name"),
        email: data.get("email"),
        education: data.get("education"),
        university: data.get("university"),
        year: data.get("year"),
        role: data.get("role"),
      }),
    );
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
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
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
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
    dispatch(updateProfile({ skills: [...profile.skills, skill] }));
    setSkillInput("");
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
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="YOUR STORY, YOUR WAY"
        title="Profile Builder"
        description="Bring your experience, skills, and goals together in one profile. Keep it fresh and make it yours."
        action={
          <div className="completion-chip">
            <div>
              <span>PROFILE STRENGTH</span>
              <b>80%</b>
            </div>
            <div className="mini-progress">
              <i />
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
                      ? "Your skills"
                      : tab === "Projects"
                        ? "Projects you're proud of"
                        : tab === "Experience"
                          ? "Where you've made an impact"
                          : "A few more details"}
                </h2>
                <p>
                  {tab === "Personal info"
                    ? "A few details help us make your profile feel like you."
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
                <p className="field-label">
                  Your skills{" "}
                  <span>Skills help us find roles that fit you.</span>
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
                    return (
                      <span className="editable-tag" key={`${name}-${index}`}>
                        <b>{name}</b>
                        {cat && (
                          <small
                            style={{
                              marginLeft: 4,
                              color: "#6841cf",
                              fontSize: "10px",
                            }}
                          >
                            [{cat}]
                          </small>
                        )}
                        {lvl != null && (
                          <small
                            style={{
                              marginLeft: 4,
                              color: "#199568",
                              fontWeight: "600",
                              fontSize: "10px",
                            }}
                          >
                            Lvl {lvl}
                          </small>
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
                    .filter((item) => !profile.skills.includes(item))
                    .map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() =>
                          dispatch(
                            updateProfile({
                              skills: [...profile.skills, skill],
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
                {saved ? (
                  <span className="saved-message">
                    <CheckCircle2 size={15} /> Changes saved
                  </span>
                ) : (
                  "Your profile is only shared when you choose to share it."
                )}
              </span>
              <button className="button button-primary" type="submit">
                <Check size={16} /> Save profile
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
                <i /> In progress
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
                {profile.skills.slice(0, 5).map((skill) => (
                  <span className="skill-tag" key={skill}>
                    {skill}
                  </span>
                ))}
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
                Add skills from projects, courses, and experience—not just job
                titles.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
