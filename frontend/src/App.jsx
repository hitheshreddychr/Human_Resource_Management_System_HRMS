import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import AttendancePage from "./features/attendance/pages/AttendancePage";
import LeavesPage from "./features/leaves/pages/LeavesPage";
import PayrollPage from "./features/payroll/pages/PayrollPage";
import SalarySlipsPage from "./features/salary-slips/pages/SalarySlipsPage";
import NotificationsPage from "./features/notifications/pages/NotificationsPage";
import ReportsPage from "./features/reports/pages/ReportsPage";
import AuditLogsPage from "./features/audit-logs/pages/AuditLogsPage";
import EmployeesPage from "./features/employees/pages/EmployeesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="employees" element={<ProtectedRoute roles={["admin", "hr"]}><EmployeesPage /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute roles={["admin", "hr", "employee"]}><AttendancePage /></ProtectedRoute>} />
        <Route path="leaves" element={<ProtectedRoute roles={["admin", "hr", "employee"]}><LeavesPage /></ProtectedRoute>} />
        <Route path="payroll" element={<ProtectedRoute roles={["admin", "hr"]}><PayrollPage /></ProtectedRoute>} />
        <Route path="salary-slips" element={<ProtectedRoute roles={["admin", "hr", "employee"]}><SalarySlipsPage /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute roles={["admin", "hr", "employee"]}><NotificationsPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={["admin", "hr"]}><ReportsPage /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute roles={["admin"]}><AuditLogsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
