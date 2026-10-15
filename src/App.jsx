
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const sampleEmployees = [
  { id: 101, name: "Aryan Sharma", email: "aryan@example.com", department: "Engineering", position: "Frontend Developer", salary: 45000 },
  { id: 102, name: "Vicky Chauhan", email: "vicky@example.com", department: "Design", position: "UI Designer", salary: 40000 },
  { id: 103, name: "Aditya Verma", email: "aditya@example.com", department: "Marketing", position: "Marketing Executive", salary: 35000 },
];

const emptyForm = {
  name: "",
  email: "",
  department: "Engineering",
  position: "",
  salary: "",
};

function EmployeeForm({ onSave, editingEmployee, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingEmployee) {
      setForm({
        name: editingEmployee.name,
        email: editingEmployee.email,
        department: editingEmployee.department,
        position: editingEmployee.position,
        salary: String(editingEmployee.salary),
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingEmployee]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      ...form,
      salary: Number(form.salary),
    });

    setForm(emptyForm);
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Full Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter employee name"
            required
            maxLength={60}
          />
        </label>

        <label>
          Email Address
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="employee@example.com"
            required
          />
        </label>

        <label>
          Department
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
          >
            <option>Engineering</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>Human Resources</option>
            <option>Finance</option>
            <option>Sales</option>
          </select>
        </label>

        <label>
          Job Position
          <input
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="e.g. Software Developer"
            required
            maxLength={60}
          />
        </label>

        <label className="salary-field">
          Monthly Salary (₹)
          <input
            type="number"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            placeholder="e.g. 45000"
            min="1"
            max="100000000"
            step="1"
            required
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-btn" type="submit">
          {editingEmployee ? "✓ Save Changes" : "+ Add Employee"}
        </button>

        {editingEmployee && (
          <button
            className="secondary-btn"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function EmployeeTable({ employees, onEdit, onDelete }) {
  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⌕</div>
        <h3>No employees found</h3>
        <p>Try another search or add a new employee to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>EMPLOYEE</th>
            <th>DEPARTMENT</th>
            <th>POSITION</th>
            <th>MONTHLY SALARY</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <div className="employee-identity">
                  <div className="avatar">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{employee.name}</strong>
                    <span className="email">{employee.email}</span>
                  </div>
                </div>
              </td>

              <td>
                <span className="department-tag">{employee.department}</span>
              </td>

              <td>{employee.position}</td>

              <td className="salary">
                ₹{Number(employee.salary).toLocaleString("en-IN")}
              </td>

              <td>
                <div className="row-actions">
                  <button
                    className="edit-btn"
                    onClick={() => onEdit(employee)}
                    aria-label={`Edit ${employee.name}`}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(employee.id)}
                    aria-label={`Delete ${employee.name}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [dataSource, setDataSource] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load employees");
        }

        const users = await response.json();

        const formattedEmployees = users.map((user, index) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          department: [
            "Engineering",
            "Design",
            "Marketing",
            "Finance",
            "Sales",
          ][index % 5],
          position: user.company?.bs || "Team Associate",
          salary: 30000 + index * 2500,
        }));

        if (!cancelled) {
          setEmployees(formattedEmployees);
          setDataSource("api");
        }
      } catch {
        if (!cancelled) {
          setEmployees(sampleEmployees);
          setDataSource("sample");
          setNotice("API unavailable. Sample employee data is displayed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const query = search.toLowerCase();

    return (
      employee.name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.department.toLowerCase().includes(query)
    );
  });

  const handleSave = (employeeData) => {
    if (editingEmployee) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingEmployee.id
            ? { ...employee, ...employeeData }
            : employee
        )
      );
      setNotice("Employee details updated successfully.");
      setEditingEmployee(null);
    } else {
      const newEmployee = {
        ...employeeData,
        id: Date.now(),
      };

      setEmployees((previous) => [newEmployee, ...previous]);
      setNotice("New employee added successfully.");
    }
  };

  const handleDelete = (id) => {
    const employee = employees.find((item) => item.id === id);
    if (!employee) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) return;

    setEmployees((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingEmployee?.id === id) {
      setEditingEmployee(null);
    }

    setNotice("Employee deleted successfully.");
  };

  const startEditing = (employee) => {
    setEditingEmployee({ ...employee });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="brand">
          <div className="brand-logo">E</div>
          <div>
            <span className="brand-name">Employ<span>IQ</span></span>
            <small>WORKFORCE MANAGEMENT</small>
          </div>
        </div>

        <div className="admin-profile">
          <div className="online-dot"></div>
          <span>Admin Dashboard</span>
          <div className="admin-avatar">A</div>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">OVERVIEW / EMPLOYEES</p>
            <h1>Employee Management</h1>
            <p className="welcome-text">
              Manage your team, update employee records, and keep everything
              organized in one place.
            </p>
          </div>

          <div className="welcome-icon">✦</div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">♙</div>
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
            <small>Current employee records</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">▦</div>
            <span>Departments</span>
            <strong>{new Set(employees.map((e) => e.department)).size}</strong>
            <small>Departments represented</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">₹</div>
            <span>Monthly Payroll</span>
            <strong>
              ₹{employees
                .reduce((total, employee) => total + Number(employee.salary), 0)
                .toLocaleString("en-IN")}
            </strong>
            <small>Combined listed salaries</small>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div className="heading-icon">＋</div>
              <div>
                <h2>{editingEmployee ? "Edit Employee" : "Add Employee"}</h2>
                <p>
                  {editingEmployee
                    ? "Update the selected employee's details."
                    : "Enter the details to register a new team member."}
                </p>
              </div>
            </div>

            <EmployeeForm
              key={editingEmployee?.id ?? "new-employee"}
              onSave={handleSave}
              editingEmployee={editingEmployee}
              onCancel={() => setEditingEmployee(null)}
            />
          </div>

          <div className="panel tip-panel">
            <div className="tip-symbol">✧</div>
            <p className="tip-label">QUICK TIP</p>
            <h3>Your team, your way.</h3>
            <p>
              Use the Edit button to update employee details or Delete to
              remove a record from this dashboard.
            </p>
            <div className="tip-footer">
              <span className="tip-dot"></span>
              Changes update the current session
            </div>
          </div>
        </section>

        <section className="panel directory-panel">
          <div className="directory-header">
            <div>
              <p className="eyebrow">YOUR WORKFORCE</p>
              <h2>Employee Directory</h2>
              <p className="directory-subtitle">
                Browse and manage your employee records.
              </p>
            </div>

            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search employees..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          {notice && (
            <div className="notice" role="status">
              <span>✓</span> {notice}
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {dataSource === "sample" && (
            <p className="api-note">
              Showing sample data because the API could not be reached.
            </p>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading employee records from API...</p>
            </div>
          ) : (
            <EmployeeTable
              employees={filteredEmployees}
              onEdit={startEditing}
              onDelete={handleDelete}
            />
          )}

          <div className="directory-footer">
            <span>
              Showing <strong>{filteredEmployees.length}</strong> of{" "}
              <strong>{employees.length}</strong> employees
            </span>
            <span className="api-status">
              <span className="status-dot"></span>
              {dataSource === "api" ? "API Connected" : "Local Sample Data"}
            </span>
          </div>
        </section>

        <footer className="page-footer">
          <span>EmployIQ · Employee Management System</span>
          <span>React CRUD Practical</span>
        </footer>
      </main>
    </div>
  );
}
