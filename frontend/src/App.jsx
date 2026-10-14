
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import AttendancePage from "./features/attendance/pages/AttendancePage";

function FeaturePlaceholder({ title }) {
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">PEOPLEFIRST HRMS</p>
          <h1>{title}</h1>
          <p className="muted">
            Your dedicated {title.toLowerCase()} workspace.
          </p>
        </div>
      </section>

      <section className="content-card">
        <h2>{title}</h2>
        <p className="muted">
          This feature page is ready for its dedicated implementation.
        </p>
      </section>
    </div>
  );
}

const features = [
  { path: "employees", title: "Employees", roles: ["admin", "hr"] },
  { path: "leaves", title: "Leave Management", roles: ["admin", "hr", "employee"] },
  { path: "payroll", title: "Payroll", roles: ["admin", "hr"] },
  { path: "salary-slips", title: "Salary Slips", roles: ["admin", "hr", "employee"] },
  { path: "notifications", title: "Notifications", roles: ["admin", "hr", "employee"] },
  { path: "reports", title: "Reports", roles: ["admin", "hr"] },
  { path: "audit-logs", title: "Audit Logs", roles: ["admin"] },
];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />

        <Route
          path="admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="attendance"
          element={
            <ProtectedRoute roles={["admin", "hr", "employee"]}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        {features.map(({ path, title, roles }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute roles={roles}>
                <FeaturePlaceholder title={title} />
              </ProtectedRoute>
            }
          />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
