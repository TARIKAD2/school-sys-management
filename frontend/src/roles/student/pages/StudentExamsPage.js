import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";

export default function StudentExamsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-date");

  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p = { page, limit, sort };
    if (q.trim()) p.q = q.trim();
    return p;
  }, [q, page, limit, sort]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/exams", { params });
        if (!mounted) return;
        setItems(data.items || []);
        setPages(data.pages || 1);
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
      <h3 className="mb-3">My Exams</h3>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <input
                className="form-control"
                placeholder="Search exams..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="-date">Date (newest)</option>
                <option value="date">Date (oldest)</option>
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
            <div className="alert alert-warning">No exams found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Module</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => (
                    <tr key={e._id}>
                      <td className="fw-semibold">{e.title}</td>
                      <td>{e.module?.code || <span className="text-muted">—</span>}</td>
                      <td>{e.date ? new Date(e.date).toLocaleString() : <span className="text-muted">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <PaginationBar page={page} pages={pages} onPage={(p) => setPage(p)} />
        </div>
      </div>
    </div>
  );
}

