import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { saveResumeExtraction } from "../../../../application/store/appSlice";
import {
  PageHeading,
  UploadCard,
} from "../../../components/shared/PagePrimitives";
import { apiRequest } from "../../../../infrastructure/api/apiClient";

export function ResumeParsing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsed, setParsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function selectFile(file) {
    setSelectedFile(file);
    setParsed(false);
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
        description="Extract readable text from your PDF or Word resume and review it before updating your profile."
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
                Your file is processed for text extraction and is not saved by
                this service.
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
              <Check size={14} /> Temporary file removed after extraction
            </span>
            <span>
              <Check size={14} /> Text reviewed before profile changes
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
              "Extracting resume text..."
            ) : (
              <>
                <WandSparkles size={16} /> Extract text
              </>
            )}
          </button>
        </section>
        <aside className="panel parsing-preview">
          <div className="panel-heading">
            <div>
              <h3>What you’ll get</h3>
              <p>Readable text from a text-based PDF or DOCX file.</p>
            </div>
            <div className="soft-icon blue">
              <FileText size={18} />
            </div>
          </div>
          <div className="preview-list">
            {[
              ["Resume text", "Extracted from readable document content"],
              ["Original filename", "Shown with the extracted text"],
              ["Character count", "Approximate length of extracted text"],
              ["Text preview", "Review before making profile changes"],
              [
                "No automatic edits",
                "Your profile is not changed by extraction",
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
              Text extraction runs through your configured RADIX backend. A
              temporary file is removed after extraction.
            </span>
          </div>
        </aside>
      </div>
      {parsed && (
        <section className="panel parsed-result">
          <div className="results-header">
            <div>
              <span className="eyebrow">TEXT EXTRACTED</span>
              <h2>{parsed.filename}</h2>
              <p>
                {parsed.extracted_text.length.toLocaleString()} characters
                extracted. Review the text before updating your profile.
              </p>
            </div>
            <span className="status-badge success">
              <CheckCircle2 size={15} /> Extraction complete
            </span>
          </div>
          <details className="extracted-text">
            <summary>Review extracted text</summary>
            <pre>{parsed.extracted_text}</pre>
          </details>
          <button
            className="button button-primary"
            onClick={() => navigate("/profile")}
          >
            Continue to My profile <ArrowRight size={15} />
          </button>
        </section>
      )}
    </div>
  );
}
