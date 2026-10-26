import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  Lightbulb,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { recentActivity } from "../../../../infrastructure/demo/demoData";
import {
  MetricCard,
  PageHeading,
  ProgressRing,
} from "../../../components/shared/PagePrimitives";
const activityIcons = { Activity, FileText, UserRound };

export function Dashboard() {
  const profile = useSelector((state) => state.app.profile);
  const user = useSelector((state) => state.app.user);
  const name = user?.name || profile.name;
  return (
    <div className="page dashboard-page">
      <PageHeading
        eyebrow="MONDAY, OCTOBER 24, 2026"
        title={
          <>
            Hello, {name.split(" ")[0]} <span className="wave">✦</span>
          </>
        }
        description="A little progress every day adds up. Here's your career journey at a glance."
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
          value="80%"
          note="12% this week"
          icon={UserRound}
          color="green"
        />
        <MetricCard
          label="Resumes parsed"
          value={profile.resumeName ? "3" : "2"}
          note="1 this month"
          icon={FileText}
          color="blue"
        />
        <MetricCard
          label="Jobs analyzed"
          value="3"
          note="2 this month"
          icon={BriefcaseBusiness}
          color="purple"
        />
        <MetricCard
          label="Talent check"
          value="72%"
          note="8% this week"
          icon={Target}
          color="orange"
        />
        <MetricCard
          label="Job matches"
          value="4"
          note="2 new matches"
          icon={Sparkles}
          color="pink"
        />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Keep your momentum</h2>
            <p>Your next career move is just a few steps away.</p>
          </div>
          <span className="section-step">YOUR WORKSPACE</span>
        </div>
        <div className="quick-grid">
          <Link className="quick-card q-blue" to="/analytics">
            <span className="quick-icon">
              <Activity size={20} />
            </span>
            <b>Analyze a job</b>
            <p>
              Understand the skills and requirements behind any job description.
            </p>
            <span className="quick-link">
              Analyze job <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-purple" to="/resume">
            <span className="quick-icon">
              <FileText size={20} />
            </span>
            <b>Parse your resume</b>
            <p>Turn your resume into an insightful, skill-rich profile.</p>
            <span className="quick-link">
              Upload resume <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-green" to="/profile">
            <span className="quick-icon">
              <UserRound size={20} />
            </span>
            <b>Build your profile</b>
            <p>Showcase your experience, skills, and career interests.</p>
            <span className="quick-link">
              Edit profile <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-orange" to="/talent-check">
            <span className="quick-icon">
              <Target size={20} />
            </span>
            <b>Check readiness</b>
            <p>See how prepared you are for the roles you want.</p>
            <span className="quick-link">
              Run talent check <ArrowRight size={14} />
            </span>
          </Link>
          <Link className="quick-card q-pink" to="/matching">
            <span className="quick-icon">
              <Sparkles size={20} />
            </span>
            <b>Find job matches</b>
            <p>Discover opportunities that fit your unique strengths.</p>
            <span className="quick-link">
              Find my matches <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      <div className="dashboard-bottom">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Your latest career journey updates.</p>
            </div>
            <button
              className="icon-button subtle-button"
              aria-label="More activity"
            >
              <ArrowRight size={17} />
            </button>
          </div>
          <div className="activity-list">
            {recentActivity.map((item) => {
              const ActivityIcon = activityIcons[item.icon];
              return (
                <div className="activity-row" key={item.title}>
                  <span className={`activity-icon ${item.tint}`}>
                    <ActivityIcon size={16} />
                  </span>
                  <div className="activity-copy">
                    <b>{item.title}</b>
                    <span>{item.detail}</span>
                  </div>
                  <time>{item.time}</time>
                </div>
              );
            })}
          </div>
          <Link className="panel-footer-link" to="/profile">
            View all activity <ArrowRight size={14} />
          </Link>
        </section>
        <section className="panel match-preview">
          <div className="panel-heading">
            <div>
              <h2>Latest match result</h2>
              <p>{profile.analyzedJob}</p>
            </div>
            <span className="live-dot">UPDATED</span>
          </div>
          <div className="match-result">
            <ProgressRing value={75} size={126} />
            <div className="match-legend">
              <div>
                <i className="legend-green" />
                <span>Matched skills</span>
                <b>8</b>
              </div>
              <div>
                <i className="legend-red" />
                <span>Missing skills</span>
                <b>3</b>
              </div>
              <div>
                <i className="legend-gray" />
                <span>Total skills</span>
                <b>11</b>
              </div>
            </div>
          </div>
          <Link className="panel-footer-link" to="/matching">
            View match details <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}
