import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import NotificationBell from "../../components/NotificationBell";
import { Menu, X } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      {/* Mobile Top Navbar */}
      <div className="d-md-none d-flex justify-content-between align-items-center p-3 bg-white border-bottom sticky-top" style={{ zIndex: 1040, top: 0 }}>
        <div className="fw-bold fs-5 text-primary">Admin Panel</div>
        <div className="d-flex align-items-center gap-3">
          <NotificationBell />
          <button className="btn btn-light p-1 d-flex align-items-center justify-content-center" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none" 
          style={{ zIndex: 1045 }}
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`border-end bg-light d-flex flex-column transition-all ${isSidebarOpen ? 'position-fixed start-0 top-0 h-100 shadow' : 'd-none d-md-flex'}`} 
        style={{ width: 260, zIndex: 1050 }}
      >
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold">Admin Panel</div>
            <div className="small text-muted">{user?.email}</div>
          </div>
          <button className="btn btn-light d-md-none p-1 d-flex align-items-center justify-content-center" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>
        <nav className="p-2 flex-grow-1 overflow-auto" onClick={(e) => { if (e.target.closest('a')) closeSidebar(); }}>
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
        <div className="p-3 border-top d-md-none">
          <button className="btn btn-outline-danger w-100 fw-bold" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 w-100 overflow-hidden d-flex flex-column">
        <div className="border-bottom bg-white d-none d-md-block">
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
        <div className="container-fluid py-3 flex-grow-1 table-responsive-box">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
