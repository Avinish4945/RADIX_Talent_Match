import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "../../application/store/appSlice";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "JD Analytics", icon: Activity },
  { to: "/resume", label: "Resume Parsing", icon: FileText },
  { to: "/profile", label: "Profile Builder", icon: UserRound },
  { to: "/talent-check", label: "Talent Check", icon: UserRoundCheck },
  { to: "/matching", label: "Skill Matching", icon: Sparkles },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state) => state.app.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function logout() {
    dispatch(signOut());
    navigate("/login");
  }

  return (
    <div className="app-frame">
      {mobileOpen && (
        <button
          className="scrim"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <NavLink
          to="/dashboard"
          className="brand"
          onClick={() => setMobileOpen(false)}
        >
          <span className="brand-mark">R</span>
          <span className="brand-copy">
            <strong>RADIX</strong>
            <small>Talent Match</small>
          </span>
          <button
            className="icon-button sidebar-close"
            aria-label="Close menu"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
            }}
          >
            <X size={18} />
          </button>
        </NavLink>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `side-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <CircleHelp size={17} />
            </div>
            <div>
              <b>Need a hand?</b>
              <span>We're here to help</span>
            </div>
            <ChevronDown size={15} />
          </div>
          <button className="side-link logout-link" onClick={logout}>
            <LogOut size={18} />
            <span>Log out</span>
          </button>
          <div className="sidebar-foot">
            RADIX TALENT MATCH <span>v1.0</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <b>Talent journey</b>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} />
              <input placeholder="Search anything..." aria-label="Search" />
              <kbd>⌘ K</kbd>
            </label>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="user-menu-wrap">
              <button
                className="user-menu"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="avatar">
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </span>
                <span className="user-menu-name">
                  {user?.name || "Avinish"}
                </span>
                <ChevronDown size={15} />
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-user">
                    <b>{user?.name}</b>
                    <span>{user?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <Settings size={15} /> Profile settings
                  </button>
                  <button onClick={logout}>
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
