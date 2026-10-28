import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Download,
  FileText,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import {
  MetricCard,
  PageHeading,
} from "../../../components/shared/PagePrimitives";

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

  const completionFields = [
    profile.role,
    profile.education,
    profile.university,
    profile.year,
    profile.skills?.length,
    profile.projects?.length,
    profile.experience?.length,
    profile.certifications?.length,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100,
  );
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

  return (
    <div className="page dashboard-page">
      <PageHeading
        eyebrow={new Date()
          .toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .toUpperCase()}
        title={
          <>
            Hello, {name.split(" ")[0]} <span className="wave">✦</span>
          </>
        }
        description="A clear view of your saved profile and recent activity."
        action={
          <button
            className="button button-outline"
            onClick={() => window.print()}
          >
            <Download size={16} /> Export report
          </button>
        }
      />
      <div className="metric-grid">
        <MetricCard
          label="Profile completion"
          value={`${completion}%`}
          note="Based on saved profile sections"
          icon={UserRound}
          color="green"
        />
        <MetricCard
          label="Resumes extracted"
          value={
            profile.resumeExtractionCount || (profile.resumeExtractedAt ? 1 : 0)
          }
          note="Locally saved in this browser"
          icon={FileText}
          color="blue"
        />
        <MetricCard
          label="Descriptions previewed"
          value={jobAnalyses.length}
          note="Local keyword previews"
          icon={BriefcaseBusiness}
          color="purple"
        />
        <MetricCard
          label="Latest readiness"
          value={
            typeof profile.latestReadinessScore === "number"
              ? `${profile.latestReadinessScore}%`
              : "—"
          }
          note={`${profile.talentCheckCount || 0} completed check${profile.talentCheckCount === 1 ? "" : "s"}`}
          icon={Target}
          color="orange"
        />
        <MetricCard
          label="Sample roles matched"
          value={latestMatching ? latestMatching.count : "—"}
          note={
            latestMatching
              ? `Sample results for ${latestMatching.role}`
              : "Run a sample role preview"
          }
          icon={Sparkles}
          color="pink"
        />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Explore your workspace</h2>
            <p>Choose a workflow to continue.</p>
          </div>
          <span className="section-step">YOUR WORKSPACE</span>
        </div>
        <div className="quick-grid">
          <Link className="quick-card q-blue" to="/analytics">
            <span className="quick-icon">
              <Activity size={20} />
            </span>
            <b>Preview job keywords</b>
            <p>Check a description for supported skill mentions.</p>
            <span className="quick-link">
              Preview description <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-purple" to="/resume">
            <span className="quick-icon">
              <FileText size={20} />
            </span>
            <b>Extract resume text</b>
            <p>Review text extracted from a PDF or DOCX resume.</p>
            <span className="quick-link">
              Choose resume <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-green" to="/profile">
            <span className="quick-icon">
              <UserRound size={20} />
            </span>
            <b>My profile</b>
            <p>Update your experience, skills, and career interests.</p>
            <span className="quick-link">
              Edit profile <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-orange" to="/talent-check">
            <span className="quick-icon">
              <Target size={20} />
            </span>
            <b>Check readiness</b>
            <p>Compare a candidate’s assessed skills with requirements.</p>
            <span className="quick-link">
              Run talent check <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-pink" to="/matching">
            <span className="quick-icon">
              <Sparkles size={20} />
            </span>
            <b>Compare sample roles</b>
            <p>See how your listed skills overlap with demo role tags.</p>
            <span className="quick-link">
              Browse sample roles <ArrowRight size={14} />
            </span>
          </Link>
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
