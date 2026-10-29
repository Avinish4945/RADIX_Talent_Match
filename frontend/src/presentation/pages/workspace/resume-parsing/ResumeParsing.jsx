import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import {
  saveResumeExtraction,
  updateProfile,
} from "../../../../application/store/appSlice";
import {
  PageHeading,
  UploadCard,
} from "../../../components/shared/PagePrimitives";
import { apiRequest } from "../../../../infrastructure/api/apiClient";

export function ResumeParsing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectFile(file) {
    setSelectedFile(file);
    setParsed(null);
    setError("");
  }

  async function parse() {
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await apiRequest("/resume/parse", {
        method: "POST",
        body: formData,
      });
      setParsed(response);
      dispatch(
        saveResumeExtraction({
          filename: response.filename,
          extractedAt: new Date().toISOString(),
          textLength: response.extracted_text.length,
        }),
      );

      if (response.profile) {
        const p = response.profile;
        const edu =
          Array.isArray(p.education) && p.education[0] ? p.education[0] : {};
        dispatch(
          updateProfile({
            name: p.name || undefined,
            email: p.email || undefined,
            education: edu.degree || "",
            university: edu.university || "",
            year: edu.year || "",
            skills: p.skills || [],
            role: (p.preferred_roles && p.preferred_roles[0]) || "",
            projects: p.projects || [],
            experience: p.internships || [],
            certifications: p.certifications || [],
            preferred_roles: p.preferred_roles || [],
          }),
        );
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <PageHeading
        eyebrow="YOUR EXPERIENCE, ORGANIZED"
        title="Resume Parsing"
        description="Extract readable text and structured profile data from your PDF or Word resume."
        action={
          <span className="secure-note">
            <ShieldCheck size={16} /> Temporary upload
          </span>
        }
      />
      <div className="resume-layout">
        <section className="panel resume-upload-panel">
          <div className="panel-heading">
            <div>
              <span className="step-badge">01</span>
              <h2>Upload your resume</h2>
              <p>
                Your file is processed for text extraction and structured
                profile mapping.
              </p>
            </div>
          </div>
          <UploadCard
            title="Drop your resume here"
            description="PDF or DOCX · Max 10 MB"
            accept=".pdf,.docx"
            filename={selectedFile?.name || ""}
            onFile={selectFile}
          />
          {error && (
            <p className="form-error resume-error" role="alert">
              {error}
            </p>
          )}
          <div className="upload-trust">
            <span>
              <Check size={14} /> Structured profile populated automatically
            </span>
            <span>
              <Check size={14} /> Skills mapped to canonical RADIX categories
            </span>
            <span>
              <Check size={14} /> Takes just a moment
            </span>
          </div>
          <button
            className="button button-primary full-button"
            disabled={!selectedFile || loading}
            onClick={parse}
          >
            {loading ? (
              "Extracting resume data..."
            ) : (
              <>
                <WandSparkles size={16} /> Extract structured profile
              </>
            )}
          </button>
        </section>
        <aside className="panel parsing-preview">
          <div className="panel-heading">
            <div>
              <h3>What you’ll get</h3>
              <p>
                Structured profile data automatically mapped to your workspace.
              </p>
            </div>
            <div className="soft-icon blue">
              <FileText size={18} />
            </div>
          </div>
          <div className="preview-list">
            {[
              [
                "Structured skills",
                "Categorized into COD, DSA, SYS, SQL, AI, etc.",
              ],
              [
                "Proficiency levels",
                "Estimated 0-10 levels with evidence quotes",
              ],
              [
                "Education & projects",
                "Extracted and mapped to your Profile Builder",
              ],
              [
                "Shared across modules",
                "Feeds Skill Matching and Talent Check immediately",
              ],
            ].map(([title, desc]) => (
              <div key={title}>
                <span className="preview-check">
                  <Check size={13} />
                </span>
                <span>
                  <b>{title}</b>
                  <small>{desc}</small>
                </span>
              </div>
            ))}
          </div>
          <div className="privacy-copy">
            <ShieldCheck size={16} />
            <span>
              Text extraction runs through your configured RADIX backend.
              Temporary files are safely cleaned up.
            </span>
          </div>
        </aside>
      </div>

      {parsed && (
        <section className="panel parsed-result">
          <div className="results-header">
            <div>
              <span className="eyebrow">STRUCTURED DATA EXTRACTED</span>
              <h2>{parsed.filename}</h2>
              <p>
                {parsed.extracted_text.length.toLocaleString()} characters
                extracted.
                {parsed.profile?.skills?.length
                  ? ` Found ${parsed.profile.skills.length} categorized skills.`
                  : ""}
              </p>
            </div>
            <span className="status-badge success">
              <CheckCircle2 size={15} /> Extraction complete
            </span>
          </div>

          {parsed.profile && (
            <div
              className="parsed-profile-summary"
              style={{
                margin: "16px 0",
                padding: "16px",
                background: "#faf8ff",
                borderRadius: "10px",
                border: "1px solid #e4def5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#221c45" }}>
                    {parsed.profile.name}
                  </h3>
                  <span style={{ fontSize: "13px", color: "#6b678c" }}>
                    {parsed.profile.email} ·{" "}
                    {parsed.profile.preferred_roles?.join(", ") || "Candidate"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    background: "#f0ebff",
                    color: "#6740cf",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontWeight: "600",
                  }}
                >
                  Profile Synced
                </span>
              </div>

              {parsed.profile.skills && parsed.profile.skills.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <div
                    style={{
                      background: "#fefce8",
                      border: "1px solid #fef08a",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      marginBottom: "10px",
                      fontSize: "12px",
                      color: "#854d0e",
                    }}
                  >
                    <b>⚠️ Heuristic Proficiency Estimates:</b> Extracted skills
                    and proficiency levels are automated estimates derived from
                    resume text. Candidate review and confirmation is
                    recommended before running official Talent Check
                    assessments.
                  </div>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#443f66",
                    }}
                  >
                    Extracted Skills ({parsed.profile.skills.length}):
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {parsed.profile.skills.map((s, idx) => {
                      const name = typeof s === "object" ? s.skill_name : s;
                      const cat = typeof s === "object" ? s.category_code : "";
                      const lvl =
                        typeof s === "object" && s.level != null
                          ? `Est. Lvl ${s.level}`
                          : "";
                      const conf =
                        typeof s === "object" && s.confidence
                          ? s.confidence
                          : "low";
                      return (
                        <span
                          key={idx}
                          style={{
                            background: "#fff",
                            border: "1px solid #dcd7f2",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "12px",
                            color: "#302b52",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <b>{name}</b>
                          {cat && (
                            <span
                              style={{ color: "#7456d6", fontSize: "11px" }}
                            >
                              [{cat}]
                            </span>
                          )}
                          {lvl && (
                            <span
                              style={{
                                color: "#ca8a04",
                                fontSize: "11px",
                                fontWeight: "600",
                                background: "#fef9c3",
                                padding: "1px 4px",
                                borderRadius: "3px",
                              }}
                              title="Estimated proficiency from resume; candidate confirmation required"
                            >
                              {lvl}
                            </span>
                          )}
                          <span
                            style={{
                              color: "#64748b",
                              fontSize: "10px",
                            }}
                          >
                            ({conf} conf)
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <button
                      className="button button-primary"
                      style={{ fontSize: "13px", padding: "6px 14px" }}
                      onClick={() => navigate("/profile")}
                    >
                      Review & Confirm Skills in Profile Builder{" "}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <details className="extracted-text">
            <summary>Review raw extracted text</summary>
            <pre>{parsed.extracted_text}</pre>
          </details>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="button button-primary"
              onClick={() => navigate("/profile")}
            >
              Review in Profile Builder <ArrowRight size={15} />
            </button>
            <button
              className="button button-outline"
              onClick={() => navigate("/matching")}
            >
              Match with Target Jobs <Sparkles size={15} />
            </button>
            <button
              className="button button-outline"
              onClick={() => navigate("/talent-check")}
            >
              Check Company Readiness
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
