import { useEffect, useState } from "react";
import { ShieldCheck, Users, CalendarDays, BriefcaseBusiness } from "lucide-react";
import { getAdminSummary } from "../api/adminApi";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminSummary()
      .then(setSummary)
      .catch((err) => setError(err.response?.data?.detail || "Unable to load admin statistics."));
  }, []);

  const items = [
    { key: "total_employees", label: "Active employees", icon: Users },
    { key: "attendance_records", label: "Attendance records", icon: CalendarDays },
    { key: "pending_leaves", label: "Pending leaves", icon: BriefcaseBusiness },
  ];

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Admin Dashboard</h1>
          <p className="muted">Monitor your organisation and HR operations.</p>
        </div>
        <span className="live-pill"><ShieldCheck size={15} /> Admin workspace</span>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="stats-grid">
        {items.map(({ key, label, icon: Icon }) => (
          <article className="stat-card" key={key}>
            <div className="stat-icon purple"><Icon size={21} /></div>
            <p>{label}</p>
            <div className="stat-bottom">
              <strong>{summary ? summary[key] ?? 0 : "—"}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Administration overview</h2>
            <p className="muted">Manage the core operations of your HRMS.</p>
          </div>
        </div>
        <div className="admin-feature-list">
          <div><Users size={20} /><span><strong>Employee management</strong><small>Maintain employee records and profiles.</small></span></div>
          <div><CalendarDays size={20} /><span><strong>Attendance management</strong><small>Review attendance and working records.</small></span></div>
          <div><BriefcaseBusiness size={20} /><span><strong>Leave management</strong><small>Review and manage employee leave requests.</small></span></div>
        </div>
      </section>
    </div>
  );
}
