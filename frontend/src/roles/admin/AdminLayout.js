import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import NotificationBell from "../../components/NotificationBell";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <aside className="border-end bg-light" style={{ width: 260 }}>
        <div className="p-3 border-bottom">
          <div className="fw-bold">Admin Panel</div>
          <div className="small text-muted">{user?.email}</div>
        </div>
        <nav className="p-2">
          <NavLink className="nav-link" to="/admin/dashboard">
            Dashboard
          </NavLink>
          <div className="text-uppercase small text-muted mt-3 px-3">Management</div>
          <NavLink className="nav-link" to="/admin/students">
            Students
          </NavLink>
          <NavLink className="nav-link" to="/admin/teachers">
            Teachers
          </NavLink>
          <NavLink className="nav-link" to="/admin/classes">
            Classes
          </NavLink>
          <NavLink className="nav-link" to="/admin/modules">
            Modules
          </NavLink>
          <NavLink className="nav-link" to="/admin/exams">
            Exams
          </NavLink>
          <NavLink className="nav-link" to="/admin/timetable">
            Timetable
          </NavLink>
          <NavLink className="nav-link" to="/admin/attendance">
            Attendance
          </NavLink>
          <NavLink className="nav-link" to="/admin/payments">
            Finance
          </NavLink>
          <NavLink className="nav-link" to="/admin/analytics">
            Analytics
          </NavLink>
          <NavLink className="nav-link" to="/admin/calendar">
            Calendar
          </NavLink>
          <NavLink className="nav-link" to="/admin/documents">
            Documents
          </NavLink>
          <NavLink className="nav-link" to="/admin/reports">
            Reports
          </NavLink>
        </nav>
      </aside>
      <main className="flex-grow-1">
        <div className="border-bottom bg-white">
          <div className="container-fluid py-2 d-flex justify-content-between align-items-center">
            <div className="fw-semibold">Professional School Management System</div>
            <div className="d-flex align-items-center gap-3">
              <NotificationBell />
              <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="container-fluid py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
