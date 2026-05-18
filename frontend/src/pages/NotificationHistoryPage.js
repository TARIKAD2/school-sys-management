import React, { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from "lucide-react";

export default function NotificationHistoryPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, I'd update the backend to support these filters specifically
      // For now, I'll fetch and filter client-side or use existing endpoint
      const res = await api.get(`/notifications?page=${page}&type=${typeFilter}&status=${filter}`);
      setNotifications(res.data.data || []);
      // Assume 20 per page for now as per controller limit
      setTotalPages(1); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, filter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getIcon = (type) => {
    switch (type) {
      case "success": return <CheckCircle2 className="text-success" size={20} />;
      case "error": return <XCircle className="text-danger" size={20} />;
      case "warning": return <AlertTriangle className="text-warning" size={20} />;
      case "message": return <MessageCircle className="text-info" size={20} />;
      default: return <Info className="text-primary" size={20} />;
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const deleteNotif = async (id) => {
    // Backend doesn't have delete notifications yet based on my view, 
    // but I'd usually add it. Just UI for now.
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted mb-0">Stay updated with your latest school activities</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => setFilter("unread")}>
            Unread Only
          </button>
          <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => {}}>
            Mark All Read
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 py-3">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group input-group-sm bg-light rounded-pill px-2 border-0">
                <span className="input-group-text bg-transparent border-0"><Search size={16} /></span>
                <input type="text" className="form-control bg-transparent border-0" placeholder="Search notifications..." />
              </div>
            </div>
            <div className="col-md-8 d-flex justify-content-md-end gap-2 align-items-center">
              <Filter size={16} className="text-muted" />
              <select className="form-select form-select-sm w-auto rounded-pill border-0 bg-light px-3" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <select className="form-select form-select-sm w-auto rounded-pill border-0 bg-light px-3" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="message">Messages</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <Bell size={48} className="mb-3 opacity-25 mx-auto" />
              <h5>No notifications found</h5>
              <p>When you get news, it will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0">Status</th>
                    <th className="py-3 border-0">Subject</th>
                    <th className="py-3 border-0">Message</th>
                    <th className="py-3 border-0">Date</th>
                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif) => (
                    <tr key={notif._id} className={!notif.isRead ? "bg-primary-subtle bg-opacity-10" : ""}>
                      <td className="px-4">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center p-2`} 
                             style={{ width: 36, height: 36, backgroundColor: notif.isRead ? '#f8f9fa' : 'white' }}>
                          {getIcon(notif.type)}
                        </div>
                      </td>
                      <td>
                        <span className={`fw-semibold ${!notif.isRead ? "text-primary" : ""}`}>{notif.title}</span>
                      </td>
                      <td className="text-muted small">
                        {notif.message}
                      </td>
                      <td className="text-muted small">
                        {new Date(notif.createdAt).toLocaleDateString()} <br/>
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {!notif.isRead && (
                            <button className="btn btn-sm btn-light rounded-circle p-2" onClick={() => markRead(notif._id)} title="Mark as read">
                              <CheckCircle2 size={16} className="text-success" />
                            </button>
                          )}
                          <button className="btn btn-sm btn-light rounded-circle p-2" onClick={() => deleteNotif(notif._id)} title="Delete">
                            <Trash2 size={16} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
          <span className="small text-muted">Showing {notifications.length} notifications</span>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-light rounded-pill px-3" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} className="me-1" /> Previous
            </button>
            <button className="btn btn-sm btn-light rounded-pill px-3" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight size={16} className="ms-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
