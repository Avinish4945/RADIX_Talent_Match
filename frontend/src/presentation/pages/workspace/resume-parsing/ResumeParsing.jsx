import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { setResumeName } from "../../../../application/store/appSlice";
import {
  PageHeading,
  UploadCard,
} from "../../../components/shared/PagePrimitives";

export function ResumeParsing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filename = useSelector((state) => state.app.profile.resumeName);
  const [parsed, setParsed] = useState(false);
  const [loading, setLoading] = useState(false);
  function selectFile(file) {
    dispatch(setResumeName(file.name));
    setParsed(false);
  }
  function parse() {
    if (!filename) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setParsed(true);
    }, 600);
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="YOUR EXPERIENCE, ORGANIZED"
        title="Resume parsing"
        description="Upload your resume and let us map out your experience, skills, and education in seconds."
        action={
          <span className="secure-note">
            <ShieldCheck size={16} /> Your data stays yours
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
                We'll extract the details you need to build a stronger profile.
              </p>
            </div>
          </div>
          <UploadCard
            title="Drop your resume here"
            description="PDF or DOCX · Up to 10 MB"
            filename={filename}
            onFile={selectFile}
          />
          <div className="upload-trust">
            <span>
              <Check size={14} /> Secure and private
            </span>
            <span>
              <Check size={14} /> PDF & DOCX supported
            </span>
            <span>
              <Check size={14} /> Takes just a moment
            </span>
          </div>
          <button
            className="button button-primary full-button"
            disabled={!filename || loading}
            onClick={parse}
          >
            {loading ? (
              "Parsing your resume..."
            ) : (
              <>
                <WandSparkles size={16} /> Parse my resume
              </>
            )}
          </button>
        </section>
        <aside className="panel parsing-preview">
          <div className="panel-heading">
            <div>
              <h3>What you'll get</h3>
              <p>A clean, editable snapshot of your career.</p>
            </div>
            <div className="soft-icon blue">
              <FileText size={18} />
            </div>
          </div>
          <div className="preview-list">
            {[
              ["Personal details", "Name, contact information"],
              ["Education", "Degrees and institutions"],
              ["Skills", "Technical and soft skills"],
              ["Experience", "Roles and accomplishments"],
              ["Projects", "Work worth showing off"],
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
            <span>Your resume is processed securely and never shared.</span>
          </div>
        </aside>
      </div>
      {parsed && (
        <section className="panel parsed-result">
          <div className="results-header">
            <div>
              <span className="eyebrow">RESUME PARSED</span>
              <h2>We've found your career highlights</h2>
              <p>Review what we extracted, then add it to your profile.</p>
            </div>
            <span className="status-badge success">
              <CheckCircle2 size={15} /> Ready to review
            </span>
          </div>
          <div className="parsed-columns">
            <div>
              <span>PERSONAL DETAILS</span>
              <b>Avinish Kumar</b>
              <small>avinish@example.com</small>
            </div>
            <div>
              <span>EDUCATION</span>
              <b>B.Tech, Computer Science</b>
              <small>XYZ University · 2022–2026</small>
            </div>
            <div>
              <span>SKILLS IDENTIFIED</span>
              <div className="tag-list">
                {["Java", "React", "SQL", "Node.js", "DSA"].map((skill) => (
                  <span className="skill-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            className="button button-primary"
            onClick={() => navigate("/profile")}
          >
            Add details to my profile <ArrowRight size={15} />
          </button>
        </section>
      )}
    </div>
  );
}

const profileTabs = [
  "Personal info",
  "Skills",
  "Projects",
  "Experience",
  "More",
];
