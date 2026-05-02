import React from "react";

export default function PaginationBar({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < pages;

  function go(p) {
    if (p < 1 || p > pages) return;
    onPage(p);
  }

  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(pages, page + windowSize);

  const nums = [];
  for (let p = start; p <= end; p++) nums.push(p);

  return (
    <nav className="d-flex justify-content-between align-items-center mt-3">
      <div className="text-muted small">
        Page <span className="fw-semibold">{page}</span> / {pages}
      </div>
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${!canPrev ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(page - 1)} disabled={!canPrev}>
            Prev
          </button>
        </li>
        {start > 1 ? (
          <>
            <li className="page-item">
              <button className="page-link" onClick={() => go(1)}>
                1
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          </>
        ) : null}
        {nums.map((p) => (
          <li className={`page-item ${p === page ? "active" : ""}`} key={p}>
            <button className="page-link" onClick={() => go(p)}>
              {p}
            </button>
          </li>
        ))}
        {end < pages ? (
          <>
            <li className="page-item disabled">
              <span className="page-link">…</span>
            </li>
            <li className="page-item">
              <button className="page-link" onClick={() => go(pages)}>
                {pages}
              </button>
            </li>
          </>
        ) : null}
        <li className={`page-item ${!canNext ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(page + 1)} disabled={!canNext}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

