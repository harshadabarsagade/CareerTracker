
import { useEffect, useState } from "react";
import "./App.css";

const API = "https://harshadabarsagade-careertracker.onrender.com/api/internships";

const initialForm = {
  companyName: "",
  role: "",
  location: "",
  workMode: "Remote",
  stipend: "",
  applicationLink: "",
  status: "Applied",
  appliedDate: "",
  interviewDate: "",
  notes: "",
};

function dateForInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Not set";

  const dateString = String(value);
  const datePart = dateString.slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [year, month, day] = datePart.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function App() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ ...initialForm });

  // FETCH INTERNSHIPS
  async function fetchInternships() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Failed to fetch internships.");
      }

      const data = await response.json();
      setInternships(data.internships || []);
    } catch (err) {
      setError(
        "Could not connect to backend. Please check whether the server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInternships();
  }, []);

  // HANDLE NORMAL FORM FIELDS
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // HANDLE STIPEND: ALLOW DIGITS ONLY
  function handleStipendChange(e) {
    const value = e.target.value;

    if (/^\d*$/.test(value)) {
      setForm((previous) => ({
        ...previous,
        stipend: value,
      }));
    }
  }

  // OPEN ADD FORM
  function openAddForm() {
    setEditingId(null);
    setForm({ ...initialForm });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  // EDIT EXISTING INTERNSHIP
  function handleEdit(item) {
    setEditingId(item._id);

    setForm({
      companyName: item.companyName || "",
      role: item.role || "",
      location: item.location || "",
      workMode: item.workMode || "Remote",
      stipend: String(item.stipend ?? ""),
      applicationLink: item.applicationLink || "",
      status: item.status || "Applied",
      appliedDate: dateForInput(item.appliedDate),
      interviewDate: dateForInput(item.interviewDate),
      notes: item.notes || "",
    });

    setError("");
    setMessage("");
    setShowForm(true);

    setTimeout(() => {
      document
        .getElementById("internship-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  // CLOSE FORM
  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...initialForm });
    setError("");
  }

  // ADD OR UPDATE INTERNSHIP
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.companyName.trim() || !form.role.trim()) {
      setError("Company name and role are required.");
      return;
    }

    if (
      form.stipend !== "" &&
      (!Number.isFinite(Number(form.stipend)) ||
        Number(form.stipend) < 0)
    ) {
      setError("Please enter a valid stipend amount.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        companyName: form.companyName.trim(),
        role: form.role.trim(),
        location: form.location.trim(),
        workMode: form.workMode,
        stipend: Number(form.stipend || 0),
        applicationLink: form.applicationLink.trim(),
        status: form.status,
        appliedDate: form.appliedDate || undefined,
        interviewDate: form.interviewDate || null,
        notes: form.notes.trim(),
      };

      const isEditing = Boolean(editingId);
      const url = isEditing ? `${API}/${editingId}` : API;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to save internship.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...initialForm });

      setMessage(
        isEditing
          ? "Internship updated successfully!"
          : "Internship added successfully!"
      );

      await fetchInternships();
    } catch (err) {
      setError(err.message || "Could not save internship.");
    } finally {
      setSaving(false);
    }
  }

  // DELETE INTERNSHIP
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this internship?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete internship.");
      }

      setInternships((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setMessage("Internship deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete internship.");
    }
  }

  // DASHBOARD COUNTS
  const interviewCount = internships.filter(
    (item) => item.status === "Interview"
  ).length;

  const offerCount = internships.filter(
    (item) => item.status === "Offer"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">CareerTrack</h2>

        <nav>
          <a className="active" href="#dashboard">
            Dashboard
          </a>

          <a href="#internships">My Internships</a>
        </nav>

        <p className="sidebar-note">
          Your career journey starts here.
        </p>
      </aside>

      <main className="main">
        {/* HEADER */}
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR CAREER SPACE</p>
            <h1>Internship Dashboard</h1>

            <p className="subtitle">
              Keep track of your applications in one place.
            </p>
          </div>

          <div className="avatar">H</div>
        </header>

        {/* STATISTICS */}
        <section className="stats" id="dashboard">
          <div className="stat-card">
            <p>Total Applications</p>
            <h2>{internships.length}</h2>
          </div>

          <div className="stat-card">
            <p>Interviews</p>
            <h2>{interviewCount}</h2>
          </div>

          <div className="stat-card">
            <p>Offers</p>
            <h2>{offerCount}</h2>
          </div>
        </section>

        {/* MY INTERNSHIPS */}
        <section className="applications" id="internships">
          <div className="section-heading">
            <div>
              <h2>My Applications</h2>
              <p>All your saved internship opportunities.</p>
            </div>

            <button
              className="add-internship-btn"
              type="button"
              onClick={openAddForm}
            >
              + Add Internship
            </button>

            <span className="count">
              {internships.length} total
            </span>
          </div>

          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="message success" role="status">
              {message}
            </p>
          )}

          {/* ADD / EDIT FORM */}
          {showForm && (
            <form
              id="internship-form"
              className="internship-form"
              onSubmit={handleSubmit}
            >
              <h3>
                {editingId ? "Edit Internship" : "Add New Internship"}
              </h3>

              <div className="form-grid">
                <label>
                  Company Name *
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Google"
                    required
                  />
                </label>

                <label>
                  Job Role *
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g. Backend Developer Intern"
                    required
                  />
                </label>

                <label>
                  Location
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Pune or India"
                  />
                </label>

                <label>
                  Work Mode
                  <select
                    name="workMode"
                    value={form.workMode}
                    onChange={handleChange}
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>


                <label>
                  Monthly Stipend (₹)
                  <input
                    type="text"
                    name="stipend"
                    value={form.stipend}
                    onChange={handleChange}
                    placeholder="e.g. 25000"
                    autoComplete="off"
                  />
                </label>


                <label>
                  Application Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </label>

                <label>
                  Applied Date
                  <input
                    type="date"
                    name="appliedDate"
                    value={form.appliedDate}
                    onChange={handleChange}
                    onClick={(e) => {
                      if (e.currentTarget.showPicker) {
                        try {
                          e.currentTarget.showPicker();
                        } catch {

                        }
                      }
                    }}
                  />
                </label>

                <label>
                  Interview Date
                  <input
                    type="date"
                    name="interviewDate"
                    value={form.interviewDate}
                    onChange={handleChange}
                    onClick={(e) => {
                      if (e.currentTarget.showPicker) {
                        try {
                          e.currentTarget.showPicker();
                        } catch {
                          // Browser may open its own date picker.
                        }
                      }
                    }}
                  />
                </label>


                <label className="full-width">
                  Application Link
                  <input
                    type="url"
                    name="applicationLink"
                    value={form.applicationLink}
                    onChange={handleChange}
                    placeholder="https://company.com/careers"
                  />
                </label>

                <label className="full-width">
                  Notes
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Add interview details or reminders..."
                    rows="3"
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Internship"
                      : "Save Internship"}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* LOADING AND EMPTY STATE */}
          {loading && (
            <p className="message">Loading internships...</p>
          )}

          {!loading && !error && internships.length === 0 && (
            <div className="empty-state">
              <h3>No internships yet</h3>
              <p>
                Click Add Internship to save your first opportunity.
              </p>
            </div>
          )}

          {/* INTERNSHIP CARDS */}
          {!loading && internships.length > 0 && (
            <div className="internship-list">
              {internships.map((item) => (
                <article className="internship-card" key={item._id}>
                  <div className="company-icon">
                    {item.companyName?.charAt(0).toUpperCase() || "I"}
                  </div>

                  <div className="internship-info">
                    <h3>{item.role}</h3>
                    <p className="company-name">{item.companyName}</p>

                    <div className="details">
                      <span>
                        {item.location || "Location not specified"}
                      </span>

                      <span>{item.workMode || "Remote"}</span>

                      <span>
                        {item.stipend > 0
                          ? `₹${Number(item.stipend).toLocaleString("en-IN")}/month`
                          : "Stipend not specified"}
                      </span>
                    </div>

                    {/* BOTH DATES ALWAYS DISPLAY */}
                    <div className="date-info">
                      <p>
                        <strong>Applied Date:</strong>{" "}
                        {formatDate(item.appliedDate)}
                      </p>

                      <p>
                        <strong>Interview Date:</strong>{" "}
                        {formatDate(item.interviewDate)}
                      </p>
                    </div>

                    {item.notes && (
                      <p className="internship-notes">
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}

                    {item.applicationLink && (
                      <a
                        className="application-link"
                        href={item.applicationLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Application ↗
                      </a>
                    )}
                  </div>

                  <div className="internship-actions">
                    <span
                      className={`status status-${(
                        item.status || "Applied"
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {item.status || "Applied"}
                    </span>

                    <button
                      type="button"
                      className="edit-internship-btn"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-internship-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
