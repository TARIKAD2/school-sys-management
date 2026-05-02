import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

function ReportModal({ open, mode, item, onClose, onSaved }) {
  const isView = mode === "view";
  const [form, setForm] = useState({ title: "", type: "general", periodStart: "", periodEnd: "", summary: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        title: item.title || "",
        type: item.type || "general",
        periodStart: item.periodStart ? String(item.periodStart).slice(0, 10) : "",
        periodEnd: item.periodEnd ? String(item.periodEnd).slice(0, 10) : "",
        summary: item.summary || "",
      });
    } else {
      setForm({ title: "", type: "general", periodStart: "", periodEnd: "", summary: "" });
    }
    setError("");
  }, [open, item]);

  if (!open) return null;
  async function save() {
    setError("");
    setSaving(true);
    try {
      const payload = { ...form };
      if (mode === "create") await api.post("/reports", payload);
      if (mode === "edit") await api.put(`/reports/${item._id}`, payload);
      onSaved();
    } catch (e) {
      setError(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg"><div className="modal-content">
        <div className="modal-header"><h5 className="modal-title">{mode === "create" ? "Add Report" : mode === "edit" ? "Edit Report" : "View Report"}</h5><button className="btn-close" onClick={onClose} /></div>
        <div className="modal-body">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          <div className="row g-2">
            <div className="col-12"><label className="form-label">Title</label><input className="form-control" disabled={isView} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="col-md-4"><label className="form-label">Type</label><select className="form-select" disabled={isView} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}><option value="general">General</option><option value="attendance">Attendance</option><option value="grades">Grades</option></select></div>
            <div className="col-md-4"><label className="form-label">Start</label><input type="date" className="form-control" disabled={isView} value={form.periodStart} onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))} /></div>
            <div className="col-md-4"><label className="form-label">End</label><input type="date" className="form-control" disabled={isView} value={form.periodEnd} onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label">Summary</label><textarea className="form-control" rows={4} disabled={isView} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} /></div>
          </div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Close</button>{!isView ? <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</button> : null}</div>
      </div></div>
    </div>
  );
}

export default function ReportsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "view", item: null });

  const params = useMemo(() => {
    const p = { page, limit, sort: "-createdAt" };
    if (q.trim()) p.q = q.trim();
    return p;
  }, [q, page, limit]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/reports", { params });
      setItems(data.items || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [params]); // eslint-disable-line

  async function onDelete(id) {
    if (!window.confirm("Delete this report?")) return; // eslint-disable-line
    await api.delete(`/reports/${id}`);
    await load();
  }

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <div><h3 className="mb-0">Reports</h3><div className="text-muted small">Total: {total}</div></div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, mode: "create", item: null })}>Add report</button>
      </div>
      <div className="card shadow-sm"><div className="card-body">
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6"><input className="form-control" placeholder="Search reports..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          <div className="col-6 col-md-2"><select className="form-select" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>{[5, 10, 20].map((n) => <option value={n} key={n}>{n} / page</option>)}</select></div>
          <div className="col-6 col-md-4 d-flex justify-content-end"><button className="btn btn-outline-primary" onClick={load}>Refresh</button></div>
        </div>
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="alert alert-info">Loading...</div> : null}
        {!loading && !items.length ? <div className="alert alert-warning">No reports found.</div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead><tr><th>Title</th><th>Type</th><th>Period</th><th>Created</th><th className="text-end">Actions</th></tr></thead>
              <tbody>{items.map((r) => <tr key={r._id}>
                <td className="fw-semibold">{r.title}</td><td>{r.type}</td>
                <td>{r.periodStart ? new Date(r.periodStart).toLocaleDateString() : "-"} {r.periodEnd ? `to ${new Date(r.periodEnd).toLocaleDateString()}` : ""}</td>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                <td className="text-end"><div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary" onClick={() => setModal({ open: true, mode: "view", item: r })}>View</button>
                  <button className="btn btn-outline-primary" onClick={() => setModal({ open: true, mode: "edit", item: r })}>Edit</button>
                  <button className="btn btn-outline-danger" onClick={() => onDelete(r._id)}>Delete</button>
                </div></td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
        <PaginationBar page={page} pages={pages} onPage={setPage} />
      </div></div>
      <ReportModal open={modal.open} mode={modal.mode} item={modal.item}
        onClose={() => setModal({ open: false, mode: "view", item: null })}
        onSaved={async () => { await load(); setModal({ open: false, mode: "view", item: null }); }} />
    </div>
  );
}

