import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

function sortToggle(current, field) {
  if (current === field) return `-${field}`;
  if (current === `-${field}`) return field;
  return field;
}

function SortHeader({ label, field, sort, setSort }) {
  const active = sort === field || sort === `-${field}`;
  const dir = sort === `-${field}` ? "desc" : "asc";
  return (
    <button
      type="button"
      className="btn btn-link p-0 text-decoration-none"
      onClick={() => setSort(sortToggle(sort, field))}
    >
      {label} {active ? <span className="text-muted small">({dir})</span> : null}
    </button>
  );
}

function StudentModal({ open, mode, student, classes, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isView = mode === "view";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    classId: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    isActive: true,
    discountType: "none",
    discountValue: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");
    if (student && (isEdit || isView)) {
      setForm({
        name: student.user?.name || "",
        email: student.user?.email || "",
        password: "",
        studentId: student.studentId || "",
        classId: student.class?._id || "",
        phone: student.phone || "",
        address: student.address || "",
        dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : "",
        isActive: student.user?.isActive ?? true,
        discountType: student.discountType || "none",
        discountValue: student.discountValue || 0,
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        studentId: "",
        classId: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        isActive: true,
        discountType: "none",
        discountValue: 0,
      });
    }
  }, [open, student, isEdit, isView]);

  if (!open) return null;

  async function save() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (isCreate) {
        if (!form.password || form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        await api.post("/students", {
          name: form.name,
          email: form.email,
          password: form.password,
          studentId: form.studentId,
          classId: form.classId || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
        });
      } else if (isEdit && student) {
        await api.put(`/students/${student._id}`, {
          name: form.name,
          email: form.email,
          studentId: form.studentId,
          classId: form.classId || null,
          phone: form.phone || null,
          address: form.address || null,
          dateOfBirth: form.dateOfBirth || null,
          isActive: !!form.isActive,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
        });
      }
      setSuccess("Saved successfully.");
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const title = isCreate ? "Add Student" : isEdit ? "Edit Student" : "View Student";

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error ? <div className="alert alert-danger">{error}</div> : null}
            {success ? <div className="alert alert-success">{success}</div> : null}

            {/* Hidden decoy fields to catch browser auto-fill */}
            <div style={{ height: 0, overflow: "hidden", opacity: 0 }}>
              <input type="text" name="fake_email_autofill" tabIndex="-1" />
              <input type="password" name="fake_password_autofill" tabIndex="-1" />
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
                  name="student-name-field"
                  autoComplete="off"
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  disabled={isView}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  name="student-email-field"
                  autoComplete="chrome-off"
                />
              </div>
              {isCreate ? (
                <div className="col-12 col-md-6">
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    disabled={isView}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                    name="student-new-password"
                    autoComplete="new-password"
                  />
                </div>
              ) : null}
              <div className="col-12 col-md-6">
                <label className="form-label">Student ID</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.studentId}
                  onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Class</label>
                <select
                  className="form-select"
                  disabled={isView}
                  value={form.classId}
                  onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                >
                  <option value="">(not assigned)</option>
                  {classes.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name} {c.academicYear ? `(${c.academicYear})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Date of birth</label>
                <input
                  className="form-control"
                  type="date"
                  disabled={isView}
                  value={form.dateOfBirth}
                  onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label">Address</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>

              <div className="col-12">
                <div className="card bg-light border-0">
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-2">Scholarship / Discount Settings</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="small text-muted mb-1">Benefit Type</label>
                        <select
                          className="form-select form-select-sm"
                          disabled={isView}
                          value={form.discountType}
                          onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                        >
                          <option value="none">Regular (No Discount)</option>
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                      {form.discountType !== "none" && (
                        <div className="col-md-6">
                          <label className="small text-muted mb-1">Benefit Value</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            disabled={isView}
                            value={form.discountValue}
                            onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isEdit ? (
                <div className="col-12 mt-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="active"
                      disabled={isView}
                      checked={!!form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="active">
                      Active account
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Close
            </button>
            {!isView ? (
              <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [q, setQ] = useState("");
  const [classId, setClassId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-createdAt");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [classes, setClasses] = useState([]);

  const [modal, setModal] = useState({ open: false, mode: "view", student: null });

  const queryParams = useMemo(() => {
    const params = { page, limit, sort };
    if (q.trim()) params.q = q.trim();
    if (classId) params.classId = classId;
    return params;
  }, [q, classId, page, limit, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: studentsData }, { data: classesData }] = await Promise.all([
        api.get("/students", { params: queryParams }),
        api.get("/classes", { params: { limit: 200, sort: "name" } }),
      ]);
      setItems(studentsData.items || []);
      setPages(studentsData.pages || 1);
      setTotal(studentsData.total || 0);
      setClasses(classesData.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(student) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete student ${student?.user?.name || ""}? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/students/${student._id}`);
      await load();
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert(err?.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Students</h3>
          <div className="text-muted small">Total: {total}</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ open: true, mode: "create", student: null })}
        >
          Add student
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Search by name, email, studentId..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                name="student-search-query"
                autoComplete="off"
              />
            </div>
            <div className="col-12 col-md-3">
              <select
                className="form-select"
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option value={c._id} key={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option value={n} key={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3 d-flex gap-2 justify-content-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setQ("");
                  setClassId("");
                  setPage(1);
                  setSort("-createdAt");
                }}
              >
                Reset
              </button>
              <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading students...</div> : null}

          {!loading && !items.length ? (
            <div className="alert alert-warning">No students found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>
                      <SortHeader label="Name" field="name" sort={sort} setSort={setSort} />
                    </th>
                    <th>
                      <SortHeader label="Email" field="email" sort={sort} setSort={setSort} />
                    </th>
                    <th>
                      <SortHeader label="Student ID" field="studentId" sort={sort} setSort={setSort} />
                    </th>
                    <th>Class</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s._id}>
                      <td className="fw-semibold">{s.user?.name}</td>
                      <td>{s.user?.email}</td>
                      <td>{s.studentId}</td>
                      <td>{s.class?.name || <span className="text-muted">—</span>}</td>
                      <td>
                        {s.user?.isActive ? (
                          <span className="badge text-bg-success">Active</span>
                        ) : (
                          <span className="badge text-bg-secondary">Disabled</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setModal({ open: true, mode: "view", student: s })}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setModal({ open: true, mode: "edit", student: s })}
                          >
                            Edit
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => onDelete(s)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PaginationBar
            page={page}
            pages={pages}
            onPage={(p) => {
              setPage(p);
            }}
          />
        </div>
      </div>

      <StudentModal
        open={modal.open}
        mode={modal.mode}
        student={modal.student}
        classes={classes}
        onClose={() => setModal({ open: false, mode: "view", student: null })}
        onSaved={async () => {
          await load();
          setModal({ open: false, mode: "view", student: null });
        }}
      />
    </div>
  );
}

