import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Users,
} from "lucide-react";
import { getDashboardSummary } from "../api/dashboardApi";

const cards = [
  {
    key: "total_employees",
    label: "Active employees",
    icon: Users,
    color: "purple",
  },
  {
    key: "attendance_records",
    label: "Attendance records",
    icon: CalendarDays,
    color: "blue",
  },
  {
    key: "pending_leaves",
    label: "Pending leave requests",
    icon: BriefcaseBusiness,
    color: "orange",
  },
  {
    key: "payroll_records",
    label: "Payroll records",
    icon: CircleDollarSign,
    color: "green",
  },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
            "Unable to load dashboard statistics."
        );
      });
  }, []);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="muted">
            Your HR workspace at a glance.
          </p>
        </div>

        <span className="live-pill">
          <Activity size={14} />
          Workspace overview
        </span>
      </section>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <section className="stats-grid">
        {cards.map(({ key, label, icon: Icon, color }) => (
          <article className="stat-card" key={key}>
            <div className={`stat-icon ${color}`}>
              <Icon size={21} />
            </div>

            <p>{label}</p>

            <div className="stat-bottom">
              <strong>
                {summary ? (summary[key] ?? 0) : "—"}
              </strong>
              <ArrowUpRight size={18} className="stat-arrow" />
            </div>
          </article>
        ))}
      </section>

      <section className="content-card welcome-card">
        <div>
          <p className="eyebrow">PEOPLEFIRST HRMS</p>
          <h2>Your people, all in one place.</h2>
          <p className="muted">
            Manage employee information, attendance, leave requests,
            and payroll from your dedicated workspace.
          </p>
        </div>

        <div className="welcome-art">
          <Users size={70} strokeWidth={1.2} />
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Workspace status</h2>
            <p className="muted">
              Live connection to your HRMS backend
            </p>
          </div>

          <span
            className={`status-pill ${
              summary ? "status-success" : "status-pending"
            }`}
          >
            {summary ? "Connected" : "Loading"}
          </span>
        </div>

        <div className="status-row">
          <span>Dashboard summary API</span>
          <strong>
            {summary ? "Available" : "Waiting for response"}
          </strong>
        </div>
      </section>
    </div>
  );
}
