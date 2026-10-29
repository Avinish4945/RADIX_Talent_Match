import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { PageHeading } from "../../../components/shared/PagePrimitives";

function formatActivityDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function Dashboard() {
  const profile = useSelector((state) => state.app.profile);
  const user = useSelector((state) => state.app.user);
  const name = user?.name || profile.name || "there";

  const jobAnalyses = profile.jobAnalyses || [];
  const activity = useMemo(() => {
    const items = jobAnalyses
      .filter((entry) => entry && typeof entry === "object")
      .map((entry, index) => ({
        icon: Activity,
        title: entry.title || "Job description keyword preview",
        detail:
          entry.keywords?.length > 0
            ? `${entry.keywords.length} supported keyword mentions`
            : "Local keyword preview",
        createdAt: entry.createdAt,
        tint: "purple",
        key: `analysis-${entry.createdAt || index}`,
      }));

    if (profile.resumeExtractedAt) {
      items.push({
        icon: FileText,
        title: "Resume text extracted",
        detail: `${profile.resumeName || "Resume"} · ${(profile.resumeTextLength || 0).toLocaleString()} characters`,
        createdAt: profile.resumeExtractedAt,
        tint: "blue",
        key: "resume-extraction",
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 4);
  }, [
    jobAnalyses,
    profile.resumeExtractedAt,
    profile.resumeName,
    profile.resumeTextLength,
  ]);
  const latestMatching = profile.lastMatchingResult;
  const workflow = [
    {
      to: "/analytics",
      label: "Upload JD",
      detail: "JD Analytics",
      icon: BriefcaseBusiness,
      color: "violet",
    },
    {
      to: "/resume",
      label: "Upload Resume",
      detail: "Resume Parsing",
      icon: FileText,
      color: "blue",
    },
    {
      to: "/profile",
      label: "Build Profile",
      detail: "Profile Builder",
      icon: UserRound,
      color: "green",
    },
    {
      to: "/talent-check",
      label: "Check Readiness",
      detail: "Talent Check",
      icon: Target,
      color: "amber",
    },
    {
      to: "/matching",
      label: "Match a Role",
      detail: "Skill Matching",
      icon: Sparkles,
      color: "pink",
    },
  ];

  return (
    <div className="page dashboard-page">
      <PageHeading
        eyebrow="ANALYZE  ·  BUILD  ·  ASSESS  ·  MATCH"
        title="RADIX Talent Match"
        description={`Welcome${name !== "there" ? `, ${name.split(" ")[0]}` : ""}. Analyze job descriptions, organize your experience, and discover where your skills fit.`}
      />
      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Start with a workflow</h2>
            <p>Choose a tool to take the next step.</p>
          </div>
          <span className="section-step">YOUR WORKSPACE</span>
        </div>
        <div className="quick-grid">
          <Link className="quick-card q-blue" to="/analytics">
            <span className="quick-icon">
              <Activity size={20} />
            </span>
            <b>JD Analytics</b>
            <p>Extract role, company, and skills from a job description.</p>
            <span className="quick-link">
              Analyze a job <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-purple" to="/resume">
            <span className="quick-icon">
              <FileText size={20} />
            </span>
            <b>Resume Parsing</b>
            <p>Turn your PDF or DOCX resume into structured information.</p>
            <span className="quick-link">
              Parse a resume <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-green" to="/profile">
            <span className="quick-icon">
              <UserRound size={20} />
            </span>
            <b>Profile Builder</b>
            <p>Bring your skills, projects, and experience together.</p>
            <span className="quick-link">
              Build your profile <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-orange" to="/talent-check">
            <span className="quick-icon">
              <Target size={20} />
            </span>
            <b>Talent Check</b>
            <p>Compare assessed skills against a company’s requirements.</p>
            <span className="quick-link">
              Check readiness <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-pink" to="/matching">
            <span className="quick-icon">
              <Sparkles size={20} />
            </span>
            <b>Skill Matching</b>
            <p>See how your profile aligns with a specific job role.</p>
            <span className="quick-link">
              Match a role <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      <section className="workflow-panel" aria-labelledby="workflow-title">
        <div className="section-heading">
          <div>
            <h2 id="workflow-title">Complete application flow</h2>
            <p>Move from a job description to a focused skills match.</p>
          </div>
        </div>
        <div className="workflow-steps">
          {workflow.map(({ to, label, detail, icon: Icon, color }, index) => (
            <div className="workflow-step-wrap" key={to}>
              <Link className={`workflow-step ${color}`} to={to}>
                <Icon size={20} />
                <b>{label}</b>
                <span>{detail}</span>
              </Link>
              {index < workflow.length - 1 && (
                <ArrowRight className="workflow-arrow" size={19} />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-bottom">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Based on actions recorded in this browser.</p>
            </div>
          </div>
          <div className="activity-list">
            {activity.length ? (
              activity.map((item) => {
                const ActivityIcon = item.icon;
                return (
                  <div className="activity-row" key={item.key}>
                    <span className={`activity-icon ${item.tint}`}>
                      <ActivityIcon size={16} />
                    </span>
                    <div className="activity-copy">
                      <b>{item.title}</b>
                      <span>{item.detail}</span>
                    </div>
                    <time dateTime={item.createdAt}>
                      {formatActivityDate(item.createdAt)}
                    </time>
                  </div>
                );
              })
            ) : (
              <div className="activity-empty">
                <p>No recent activity yet.</p>
                <span>
                  Your local previews and resume extractions appear here.
                </span>
              </div>
            )}
          </div>
          <Link className="panel-footer-link" to="/profile">
            Review my profile <ArrowRight size={14} />
          </Link>
        </section>
        <section className="panel match-preview">
          <div className="panel-heading">
            <div>
              <h2>Latest role preview</h2>
              <p>
                {latestMatching
                  ? `Target role: ${latestMatching.role}`
                  : "No role preview run yet"}
              </p>
            </div>
            <span className="status-badge">Sample data</span>
          </div>
          <div className="match-preview-empty">
            <div className="soft-icon purple">
              <Sparkles size={19} />
            </div>
            {latestMatching ? (
              <p>
                {latestMatching.count} sample role
                {latestMatching.count === 1 ? "" : "s"} were available for this
                role preview.
              </p>
            ) : (
              <p>
                Compare your profile skills with a small illustrative role
                dataset.
              </p>
            )}
          </div>
          <Link className="panel-footer-link" to="/matching">
            View sample roles <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}
