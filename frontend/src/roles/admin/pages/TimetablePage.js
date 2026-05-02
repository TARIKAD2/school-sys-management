import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function EntryModal({ open, mode, item, classes, modules, teachers, onClose, onSaved }) {
  const isView = mode === "view";
  const [form, setForm] = useState({
    classId: "",
    moduleId: "",
    teacherId: "",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "09:00",
    room: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        classId: item.class?._id || "",
        moduleId: item.module?._id || "",
        teacherId: item.teacher?._id || "",
        dayOfWeek: item.dayOfWeek ?? 1,
        startTime: item.startTime || "08:00",
        endTime: item.endTime || "09:00",
        room: item.room || "",
      });
    }
  }, [open, item]);

  if (!open) return null;
  async function save() {
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, dayOfWeek: Number(form.dayOfWeek) };
      if (mode === "create") await api.post("/timetable", payload);
      if (mode === "edit") await api.put(`/timetable/${item._id}`, payload);
      onSaved();
    } catch (e) {
      setError(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{mode === "create" ? "Add Entry" : mode === "edit" ? "Edit Entry" : "View Entry"}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error ? <div className="alert alert-danger">{error}</div> : null}
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">Class</label>
                <select className="form-select" value={form.classId} disabled={isView} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}>
                  <option value="">Select...</option>
                  {classes.map((c) => <option value={c._id} key={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Module</label>
                <select className="form-select" value={form.moduleId} disabled={isView} onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}>
                  <option value="">Select...</option>
                  {modules.map((m) => <option value={m._id} key={m._id}>{m.code} - {m.name}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Day</label>
                <select className="form-select" value={form.dayOfWeek} disabled={isView} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}>
                  {DAYS.map((d, i) => <option value={i} key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Start</label>
                <input type="time" className="form-control" value={form.startTime} disabled={isView} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div className="col-md-4">
                <label className="form-label">End</label>
                <input type="time" className="form-control" value={form.endTime} disabled={isView} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teacher</label>
                <select className="form-select" value={form.teacherId} disabled={isView} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}>
                  <option value="">(none)</option>
                  {teachers.map((t) => <option value={t._id} key={t._id}>{t.user?.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Room</label>
                <input className="form-control" value={form.room} disabled={isView} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            {!isView ? <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</button> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimetablePage() {
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "view", item: null });

  const params = useMemo(() => ({ page, limit, sort: "dayOfWeek,startTime" }), [page, limit]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [{ data: tt }, { data: cls }, { data: mods }, { data: tchs }] = await Promise.all([
        api.get("/timetable", { params }),
        api.get("/classes", { params: { limit: 300, sort: "name" } }),
        api.get("/modules", { params: { limit: 300, sort: "code" } }),
        api.get("/teachers", { params: { limit: 300, sort: "name" } }),
      ]);
      setItems(tt.items || []);
      setPages(tt.pages || 1);
      setTotal(tt.total || 0);
      setClasses(cls.items || []);
      setModules(mods.items || []);
      setTeachers(tchs.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [params]); // eslint-disable-line

  async function onDelete(id) {
    if (!window.confirm("Delete this timetable entry?")) return; // eslint-disable-line
    await api.delete(`/timetable/${id}`);
    await load();
  }

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <div><h3 className="mb-0">Timetable</h3><div className="text-muted small">Total: {total}</div></div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, mode: "create", item: null })}>Add entry</button>
      </div>
      <div className="card shadow-sm"><div className="card-body">
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <select className="form-select" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              {[5, 10, 20].map((n) => <option value={n} key={n}>{n} / page</option>)}
            </select>
          </div>
          <div className="col-6 col-md-9 d-flex justify-content-end"><button className="btn btn-outline-primary" onClick={load}>Refresh</button></div>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="alert alert-info">Loading...</div> : null}
        {!loading && !items.length ? <div className="alert alert-warning">No entries found.</div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead><tr><th>Day</th><th>Time</th><th>Class</th><th>Module</th><th>Teacher</th><th>Room</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {items.map((i) => <tr key={i._id}>
                  <td>{DAYS[i.dayOfWeek] || i.dayOfWeek}</td>
                  <td>{i.startTime} - {i.endTime}</td>
                  <td>{i.class?.name}</td>
                  <td>{i.module?.code}</td>
                  <td>{i.teacher?.user?.name || <span className="text-muted">—</span>}</td>
                  <td>{i.room || <span className="text-muted">—</span>}</td>
                  <td className="text-end"><div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-secondary" onClick={() => setModal({ open: true, mode: "view", item: i })}>View</button>
                    <button className="btn btn-outline-primary" onClick={() => setModal({ open: true, mode: "edit", item: i })}>Edit</button>
                    <button className="btn btn-outline-danger" onClick={() => onDelete(i._id)}>Delete</button>
                  </div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
        <PaginationBar page={page} pages={pages} onPage={setPage} />
      </div></div>
      <EntryModal open={modal.open} mode={modal.mode} item={modal.item} classes={classes} modules={modules} teachers={teachers}
        onClose={() => setModal({ open: false, mode: "view", item: null })}
        onSaved={async () => { await load(); setModal({ open: false, mode: "view", item: null }); }} />
    </div>
  );
}

