import React, { useEffect, useState, useCallback } from "react";
import api from "../../../api/client";
import PaginationBar from "../../../components/PaginationBar";
import { useSocket } from "../../../context/SocketContext";

export default function StudentMessagesPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socket = useSocket();

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/demands?page=${p}&limit=10`);
      setItems(data.items || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time listener
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMsg) => {
      // If we are on page 1, add it to the top. Otherwise, just reload maybe?
      // Optimistic insert to the top of the list for instant UX
      setItems(prev => {
        // Prevent duplicates
        if (prev.find(p => p._id === newMsg._id)) return prev;
        const updated = [newMsg, ...prev];
        if (updated.length > 10) updated.pop();
        return updated;
      });
      setTotal(t => t + 1);
    };

    socket.on("new_message", handleNewMessage);
    
    // Automatically refetch latest if socket reconnects
    socket.on("connect", load);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("connect", load);
    };
  }, [socket, load]);

  async function markRead(id) {
    // Optimistic UI Update
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, status: "read" } : item
      )
    );
    try {
      await api.patch(`/demands/${id}/read`);
    } catch {
      // Setup error handling if necessary
    }
  }

  return (
    <div>
      <h3 className="mb-3">My Messages</h3>
      <div className="card shadow-sm">
        <div className="card-body">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {loading && !items.length ? <div className="alert alert-info">Loading...</div> : null}
          {!loading && !items.length ? (
            <div className="alert alert-success">No messages yet.</div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isUnread = item.status === "pending";
                    return (
                      <tr 
                        key={item._id} 
                        style={{ fontWeight: isUnread ? 700 : 400, cursor: "pointer", transition: "0.2s" }}
                        onClick={() => {
                          if (isUnread) markRead(item._id);
                          // Feature extension: Open a modal to read the full message clearly
                        }}
                      >
                        <td>{item.secretary?.name || "Secretary"}</td>
                        <td>
                           <div className="text-truncate" style={{ maxWidth: '400px' }}>
                             {item.message}
                           </div>
                        </td>
                        <td className="small text-muted" style={{ whiteSpace: "nowrap" }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                        </td>
                        <td>
                          {isUnread ? (
                            <span className="badge text-bg-primary bg-opacity-75">New</span>
                          ) : (
                            <span className="badge border text-dark bg-light font-weight-normal">Read</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <PaginationBar page={page} pages={pages} onPage={(p) => { setPage(p); load(p); }} />
          <div className="text-muted small mt-2">Total: {total}</div>
        </div>
      </div>
    </div>
  );
}
