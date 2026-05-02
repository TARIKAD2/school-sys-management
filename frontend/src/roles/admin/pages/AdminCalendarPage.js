import React, { useState } from "react";
import SchoolCalendar from "../../../components/SchoolCalendar";
import api from "../../../api/client";
import { Plus } from "lucide-react";

export default function AdminCalendarPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    type: "other",
    targetRoles: ["student", "teacher", "admin"]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/events", formData);
      setShowModal(false);
      window.location.reload(); // Simple refresh to show new event
    } catch (err) {
      alert("Failed to create event");
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Events & Calendar</h2>
          <p className="text-muted">Broadcast school-wide events and manage the academic calendar.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Event
        </button>
      </div>

      <div className="row">
        <div className="col-12">
          <SchoolCalendar />
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Schedule New Event</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Event Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold">Date & Time</label>
                      <input 
                        type="datetime-local" 
                        className="form-control" 
                        required 
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold">Event Type</label>
                      <select 
                        className="form-select" 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="other">Other</option>
                        <option value="exam">Exam</option>
                        <option value="holiday">Holiday</option>
                        <option value="meeting">Meeting</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold d-block">Visible To</label>
                    {['student', 'teacher', 'admin', 'secretary'].map(role => (
                      <div key={role} className="form-check form-check-inline">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={formData.targetRoles.includes(role)}
                          onChange={(e) => {
                            const newRoles = e.target.checked 
                              ? [...formData.targetRoles, role] 
                              : formData.targetRoles.filter(r => r !== role);
                            setFormData({...formData, targetRoles: newRoles});
                          }}
                        />
                        <label className="form-check-label small text-capitalize">{role}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Create Event</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
