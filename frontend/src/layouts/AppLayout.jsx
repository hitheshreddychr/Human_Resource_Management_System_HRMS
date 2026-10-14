import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity, Bell, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined,
  ChevronLeft, ChevronRight, CircleDollarSign, ClipboardList, LayoutDashboard,
  LogOut, Menu, Settings, ShieldCheck, Users, Wallet, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "hr", "employee"] },
  { label: "Admin Panel", path: "/admin", icon: ShieldCheck, roles: ["admin"] },
  { label: "Employees", path: "/employees", icon: Users, roles: ["admin", "hr"] },
  { label: "Attendance", path: "/attendance", icon: CalendarDays, roles: ["admin", "hr", "employee"] },
  { label: "Leave Management", path: "/leaves", icon: BriefcaseBusiness, roles: ["admin", "hr", "employee"] },
  { label: "Payroll", path: "/payroll", icon: CircleDollarSign, roles: ["admin", "hr"] },
  { label: "Salary Slips", path: "/salary-slips", icon: Wallet, roles: ["admin", "hr", "employee"] },
  { label: "Notifications", path: "/notifications", icon: Bell, roles: ["admin", "hr", "employee"] },
  { label: "Reports", path: "/reports", icon: ChartNoAxesCombined, roles: ["admin", "hr"] },
  { label: "Audit Logs", path: "/audit-logs", icon: ClipboardList, roles: ["admin"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = links.filter((item) => item.roles.includes(user?.role));

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Users size={22} /></span>
          {!collapsed && <span>PeopleFirst<span className="brand-dot">.</span></span>}
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">{!collapsed && "WORKSPACE"}</div>

        <nav className="sidebar-nav">
          {visibleLinks.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              title={collapsed ? label : undefined}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-row">
            <div className="avatar">
              {(user?.email || "U").charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="profile-details">
                <strong>{user?.email || "User"}</strong>
                <span>{user?.role || "Employee"}</span>
              </div>
            )}
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        <button
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-heading">
            <strong>Human Resources</strong>
            <span>Manage your people, effortlessly.</span>
          </div>
          <button className="topbar-profile" onClick={() => navigate("/dashboard")}>
            <span className="avatar avatar-small">
              {(user?.email || "U").charAt(0).toUpperCase()}
            </span>
            <span className="topbar-user">{user?.email || "Account"}</span>
          </button>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>PeopleFirst HRMS</span>
          <span><Activity size={13} /> Human Resource Management System</span>
        </footer>
      </div>
    </div>
  );
}
