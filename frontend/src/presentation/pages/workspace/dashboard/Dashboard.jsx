import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { PageHeading } from "../../../components/shared/PagePrimitives";

function formatActivityDate(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function Dashboard() {
  const profile = useSelector((state) => state.app.profile);
  const user = useSelector((state) => state.app.user);
  const latestReadiness = useSelector(
    (state) => state.app.latestReadinessResult,
  );
  const name = user?.name || profile.name || "there";

  const jobAnalyses = profile.jobAnalyses || [];
  const latestMatching = profile.lastMatchingResult;

  const activity = useMemo(() => {
    const items = jobAnalyses
      .filter((entry) => entry && typeof entry === "object")
      .map((entry, index) => ({
        icon: BriefcaseBusiness,
        title:
          entry.title || `Job Analysis (${entry.company || "Analyzed Role"})`,
        detail:
          entry.skills?.length > 0
            ? `${entry.skills.length} skills extracted via LLM`
            : "JD text analyzed",
        createdAt: entry.createdAt,
        tint: "purple",
        key: `analysis-${entry.createdAt || index}`,
      }));

    if (profile.resumeExtractedAt) {
      items.push({
        icon: FileText,
        title: "Resume text & profile extracted",
        detail: `${profile.resumeName || "Resume"} · ${profile.skills?.length || 0} structured skills mapped`,
        createdAt: profile.resumeExtractedAt,
        tint: "blue",
        key: "resume-extraction",
      });
    }

    if (latestMatching?.createdAt) {
      items.push({
        icon: Sparkles,
        title: `Skill match: ${latestMatching.role}`,
        detail: `${latestMatching.company || "Target Job"} · ${latestMatching.score ?? 0}% match score`,
        createdAt: latestMatching.createdAt,
        tint: "pink",
        key: "skill-matching-activity",
      });
    }

    if (latestReadiness) {
      items.push({
        icon: Target,
        title: `Talent check: ${latestReadiness.company}`,
        detail: `Readiness: ${latestReadiness.readiness_score ?? "N/A"}% · Coverage: ${latestReadiness.coverage_percent ?? 0}%`,
        createdAt: new Date().toISOString(),
        tint: "orange",
        key: "talent-check-activity",
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 5);
  }, [
    jobAnalyses,
    profile.resumeExtractedAt,
    profile.resumeName,
    profile.skills,
    latestMatching,
    latestReadiness,
  ]);

  const workflow = [
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
      to: "/analytics",
      label: "Upload JD",
      detail: "JD Analytics",
      icon: BriefcaseBusiness,
      color: "violet",
    },
    {
      to: "/matching",
      label: "Match Skills",
      detail: "Skill Matching",
      icon: Sparkles,
      color: "pink",
    },
    {
      to: "/talent-check",
      label: "Check Readiness",
      detail: "Talent Check",
      icon: Target,
      color: "amber",
    },
  ];

  return (
    <div className="page dashboard-page">
      <PageHeading
        eyebrow="ANALYZE  ·  BUILD  ·  ASSESS  ·  MATCH"
        title="RADIX Talent Match"
        description={`Welcome${name !== "there" ? `, ${name.split(" ")[0]}` : ""}. Analyze job descriptions, organize your structured profile, and discover where your skills fit.`}
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Integrated Workspace</h2>
            <p>
              One shared profile powering all assessment and matching tools.
            </p>
          </div>
          <span className="section-step">
            ACTIVE PROFILE: {profile.name || "Default"}
          </span>
        </div>
        <div className="quick-grid">
          <Link className="quick-card q-purple" to="/resume">
            <span className="quick-icon">
              <FileText size={20} />
            </span>
            <b>Resume Parsing</b>
            <p>Extract structured profile & skills directly from PDF/DOCX.</p>
            <span className="quick-link">
              Parse a resume <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-green" to="/profile">
            <span className="quick-icon">
              <UserRound size={20} />
            </span>
            <b>Profile Builder</b>
            <p>Review and edit skills, categories, and project evidence.</p>
            <span className="quick-link">
              Edit profile ({profile.skills?.length || 0} skills){" "}
              <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-blue" to="/analytics">
            <span className="quick-icon">
              <BriefcaseBusiness size={20} />
            </span>
            <b>JD Analytics</b>
            <p>
              Extract role, company, and required skills from a job description.
            </p>
            <span className="quick-link">
              Analyze a job <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-pink" to="/matching">
            <span className="quick-icon">
              <Sparkles size={20} />
            </span>
            <b>Skill Matching</b>
            <p>
              Deterministic backend matching against target role requirements.
            </p>
            <span className="quick-link">
              {latestMatching
                ? `Latest: ${latestMatching.score}% match`
                : "Match a role"}{" "}
              <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-orange" to="/talent-check">
            <span className="quick-icon">
              <Target size={20} />
            </span>
            <b>Talent Check</b>
            <p>
              Assess readiness against official Google, Microsoft, and Oracle
              benchmarks.
            </p>
            <span className="quick-link">
              {latestReadiness?.readiness_score != null
                ? `Readiness: ${latestReadiness.readiness_score}%`
                : "Check readiness"}{" "}
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      <section className="workflow-panel" aria-labelledby="workflow-title">
        <div className="section-heading">
          <div>
            <h2 id="workflow-title">End-to-End Application Workflow</h2>
            <p>
              Follow the 5-step guided path from resume parsing to readiness
              evaluation.
            </p>
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
              <p>Actions across your workspace modules.</p>
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
                  Upload a resume or job description to see your progress here.
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
              <h2>Latest Skill Match Result</h2>
              <p>
                {latestMatching
                  ? `${latestMatching.company || "Target Role"}: ${latestMatching.role}`
                  : "No role matched yet"}
              </p>
            </div>
            <span className="status-badge success">
              {latestMatching?.score != null
                ? `${latestMatching.score}% Match`
                : "Connected"}
            </span>
          </div>
          <div className="match-preview-empty">
            <div className="soft-icon purple">
              <Sparkles size={19} />
            </div>
            {latestMatching ? (
              <div>
                <b style={{ fontSize: "28px", color: "#6841cf" }}>
                  {latestMatching.score}%
                </b>
                <p style={{ margin: "4px 0 0" }}>
                  {latestMatching.summary
                    ? `${latestMatching.summary.matched} skills matched, ${latestMatching.summary.missing} missing`
                    : `Evaluated against ${latestMatching.role}`}
                </p>
              </div>
            ) : (
              <p>
                Run the backend Skill Matching engine against official Google,
                Microsoft, or Oracle roles.
              </p>
            )}
          </div>
          <Link className="panel-footer-link" to="/matching">
            Open Skill Matching <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}
