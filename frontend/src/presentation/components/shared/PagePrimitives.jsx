import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, CloudUpload } from "lucide-react";

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, note, icon: Icon, color, trend }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${color}`}>
          <Icon size={17} />
        </span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">
        <span className={trend === "down" ? "trend-down" : "trend-up"}>
          {trend === "down" ? (
            <ArrowDownRight size={14} />
          ) : (
            <ArrowUpRight size={14} />
          )}
          {note.split(" ")[0]}
        </span>{" "}
        {note.split(" ").slice(1).join(" ")}
      </div>
    </div>
  );
}

export function ProgressRing({ value, size = 116, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span>
        <b>{value}%</b>
        <small>match</small>
      </span>
    </div>
  );
}

export function UploadCard({
  title,
  description,
  accept = ".pdf,.doc,.docx",
  onFile,
  filename,
  icon: Icon = CloudUpload,
}) {
  const [dragging, setDragging] = useState(false);

  function chooseFile(file) {
    if (!file) return;

    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      window.alert("Please choose a PDF or Word document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      window.alert("Please choose a file smaller than 10 MB.");
      return;
    }

    onFile(file);
  }

  return (
    <label
      className={`upload-card ${dragging ? "dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        chooseFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        type="file"
        accept={accept}
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />
      <div className="upload-icon">
        <Icon size={22} />
      </div>
      <b>{filename || title}</b>
      <span>{filename ? "File ready to analyze" : description}</span>
      <span className="upload-cta">
        <CloudUpload size={15} /> Choose file <small>or drag it here</small>
      </span>
      <small className="file-note">PDF or DOCX · Max 10 MB</small>
    </label>
  );
}
