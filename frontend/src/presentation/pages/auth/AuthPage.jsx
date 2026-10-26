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
    dispatch(
      signIn({
        name: name
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        email,
      }),
    );
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
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-switch">
            <Link className={mode === "login" ? "selected" : ""} to="/login">
              Log in
            </Link>
            <Link className={mode === "signup" ? "selected" : ""} to="/signup">
              Create account
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
                : "Create an account and build your career momentum."}
            </p>
            <p className="demo-note">
              Demo mode: any valid email and password (6+ characters) will work.
            </p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
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
            )}
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
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                  minLength={6}
                />
                <button
                  className="reveal-button"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
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
              {mode === "login"
                ? "Log in to your workspace"
                : "Create my account"}
              <ArrowRight size={17} />
            </button>
          </form>
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
          <p className="auth-bottom">
            {mode === "login" ? "New to Radix?" : "Already have an account?"}{" "}
            <Link to={mode === "login" ? "/signup" : "/login"}>
              {mode === "login" ? "Create an account" : "Log in"}
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
