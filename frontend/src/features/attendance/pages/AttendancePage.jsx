
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  LogIn,
  LogOut,
  RefreshCw,
} from "lucide-react";
import {
  checkIn,
  checkOut,
  getAllAttendance,
  getMyAttendance,
} from "../api/attendanceApi";
import { useAuth } from "../../../context/AuthContext";

function formatDate(value) {
  if (!value) return "—";

  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function formatTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes = 0) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const isManager = ["admin", "hr"].includes(user?.role);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = isManager
        ? await getAllAttendance()
        : await getMyAttendance();

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const todaysRecord = records.find(
    (record) => record.attendance_date === todayKey
  );

  const checkedIn = Boolean(todaysRecord?.check_in);
  const checkedOut = Boolean(todaysRecord?.check_out);

  async function handleAction(action) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (action === "check-in") {
        await checkIn();
        setMessage("Check-in recorded successfully.");
      } else {
        await checkOut();
        setMessage("Check-out recorded successfully.");
      }

      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to complete the attendance action."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">PEOPLEFIRST HRMS</p>
          <h1>Attendance</h1>
          <p className="muted">
            Manage attendance and working hours.
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={loadAttendance}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}

      {!isManager && (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon purple">
                <CalendarDays size={21} />
              </div>
              <p>Today's status</p>
              <div className="stat-bottom">
                <strong>
                  {checkedOut
                    ? "Completed"
                    : checkedIn
                      ? "Checked in"
                      : "Not checked in"}
                </strong>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon blue">
                <Clock3 size={21} />
              </div>
              <p>Working time</p>
              <div className="stat-bottom">
                <strong>
                  {formatDuration(todaysRecord?.working_minutes ?? 0)}
                </strong>
              </div>
            </article>
          </section>

          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Daily attendance</h2>
                <p className="muted">
                  {today.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className={`employee-status ${checkedIn ? "active" : "inactive"}`}>
                {checkedOut
                  ? "Completed"
                  : checkedIn
                    ? "In progress"
                    : "Not started"}
              </span>
            </div>

            <div className="employee-form-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => handleAction("check-in")}
                disabled={busy || checkedIn}
              >
                <LogIn size={17} />
                Check in
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() => handleAction("check-out")}
                disabled={busy || !checkedIn || checkedOut}
              >
                <LogOut size={17} />
                Check out
              </button>
            </div>

            <div className="status-row">
              <span>Check-in time</span>
              <strong>{formatTime(todaysRecord?.check_in)}</strong>
            </div>

            <div className="status-row">
              <span>Check-out time</span>
              <strong>{formatTime(todaysRecord?.check_out)}</strong>
            </div>
          </section>
        </>
      )}

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>{isManager ? "Attendance directory" : "My attendance history"}</h2>
            <p className="muted">
              {records.length} record{records.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading attendance records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={34} />
            <h3>No attendance records yet</h3>
            <p>Records will appear here after attendance is recorded.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="employee-table">
              <thead>
                <tr>
                  {isManager && <th>Employee ID</th>}
                  <th>Date</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Working time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {isManager && <td>#{record.employee_id}</td>}
                    <td>{formatDate(record.attendance_date)}</td>
                    <td>{formatTime(record.check_in)}</td>
                    <td>{formatTime(record.check_out)}</td>
                    <td>{formatDuration(record.working_minutes)}</td>
                    <td>
                      <span
                        className={`employee-status ${
                          record.status === "present" ? "active" : "inactive"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
