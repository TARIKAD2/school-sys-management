import React, { useEffect, useState } from "react";
import api from "../api/client";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function SchoolCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div className="card border-0 shadow-sm overflow-hidden bg-white">
      <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-0">{monthNames[month]} {year}</h5>
          <p className="small text-muted mb-0">Academic Calendar & Events</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light btn-sm rounded-circle" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <button className="btn btn-light btn-sm rounded-circle" onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="d-grid overflow-hidden border-top" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center py-2 small fw-bold text-muted bg-light border-bottom">{d}</div>
          ))}
          {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} className="border-end border-bottom" style={{ aspectRatio: '1/1' }}></div>)}
          {[...Array(days)].map((_, i) => {
            const day = i + 1;
            const dayEvents = events.filter(e => {
              const d = new Date(e.startDate);
              return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
            });
            return (
              <div key={day} className="border-end border-bottom p-1 position-relative" style={{ aspectRatio: '1/1', minHeight: '80px' }}>
                <span className="small fw-semibold text-muted ms-1">{day}</span>
                <div className="mt-1 d-flex flex-column gap-1">
                  {dayEvents.map(e => (
                    <div 
                      key={e._id} 
                      className={`small rounded px-1 fw-medium text-truncate ${
                        e.type === 'exam' ? 'bg-danger-subtle text-danger' : 
                        e.type === 'holiday' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'
                      }`}
                      style={{ fontSize: '10px' }}
                      title={e.title}
                    >
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-light border-top">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <Clock size={18} className="text-primary" /> Upcoming This Month
        </h6>
        <div className="d-flex flex-column gap-3">
          {events.length === 0 ? (
            <div className="small text-muted">No events scheduled.</div>
          ) : events.map(e => (
            <div key={e._id} className="d-flex align-items-start gap-3 bg-white p-3 rounded-3 shadow-sm border-start border-4 border-primary">
              <div className="text-center bg-light p-2 rounded" style={{ minWidth: '50px' }}>
                <div className="small fw-bold text-primary">{new Date(e.startDate).toLocaleString('default', { month: 'short' })}</div>
                <div className="h5 fw-bold mb-0">{new Date(e.startDate).getDate()}</div>
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold">{e.title}</div>
                <div className="small text-muted mb-1">{e.description}</div>
                <div className="small d-flex align-items-center gap-1 text-muted">
                  <Clock size={12} /> {new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <span className={`badge rounded-pill ${
                e.type === 'exam' ? 'bg-danger-subtle text-danger' : 
                e.type === 'holiday' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'
              }`}>
                {e.type.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
