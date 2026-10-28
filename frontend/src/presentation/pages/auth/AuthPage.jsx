import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { signIn } from "../../../application/store/appSlice";

export function AuthPage({ initialMode = "login" }) {
  const location = useLocation();
  const mode = location.pathname === "/signup" ? "signup" : initialMode;
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const name = String(form.get("name") || email.split("@")[0]).trim();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    const formattedName = name
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    const profileEntries = (field) =>
      String(form.get(field) || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title, ...description] = line.split("—");
          return {
            title: title.trim(),
            description: description.join("—").trim(),
          };
        })
        .filter(({ title }) => title);
    const profile =
      mode === "signup"
        ? {
            education: String(form.get("education") || "").trim(),
            university: String(form.get("university") || "").trim(),
            year: String(form.get("year") || "").trim(),
            role: String(form.get("role") || "").trim(),
            skills: String(form.get("skills") || "")
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
            projects: profileEntries("projects"),
            experience: profileEntries("experience"),
            certifications: profileEntries("certifications"),
          }
        : undefined;

    dispatch(signIn({ name: formattedName, email, profile }));
    navigate("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-art">
        <Link to="/login" className="brand auth-brand">
          <span className="brand-mark">R</span>
          <span className="brand-copy">
            <strong>RADIX</strong>
            <small>Talent Match</small>
          </span>
        </Link>
        <div className="auth-art-content">
          <div className="eyebrow light-eyebrow">
            <Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE
          </div>
          <h1>
            Make your next
            <br />
            <span>move your best.</span>
          </h1>
          <p>
            One place to understand your strengths, sharpen your profile, and
            find the roles made for you.
          </p>
          <div className="auth-art-stats">
            <div>
              <b>01</b>
              <span>
                Understand
                <br />
                your potential
              </span>
            </div>
            <i />
            <div>
              <b>02</b>
              <span>
                Build a profile
                <br />
                that stands out
              </span>
            </div>
            <i />
            <div>
              <b>03</b>
              <span>
                Find your
                <br />
                next opportunity
              </span>
            </div>
          </div>
        </div>
        <div className="auth-art-footer">
          <span>Designed for your career journey</span>
          <span>RADIX · 2026</span>
        </div>
        <div className="art-glow art-glow-one" />
        <div className="art-glow art-glow-two" />
      </section>
      <section
        className={`auth-form-side ${mode === "signup" ? "auth-signup-side" : ""}`}
      >
        <div className={`auth-form-wrap ${mode === "signup" ? "signup" : ""}`}>
          <div className="auth-switch">
            <Link className={mode === "login" ? "selected" : ""} to="/login">
              Log in
            </Link>
            <Link className={mode === "signup" ? "selected" : ""} to="/signup">
              Get started
            </Link>
          </div>
          <div className="auth-heading">
            <span className="auth-small-label">
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </span>
            <h2>
              {mode === "login"
                ? "Good to see you again."
                : "Your journey starts here."}
            </h2>
            <p>
              {mode === "login"
                ? "Sign in to pick up right where you left off."
                : "Create your account and add the essentials to your profile."}
            </p>
            {mode === "login" && (
              <p className="demo-note">
                Demo mode: any valid email and password (6+ characters) will
                work.
              </p>
            )}
            {mode === "signup" && (
              <p className="demo-note">
                Demo mode: this creates a local browser session, not a
                registered account. Profile details stay in this browser.
              </p>
            )}
            {mode === "signup" && (
              <div className="auth-summary-pill">
                <Sparkles size={12} /> Profile-ready in under 2 minutes
              </div>
            )}
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <div className="auth-section-heading">
                  <b>Account details</b>
                  <span>Your sign-in information</span>
                </div>
                <div className="auth-signup-grid">
                  <label className="field-label">
                    Full name
                    <div className="input-wrap">
                      <input
                        name="name"
                        placeholder="e.g. Avinish Kumar"
                        autoComplete="name"
                        required
                      />
                      <span className="field-icon">A</span>
                    </div>
                  </label>
                  <label className="field-label">
                    Email address
                    <div className="input-wrap">
                      <Mail size={17} />
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </label>
                  <label className="field-label auth-field-wide">
                    Password
                    <div className="input-wrap">
                      <LockKeyhole size={17} />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        required
                        minLength={6}
                      />
                      <button
                        className="reveal-button"
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </label>
                </div>
                <div className="auth-section-heading">
                  <b>Professional profile · optional</b>
                  <span>
                    Every field below is optional; add details now or later.
                  </span>
                </div>
                <div className="auth-signup-grid">
                  <label className="field-label">
                    Preferred role
                    <input
                      name="role"
                      placeholder="e.g. Product designer"
                      autoComplete="organization-title"
                    />
                  </label>
                  <label className="field-label">
                    Education
                    <input
                      name="education"
                      placeholder="e.g. B.Sc. Computer Science"
                    />
                  </label>
                  <label className="field-label">
                    Institution
                    <input
                      name="university"
                      placeholder="School or university"
                      autoComplete="organization"
                    />
                  </label>
                  <label className="field-label">
                    Graduation year
                    <input
                      name="year"
                      placeholder="e.g. 2026"
                      inputMode="numeric"
                    />
                  </label>
                  <label className="field-label auth-field-wide">
                    Skills
                    <input
                      name="skills"
                      placeholder="e.g. Research, Figma, Prototyping"
                    />
                    <span className="auth-field-hint">
                      Separate skills with commas.
                    </span>
                  </label>
                  <label className="field-label auth-field-wide">
                    Experience
                    <textarea
                      name="experience"
                      rows={2}
                      placeholder={
                        "e.g. Product design intern — Acme, 2024–2025\nList one role per line."
                      }
                    />
                  </label>
                  <label className="field-label auth-field-wide">
                    Projects
                    <textarea
                      name="projects"
                      rows={2}
                      placeholder={
                        "e.g. Event discovery app — Designed and prototyped a mobile experience.\nList one project per line."
                      }
                    />
                  </label>
                  <label className="field-label auth-field-wide">
                    Certifications
                    <textarea
                      name="certifications"
                      rows={2}
                      placeholder="List certifications, one per line."
                    />
                  </label>
                </div>
              </>
            )}
            {mode === "login" && (
              <>
                <label className="field-label">
                  Email address
                  <div className="input-wrap">
                    <Mail size={17} />
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>
                <label className="field-label">
                  Password
                  <div className="input-wrap">
                    <LockKeyhole size={17} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      minLength={6}
                    />
                    <button
                      className="reveal-button"
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
              </>
            )}
            {mode === "login" && (
              <div className="auth-options">
                <label className="check-label">
                  <input type="checkbox" defaultChecked /> Remember me
                </label>
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setError(
                      "Password reset will be available once email services are connected.",
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-primary auth-submit" type="submit">
              Continue to demo workspace
              <ArrowRight size={17} />
            </button>
          </form>
          {mode === "login" && (
            <>
              <div className="auth-divider">
                <span>or</span>
              </div>
              <button
                className="button button-google"
                onClick={() => {
                  setError(
                    "Google sign-in will be available when authentication is connected.",
                  );
                }}
              >
                <span className="google-g">G</span> Continue with Google
              </button>
            </>
          )}
          <p className="auth-bottom">
            {mode === "login" ? "New to Radix?" : "Already have an account?"}{" "}
            <Link to={mode === "login" ? "/signup" : "/login"}>
              {mode === "login" ? "Get started" : "Log in"}
            </Link>
          </p>
          <p className="auth-terms">
            By continuing, you agree to our{" "}
            <a href="#terms">Terms of Service</a> and{" "}
            <a href="#privacy">Privacy Policy</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
