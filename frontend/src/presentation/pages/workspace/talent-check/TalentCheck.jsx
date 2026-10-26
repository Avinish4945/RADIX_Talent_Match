import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { markReadinessChecked } from "../../../../application/store/appSlice";
import {
  PageHeading,
  ProgressRing,
} from "../../../components/shared/PagePrimitives";

export function TalentCheck() {
  const dispatch = useDispatch();
  const checked = useSelector((state) => state.app.readinessChecked);
  const [company, setCompany] = useState("Google");
  const breakdown = [
    ["Coding (DSA)", 8, 9],
    ["Data structures", 7, 8],
    ["SQL", 8, 6],
    ["System design", 6, 7],
    ["Communication", 8, 6],
  ];
  return (
    <div className="page">
      <PageHeading
        eyebrow="KNOW WHERE YOU STAND"
        title="Talent check"
        description="Get a clearer picture of your readiness for a target company and discover where to focus next."
        action={
          <span className="secure-note">
            <ShieldCheck size={16} /> Private to you
          </span>
        }
      />
      <section className="panel check-controls">
        <div className="check-control-copy">
          <div className="soft-icon purple">
            <Target size={19} />
          </div>
          <div>
            <b>Choose a company</b>
            <span>
              We'll compare your profile with what top teams look for.
            </span>
          </div>
        </div>
        <div className="check-control-actions">
          <select
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            aria-label="Select company"
          >
            {["Google", "Atlassian", "Microsoft", "Amazon", "Airbnb"].map(
              (name) => (
                <option key={name}>{name}</option>
              ),
            )}
          </select>
          <button
            className="button button-primary"
            onClick={() => dispatch(markReadinessChecked())}
          >
            <Activity size={16} />{" "}
            {checked ? "Refresh talent check" : "Run talent check"}
          </button>
        </div>
      </section>
      <div className="readiness-layout">
        <section className="panel readiness-score-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR READINESS</span>
              <h2>{company} · Software Engineer</h2>
              <p>
                {checked
                  ? "Your profile has been checked against this company's role expectations."
                  : "Your latest profile snapshot compared with role expectations."}
              </p>
            </div>
            <span className="status-badge">Updated today</span>
          </div>
          <div className="score-overview">
            <ProgressRing value={checked ? 76 : 72} size={148} stroke={11} />
            <div>
              <h3>
                {checked
                  ? "You're getting closer."
                  : "You're close to meeting the requirements."}
              </h3>
              <p>
                You're in a good place. A few focused improvements could make
                your application even stronger.
              </p>
              <div className="score-caption">
                <i /> Your readiness score <b>{checked ? "76" : "72"}/100</b>
              </div>
            </div>
          </div>
          <div className="readiness-breakdown">
            <div className="breakdown-heading">
              <b>Skill-wise breakdown</b>
              <span>Your level compared with this role</span>
            </div>
            <div className="breakdown-table">
              <div className="breakdown-row table-head">
                <span>Skill</span>
                <span>Your level</span>
                <span>Target</span>
                <span>Status</span>
              </div>
              {breakdown.map(([name, yours, required]) => (
                <div className="breakdown-row" key={name}>
                  <b>{name}</b>
                  <span>{yours}/10</span>
                  <span>{required}/10</span>
                  <span
                    className={`status-word ${yours >= required ? "meets" : yours === required - 1 ? "near" : "gap"}`}
                  >
                    {yours >= required
                      ? "Meets"
                      : yours === required - 1
                        ? "Near"
                        : "Gap"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="panel improve-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR NEXT STEPS</span>
              <h2>Areas to improve</h2>
            </div>
            <span className="soft-icon orange">
              <Lightbulb size={18} />
            </span>
          </div>
          <p className="improve-intro">
            A little focused practice can help you feel more ready.
          </p>
          <div className="improve-list">
            {[
              "Data structures and algorithms",
              "System design fundamentals",
              "Cloud technologies (AWS)",
              "Communication skills",
            ].map((item, i) => (
              <div key={item}>
                <span className="improve-number">0{i + 1}</span>
                <span>{item}</span>
                <ArrowRight size={14} />
              </div>
            ))}
          </div>
          <Link to="/matching" className="button button-outline full-button">
            Find roles that fit <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
      <div className="tip-banner">
        <div className="tip-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <b>Progress over perfection</b>
          <span>
            Readiness is a guide, not a gate. Keep learning and check back as
            your profile grows.
          </span>
        </div>
        <Link to="/profile">
          Update profile <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
