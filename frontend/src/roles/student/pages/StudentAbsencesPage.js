import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

export default function StudentAbsencesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-date");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => ({ page, limit, sort }), [page, limit, sort]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/attendance", { params });
        if (!mounted) return;
        // Show absent AND late records (not present)
        const flat = [];
        for (const a of data.items || []) {
          for (const r of a.records || []) {
            if (r.status === "absent" || r.status === "late") {
              flat.push({
                _id: `${a._id}:${r.student}`,
                date: a.date,
                className: a.class?.name,
                moduleCode: a.module?.code,
                note: r.note,
                status: r.status,
              });
            }
          }
        }
        setItems(flat);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <div>
      <h3 className="mb-3">My Absences & Late Arrivals</h3>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-6 col-md-3">
              <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="-date">Newest</option>
                <option value="date">Oldest</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20].map((n) => (
                  <option value={n} key={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading ? <div className="alert alert-info">Loading...</div> : null}
          {!loading && !items.length ? (
            <div className="alert alert-success">No absences or late arrivals found. 🎉</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Class</th>
                    <th>Module</th>
                    <th>Status</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a._id}>
                      <td>{a.date ? new Date(a.date).toLocaleDateString() : ""}</td>
                      <td className="fw-semibold">{a.className || <span className="text-muted">—</span>}</td>
                      <td>{a.moduleCode || <span className="text-muted">—</span>}</td>
                      <td>
                        {a.status === "absent" ? (
                          <span className="badge text-bg-danger">Absent</span>
                        ) : (
                          <span className="badge text-bg-warning">Late</span>
                        )}
                      </td>
                      <td>{a.note || <span className="text-muted">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PaginationBar page={page} pages={pages} onPage={(p) => setPage(p)} />
          <div className="text-muted small mt-2">Total: {total}</div>
        </div>
      </div>
    </div>
  );
}

