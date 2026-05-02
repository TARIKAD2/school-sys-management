import React, { useEffect, useMemo, useState } from "react";
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

function ModuleModal({ open, mode, item, classes, teachers, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isView = mode === "view";

  const [form, setForm] = useState({ code: "", name: "", classId: "", teacherId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");
    if (item && (isEdit || isView)) {
      setForm({
        code: item.code || "",
        name: item.name || "",
        classId: item.class?._id || "",
        teacherId: item.teacher?._id || "",
      });
    } else {
      setForm({ code: "", name: "", classId: "", teacherId: "" });
    }
  }, [open, item, isEdit, isView]);

  if (!open) return null;

  async function save() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (isCreate) {
        await api.post("/modules", {
          code: form.code,
          name: form.name,
          classId: form.classId || undefined,
          teacherId: form.teacherId || undefined,
        });
      } else if (isEdit && item) {
        await api.put(`/modules/${item._id}`, {
          code: form.code,
          name: form.name,
          classId: form.classId || undefined,
          teacherId: form.teacherId || undefined,
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

  const title = isCreate ? "Add Module" : isEdit ? "Edit Module" : "View Module";

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
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Code</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  required
                  minLength={2}
                />
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
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
                  <option value="">(none)</option>
                  {classes.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Teacher</label>
                <select
                  className="form-select"
                  disabled={isView}
                  value={form.teacherId}
                  onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                >
                  <option value="">(none)</option>
                  {teachers.map((t) => (
                    <option value={t._id} key={t._id}>
                      {t.user?.name} ({t.teacherId})
                    </option>
                  ))}
                </select>
              </div>
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

export default function ModulesPage() {
  const [q, setQ] = useState("");
  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("code");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "view", item: null });

  const queryParams = useMemo(() => {
    const params = { page, limit, sort };
    if (q.trim()) params.q = q.trim();
    if (classId) params.classId = classId;
    if (teacherId) params.teacherId = teacherId;
    return params;
  }, [q, classId, teacherId, page, limit, sort]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [{ data: modulesData }, { data: classesData }, { data: teachersData }] = await Promise.all([
        api.get("/modules", { params: queryParams }),
        api.get("/classes", { params: { limit: 200, sort: "name" } }),
        api.get("/teachers", { params: { limit: 200, sort: "name" } }),
      ]);
      setItems(modulesData.items || []);
      setPages(modulesData.pages || 1);
      setTotal(modulesData.total || 0);
      setClasses(classesData.items || []);
      setTeachers(teachersData.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  async function onDelete(item) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete module ${item?.code || ""}? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/modules/${item._id}`);
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
          <h3 className="mb-0">Modules</h3>
          <div className="text-muted small">Total: {total}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, mode: "create", item: null })}>
          Add module
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Search by module code or name..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                name="module-search-query"
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
            <div className="col-12 col-md-3">
              <select
                className="form-select"
                value={teacherId}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All teachers</option>
                {teachers.map((t) => (
                  <option value={t._id} key={t._id}>
                    {t.user?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-1">
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
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-1 d-flex justify-content-end">
              <button className="btn btn-outline-primary w-100" onClick={load} disabled={loading}>
                ↻
              </button>
            </div>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading modules...</div> : null}

          {!loading && !items.length ? (
            <div className="alert alert-warning">No modules found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>
                      <SortHeader label="Code" field="code" sort={sort} setSort={setSort} />
                    </th>
                    <th>
                      <SortHeader label="Name" field="name" sort={sort} setSort={setSort} />
                    </th>
                    <th>Class</th>
                    <th>Teacher</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m._id}>
                      <td className="fw-semibold">{m.code}</td>
                      <td>{m.name}</td>
                      <td>{m.class?.name || <span className="text-muted">—</span>}</td>
                      <td>{m.teacher?.user?.name || <span className="text-muted">—</span>}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setModal({ open: true, mode: "view", item: m })}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setModal({ open: true, mode: "edit", item: m })}
                          >
                            Edit
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => onDelete(m)}>
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

      <ModuleModal
        open={modal.open}
        mode={modal.mode}
        item={modal.item}
        classes={classes}
        teachers={teachers}
        onClose={() => setModal({ open: false, mode: "view", item: null })}
        onSaved={async () => {
          await load();
          setModal({ open: false, mode: "view", item: null });
        }}
      />
    </div>
  );
}

