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

function ExamModal({ open, mode, item, classes, modules, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isView = mode === "view";

  const [form, setForm] = useState({ title: "", classId: "", moduleId: "", date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");
    if (item && (isEdit || isView)) {
      setForm({
        title: item.title || "",
        classId: item.class?._id || "",
        moduleId: item.module?._id || "",
        date: item.date ? String(item.date).slice(0, 16) : "",
      });
    } else {
      setForm({ title: "", classId: "", moduleId: "", date: "" });
    }
  }, [open, item, isEdit, isView]);

  if (!open) return null;

  async function save() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        classId: form.classId,
        moduleId: form.moduleId,
        date: form.date,
      };
      if (isCreate) await api.post("/exams", payload);
      else if (isEdit && item) await api.put(`/exams/${item._id}`, payload);

      setSuccess("Saved successfully.");
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const title = isCreate ? "Add Exam" : isEdit ? "Edit Exam" : "View Exam";

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
              <div className="col-12">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  disabled={isView}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
                  required
                >
                  <option value="">Select class...</option>
                  {classes.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Module</label>
                <select
                  className="form-select"
                  disabled={isView}
                  value={form.moduleId}
                  onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
                  required
                >
                  <option value="">Select module...</option>
                  {modules.map((m) => (
                    <option value={m._id} key={m._id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Date & time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  disabled={isView}
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
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

export default function ExamsPage() {
  const [q, setQ] = useState("");
  const [classId, setClassId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-date");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "view", item: null });

  const queryParams = useMemo(() => {
    const params = { page, limit, sort };
    if (q.trim()) params.q = q.trim();
    if (classId) params.classId = classId;
    if (moduleId) params.moduleId = moduleId;
    return params;
  }, [q, classId, moduleId, page, limit, sort]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [{ data: examsData }, { data: classesData }, { data: modulesData }] = await Promise.all([
        api.get("/exams", { params: queryParams }),
        api.get("/classes", { params: { limit: 200, sort: "name" } }),
        api.get("/modules", { params: { limit: 200, sort: "code" } }),
      ]);
      setItems(examsData.items || []);
      setPages(examsData.pages || 1);
      setTotal(examsData.total || 0);
      setClasses(classesData.items || []);
      setModules(modulesData.items || []);
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
    const ok = window.confirm(`Delete exam "${item?.title || ""}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/exams/${item._id}`);
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
          <h3 className="mb-0">Exams</h3>
          <div className="text-muted small">Total: {total}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, mode: "create", item: null })}>
          Add exam
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-3">
              <input
                className="form-control"
                placeholder="Search by title..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                name="exam-search-query"
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
                value={moduleId}
                onChange={(e) => {
                  setModuleId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All modules</option>
                {modules.map((m) => (
                  <option value={m._id} key={m._id}>
                    {m.code}
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
            <div className="col-6 col-md-1 d-flex justify-content-end">
              <button className="btn btn-outline-primary w-100" onClick={load} disabled={loading}>
                ↻
              </button>
            </div>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading exams...</div> : null}

          {!loading && !items.length ? (
            <div className="alert alert-warning">No exams found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>
                      <SortHeader label="Title" field="title" sort={sort} setSort={setSort} />
                    </th>
                    <th>Module</th>
                    <th>Class</th>
                    <th>
                      <SortHeader label="Date" field="date" sort={sort} setSort={setSort} />
                    </th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => (
                    <tr key={e._id}>
                      <td className="fw-semibold">{e.title}</td>
                      <td>
                        {e.module ? (
                          <span>
                            {e.module.code} - {e.module.name}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>{e.class?.name || <span className="text-muted">—</span>}</td>
                      <td>{e.date ? new Date(e.date).toLocaleString() : <span className="text-muted">—</span>}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setModal({ open: true, mode: "view", item: e })}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setModal({ open: true, mode: "edit", item: e })}
                          >
                            Edit
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => onDelete(e)}>
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

      <ExamModal
        open={modal.open}
        mode={modal.mode}
        item={modal.item}
        classes={classes}
        modules={modules}
        onClose={() => setModal({ open: false, mode: "view", item: null })}
        onSaved={async () => {
          await load();
          setModal({ open: false, mode: "view", item: null });
        }}
      />
    </div>
  );
}

