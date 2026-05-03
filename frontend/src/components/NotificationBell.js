import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Bell, BellOff, Info, MessageCircle } from "lucide-react";

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotif = (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on("notification", handleNewNotif);
    socket.on("sync_notifications", fetchNotifications);

    return () => {
      socket.off("notification", handleNewNotif);
      socket.off("sync_notifications", fetchNotifications);
    };
  }, [socket, fetchNotifications]);

  useEffect(() => {
    function handle(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const markAsRead = async () => {
    try {
      await api.patch("/notifications/read");
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = () => {
    if (!isOpen) markAsRead();
    setIsOpen(!isOpen);
  };

  const handleNotifClick = async (notif) => {
    setIsOpen(false);
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark as read");
      }
    }
    if (notif.link) navigate(notif.link);
  };

  if (!user) return null;

  return (
    <div className="position-relative" ref={dropRef}>
      <button 
        className="btn btn-link p-2 text-dark text-decoration-none bg-light rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: 40, height: 40 }}
        onClick={handleToggle}
      >
        <Bell size={20} className={unreadCount > 0 ? "text-primary" : "text-muted"} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm" style={{ fontSize: '10px' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="card shadow-lg border-0 position-absolute end-0 mt-2 rounded-4 overflow-hidden" style={{ width: 350, zIndex: 1050 }}>
          <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">Notifications</h6>
            <button className="btn btn-sm btn-light text-primary small p-1 px-2 rounded-pill border-0" onClick={markAsRead}>
              Mark all as read
            </button>
          </div>
          <div className="list-group list-group-flush" style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <BellOff className="mx-auto mb-2 opacity-25" size={48} />
                <p className="small mb-0">All caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif._id}
                  className={`list-group-item list-group-item-action border-0 p-3 mb-1 ${!notif.isRead ? 'bg-primary-subtle' : ''}`}
                  onClick={() => handleNotifClick(notif)}
                >
                  <div className="d-flex gap-3">
                    <div className={`p-2 rounded-circle ${notif.type === 'message' ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'}`} style={{ height: 'fit-content' }}>
                      {notif.type === 'message' ? <MessageCircle size={16} /> : <Info size={16} />}
                    </div>
                    <div>
                      <div className="fw-bold small">{notif.title}</div>
                      <div className="small text-muted">{notif.message}</div>
                      <div className="text-muted smaller mt-1" style={{ fontSize: '11px' }}>
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="card-footer bg-light border-0 text-center py-2">
            <button className="btn btn-link btn-sm text-muted text-decoration-none small">
              View all notification history
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
