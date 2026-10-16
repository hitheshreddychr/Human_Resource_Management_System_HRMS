import "../../../styles/features/employees.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  UserX,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} from "../api/employeeApi";

const emptyForm = {
  employee_code: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joining_date: "",
  annual_salary: "",
};

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "string"
          ? item
          : `${item.loc?.slice(-1)?.[0] ?? "Field"}: ${item.msg}`
      )
      .join(". ");
  }

  return error?.message || "Something went wrong. Please try again.";
}

function formatDate(value) {
  if (!value) return "â€”";

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-IN",
    { day: "2-digit", month: "short", year: "numeric" }
  );
}

function formatSalary(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function EmployeesPage() {
  const { user } = useAuth();
  const canManage = ["admin", "hr"].includes(user?.role);

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : data?.items ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const active = employee.is_active !== false;
      if (!showInactive && !active) return false;

      const searchable = [
        employee.employee_code,
        employee.first_name,
        employee.last_name,
        employee.email,
        employee.department,
        employee.designation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [employees, search, showInactive]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(employee) {
    setEditingId(employee.id);
    setForm({
      employee_code: employee.employee_code || "",
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      joining_date: employee.joining_date?.slice(0, 10) || "",
      annual_salary: String(employee.annual_salary ?? ""),
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editingId !== null) {
        const payload = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          department: form.department.trim(),
          designation: form.designation.trim(),
          joining_date: form.joining_date,
          annual_salary: Number(form.annual_salary),
        };

        await updateEmployee(editingId, payload);
        setNotice("Employee details updated successfully.");
      } else {
        const payload = {
          employee_code: form.employee_code.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          department: form.department.trim(),
          designation: form.designation.trim(),
          joining_date: form.joining_date,
          annual_salary: Number(form.annual_salary),
        };

        await createEmployee(payload);
        setNotice("Employee added successfully.");
      }

      closeForm();
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(employee) {
    const confirmed = window.confirm(
      `Deactivate ${employee.first_name} ${employee.last_name} (${employee.employee_code})?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await deactivateEmployee(employee.id);
      setNotice("Employee deactivated successfully.");
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const activeCount = employees.filter(
    (employee) => employee.is_active !== false
  ).length;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">PEOPLEFIRST HRMS</p>
          <h1>Employees</h1>
          <p className="muted">
            Manage employee records, departments, and employment details.
          </p>
        </div>

        {canManage && (
          <button className="primary-button" onClick={openCreateForm}>
            <Plus size={17} />
            Add employee
          </button>
        )}
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="alert" role="status">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon purple">
            <Users size={21} />
          </div>
          <p>Total employees</p>
          <div className="stat-bottom">
            <strong>{employees.length}</strong>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <p>Active employees</p>
          <div className="stat-bottom">
            <strong>{activeCount}</strong>
          </div>
        </article>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Employee directory</h2>
            <p className="muted">
              {filteredEmployees.length} record
              {filteredEmployees.length === 1 ? "" : "s"} displayed
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadEmployees}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="employee-toolbar">
          <div className="employee-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search name, code, email, department..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search employees"
            />
          </div>

          <label className="inactive-toggle">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(event) => setShowInactive(event.target.checked)}
            />
            Show inactive
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <Users size={32} />
            <h3>No employees found</h3>
            <p>Try another search or add an employee.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining date</th>
                  <th>Annual salary</th>
                  <th>Status</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-identity">
                        <span className="employee-avatar">
                          {(employee.first_name || "?")[0].toUpperCase()}
                        </span>
                        <div>
                          <strong>
                            {employee.first_name} {employee.last_name}
                          </strong>
                          <span>{employee.employee_code}</span>
                          <span>{employee.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{employee.department}</td>
                    <td>{employee.designation}</td>
                    <td>{formatDate(employee.joining_date)}</td>
                    <td>{formatSalary(employee.annual_salary)}</td>
                    <td>
                      <span
                        className={`employee-status ${
                          employee.is_active !== false ? "active" : "inactive"
                        }`}
                      >
                        {employee.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        <div className="employee-actions">
                          <button
                            type="button"
                            className="icon-button"
                            title="Edit employee"
                            aria-label={`Edit ${employee.first_name}`}
                            onClick={() => openEditForm(employee)}
                            disabled={employee.is_active === false}
                          >
                            <Pencil size={16} />
                          </button>

                          {employee.is_active !== false && (
                            <button
                              type="button"
                              className="icon-button danger"
                              title="Deactivate employee"
                              aria-label={`Deactivate ${employee.first_name}`}
                              onClick={() => handleDeactivate(employee)}
                            >
                              <UserX size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="employee-modal-backdrop">
          <section
            className="employee-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-form-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  {editingId !== null ? "UPDATE RECORD" : "NEW RECORD"}
                </p>
                <h2 id="employee-form-title">
                  {editingId !== null ? "Edit employee" : "Add employee"}
                </h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeForm}
                aria-label="Close form"
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="employee-form-grid">
                {editingId === null && (
                  <label>
                    Employee code *
                    <input
                      name="employee_code"
                      value={form.employee_code}
                      onChange={handleChange}
                      required
                      minLength={2}
                      maxLength={30}
                    />
                  </label>
                )}

                <label>
                  First name *
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Last name *
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Work email *
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={20}
                  />
                </label>

                <label>
                  Department *
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Designation *
                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Joining date *
                  <input
                    name="joining_date"
                    type="date"
                    value={form.joining_date}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Annual salary (â‚¹) *
                  <input
                    name="annual_salary"
                    type="number"
                    value={form.annual_salary}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100000000"
                    step="1"
                  />
                </label>
              </div>

              <div className="employee-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save changes"
                      : "Create employee"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

