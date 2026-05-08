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

function TeacherModal({ open, mode, teacher, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isView = mode === "view";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    teacherId: "",
    department: "",
    phone: "",
    isActive: true,
    assignedClasses: [],
    assignedModules: [],
  });
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    async function loadData() {
      try {
        const [{ data: cData }, { data: mData }] = await Promise.all([
          api.get("/classes?limit=500"),
          api.get("/modules?limit=500"),
        ]);
        setClasses(cData.items || []);
        setModules(mData.items || []);
      } catch (err) {
        console.error("Failed to load assignment options");
      }
    }
    loadData();
    setError("");
    setSuccess("");
    if (teacher && (isEdit || isView)) {
      setForm({
        name: teacher.user?.name || "",
        email: teacher.user?.email || "",
        password: "",
        teacherId: teacher.teacherId || "",
        department: teacher.department || "",
        phone: teacher.phone || "",
        isActive: teacher.user?.isActive ?? true,
        assignedClasses: (teacher.assignedClasses || []).map(c => c._id || c),
        assignedModules: (teacher.assignedModules || []).map(m => m._id || m),
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        teacherId: "",
        department: "",
        phone: "",
        isActive: true,
        assignedClasses: [],
        assignedModules: [],
      });
    }
  }, [open, teacher, isEdit, isView]);

  if (!open) return null;

  async function save() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        teacherId: form.teacherId,
        department: form.department || undefined,
        phone: form.phone || undefined,
        assignedClasses: form.assignedClasses,
        assignedModules: form.assignedModules,
      };

      if (isCreate) {
        if (!form.password || form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        payload.password = form.password;
        await api.post("/teachers", payload);
      } else if (isEdit && teacher) {
        payload.isActive = !!form.isActive;
        await api.put(`/teachers/${teacher._id}`, payload);
      }
      setSuccess("Saved successfully.");
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const toggleItem = (field, id) => {
    setForm(f => {
      const list = [...f[field]];
      const idx = list.indexOf(id);
      if (idx > -1) list.splice(idx, 1);
      else list.push(id);
      return { ...f, [field]: list };
    });
  };

  const title = isCreate ? "Add Teacher" : isEdit ? "Edit Teacher" : "View Teacher";

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 p-4">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body p-4 pt-0">
            {error ? <div className="alert alert-danger rounded-3">{error}</div> : null}
            {success ? <div className="alert alert-success rounded-3">{success}</div> : null}

            {/* Hidden decoy fields to catch browser auto-fill */}
            <div style={{ height: 0, overflow: "hidden", opacity: 0 }}>
              <input type="text" name="fake_email_autofill_teacher" tabIndex="-1" />
              <input type="password" name="fake_password_autofill_teacher" tabIndex="-1" />
            </div>

            <div className="row g-4">
              <div className="col-lg-6">
                <h6 className="fw-bold mb-3">Basic Information</h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-muted fw-bold">Name</label>
                    <input className="form-control" disabled={isView} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required name="teacher-name-field" autoComplete="off" />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-muted fw-bold">Email</label>
                    <input className="form-control" type="email" disabled={isView} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required name="teacher-email-field" autoComplete="chrome-off" />
                  </div>
                  {isCreate && (
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-muted fw-bold">Password</label>
                      <input className="form-control" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required name="teacher-new-password" autoComplete="new-password" />
                    </div>
                  )}
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-muted fw-bold">Teacher ID</label>
                    <input className="form-control" disabled={isView} value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))} required />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-muted fw-bold">Department</label>
                    <input className="form-control" disabled={isView} value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-muted fw-bold">Phone</label>
                    <input className="form-control" disabled={isView} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  {isEdit && (
                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="activeTeacher" checked={!!form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                        <label className="form-check-label" htmlFor="activeTeacher">Active account</label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-6">
                <h6 className="fw-bold mb-3">RBAC Assignments</h6>
                <div className="row g-3">
                  <div className="col-12">
                     <label className="form-label small text-muted fw-bold">Assigned Classes</label>
                     <div className="border rounded-3 p-2 bg-light bg-opacity-50" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {classes.map(c => (
                          <div key={c._id} className="form-check mb-1">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`cls-${c._id}`} 
                              disabled={isView}
                              checked={form.assignedClasses.includes(c._id)}
                              onChange={() => toggleItem('assignedClasses', c._id)}
                            />
                            <label className="form-check-label small" htmlFor={`cls-${c._id}`}>{c.name}</label>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="col-12">
                     <label className="form-label small text-muted fw-bold">Assigned Modules</label>
                     <div className="border rounded-3 p-2 bg-light bg-opacity-50" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {modules.map(m => (
                          <div key={m._id} className="form-check mb-1">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`mod-${m._id}`} 
                              disabled={isView}
                              checked={form.assignedModules.includes(m._id)}
                              onChange={() => toggleItem('assignedModules', m._id)}
                            />
                            <label className="form-check-label small" htmlFor={`mod-${m._id}`}>[{m.code}] {m.name}</label>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 p-4 pt-0">
            <button type="button" className="btn btn-light px-4 rounded-pill fw-semibold" onClick={onClose} disabled={saving}>Close</button>
            {!isView && (
              <button type="button" className="btn btn-primary px-4 rounded-pill fw-semibold shadow-sm" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save Teacher"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeachersPage() {
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-createdAt");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);

  const [modal, setModal] = useState({ open: false, mode: "view", teacher: null });

  const queryParams = useMemo(() => {
    const params = { page, limit, sort };
    if (q.trim()) params.q = q.trim();
    if (department) params.department = department;
    return params;
  }, [q, department, page, limit, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/teachers", { params: queryParams });
      const fetched = data.items || [];
      setItems(fetched);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      // Collect unique departments for the filter dropdown
      setDepartments((prev) => {
        const all = new Set([...prev]);
        fetched.forEach((t) => { if (t.department) all.add(t.department); });
        return [...all].sort();
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(teacher) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete teacher ${teacher?.user?.name || ""}? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/teachers/${teacher._id}`);
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
          <h3 className="mb-0">Teachers</h3>
          <div className="text-muted small">Total: {total}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, mode: "create", teacher: null })}>
          Add teacher
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Search by name, email, teacherId..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                name="teacher-search-query"
                autoComplete="off"
              />
            </div>
            <div className="col-12 col-md-3">
              <select
                className="form-select"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
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
                  setDepartment("");
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
          {loading ? <div className="alert alert-info">Loading teachers...</div> : null}

          {!loading && !items.length ? (
            <div className="alert alert-warning">No teachers found.</div>
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
                      <SortHeader label="Teacher ID" field="teacherId" sort={sort} setSort={setSort} />
                    </th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => (
                    <tr key={t._id}>
                      <td className="fw-semibold">{t.user?.name}</td>
                      <td>{t.user?.email}</td>
                      <td>{t.teacherId}</td>
                      <td>{t.department || <span className="text-muted">—</span>}</td>
                      <td>{t.phone || <span className="text-muted">—</span>}</td>
                      <td>
                        {t.user?.isActive ? (
                          <span className="badge text-bg-success">Active</span>
                        ) : (
                          <span className="badge text-bg-secondary">Disabled</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setModal({ open: true, mode: "view", teacher: t })}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setModal({ open: true, mode: "edit", teacher: t })}
                          >
                            Edit
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => onDelete(t)}>
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

          <PaginationBar page={page} pages={pages} onPage={(p) => setPage(p)} />
        </div>
      </div>

      <TeacherModal
        open={modal.open}
        mode={modal.mode}
        teacher={modal.teacher}
        onClose={() => setModal({ open: false, mode: "view", teacher: null })}
        onSaved={async () => {
          await load();
          setModal({ open: false, mode: "view", teacher: null });
        }}
      />
    </div>
  );
}
