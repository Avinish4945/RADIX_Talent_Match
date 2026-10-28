import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut } from "../../application/store/appSlice";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Job analytics", icon: Activity },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/talent-check", label: "Talent Check", icon: UserRoundCheck },
  { to: "/matching", label: "Job matching", icon: Sparkles },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const user = useSelector((state) => state.app.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage =
    links.find(({ to }) => location.pathname.startsWith(to))?.label ||
    (location.pathname.startsWith("/profile") ? "My profile" : "Workspace");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 820px)");
    const updateViewport = () => {
      setIsMobile(mediaQuery.matches);
      if (!mediaQuery.matches) setMobileOpen(false);
    };
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.inert = isMobile && !mobileOpen;
    }
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const trigger = mobileMenuRef.current;
    const drawer = sidebarRef.current;
    const focusable = drawer?.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])",
    );
    focusable?.[0]?.focus();

    function handleDrawerKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        trigger?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDrawerKeyDown);
    return () => {
      document.removeEventListener("keydown", handleDrawerKeyDown);
      trigger?.focus();
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeAccountMenu(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        userMenuRef.current?.focus();
      }
    }
    document.addEventListener("keydown", closeAccountMenu);
    return () => document.removeEventListener("keydown", closeAccountMenu);
  }, [menuOpen]);

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
      <aside
        id="workspace-sidebar"
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
        ref={sidebarRef}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? "true" : undefined}
        aria-label={mobileOpen ? "Workspace navigation" : undefined}
        aria-hidden={isMobile && !mobileOpen}
      >
        {isMobile && (
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} strokeWidth={2} />
          </button>
        )}
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
        </NavLink>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Workspace navigation">
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
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            ref={mobileMenuRef}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="workspace-sidebar"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb" aria-label="Current page">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <b>{currentPage}</b>
          </div>
          <div className="topbar-actions">
            <div className="user-menu-wrap">
              <button
                className="user-menu"
                ref={userMenuRef}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Account menu for ${user?.name || "your profile"}`}
              >
                <span className="avatar">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </span>
                <span className="user-menu-name">
                  {user?.name || "Your profile"}
                </span>
                <ChevronDown size={15} />
              </button>
              {menuOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="dropdown-user">
                    <b>{user?.name || "Your profile"}</b>
                    <span>{user?.email || "Your account"}</span>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <Settings size={15} /> My profile
                  </button>
                  <button role="menuitem" onClick={logout}>
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
