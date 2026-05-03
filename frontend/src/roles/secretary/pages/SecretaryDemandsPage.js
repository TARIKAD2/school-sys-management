import React, { useEffect, useState, useCallback } from "react";
import api from "../../../api/client";
import { MessageSquare, Send, Search, User } from "lucide-react";
import PaginationBar from "../../../components/PaginationBar";
import { useSocket } from "../../../context/SocketContext";

export default function SecretaryDemandsPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const socket = useSocket();

  // "student" or "teacher"
  const [recipientType, setRecipientType] = useState("student");
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [message, setMessage] = useState("Veuillez vous présenter à l'administration dès que possible.");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const loadDemands = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/demands?page=${page}&limit=10`);
      setDemands(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Load classes on mount
  useEffect(() => {
    api.get("/classes?limit=200&sort=name").then(({ data }) => {
      setClasses(data.items || []);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    loadDemands();
  }, [loadDemands]);

  // Handle cross-role Demand Synchronization Live Updates 
  useEffect(() => {
    if (!socket) return;

    const handleDemandRead = (demandId) => {
      setDemands(prev => prev.map(d => d._id === demandId ? { ...d, status: "read" } : d));
    };

    socket.on("demand_read", handleDemandRead);
    socket.on("connect", loadDemands); // Resync if drops

    return () => {
      socket.off("demand_read", handleDemandRead);
      socket.off("connect", loadDemands);
    };
  }, [socket, loadDemands]);

  async function searchRecipients() {
    // If searching teachers, we can search with empty string to get all
    if (recipientType === "student" && search.length < 2) return;

    try {
      if (recipientType === "student") {
        const params = { q: search, limit: 10 };
        if (selectedClass) params.classId = selectedClass;
        const { data } = await api.get("/students", { params });
        setStudents(data.items || []);
        setTeachers([]);
      } else {
        const { data } = await api.get(`/teachers?q=${search}&limit=50`);
        setTeachers(data.items || []);
        setStudents([]);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "danger", msg: "Failed to load recipients" });
    }
  }

  // Load teachers initially when switching to teacher mode
  useEffect(() => {
    if (recipientType === "teacher" && teachers.length === 0) {
      searchRecipients();
    }
  }, [recipientType]); // eslint-disable-line react-hooks/exhaustive-deps

  // When class changes, auto-load students for that class
  async function loadStudentsForClass(cid) {
    setSelectedClass(cid);
    setSelectedStudent(null);
    setStudents([]);
    setSearch("");
    if (!cid) return;
    try {
      const { data } = await api.get(`/students?classId=${cid}&limit=200`);
      setStudents(data.items || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMessage() {
    if (recipientType === "student" && !selectedStudent) return;
    if (recipientType === "teacher" && !selectedTeacher) return;

    setSending(true);
    setFeedback({ type: "", msg: "" });
    try {
      const payload = {
        message,
        recipientType,
        studentId: recipientType === "student" ? selectedStudent._id : undefined,
        teacherId: recipientType === "teacher" ? selectedTeacher._id : undefined
      };

      await api.post("/demands", payload);

      const name = recipientType === "student"
        ? selectedStudent.user?.name
        : selectedTeacher.user?.name;

      setFeedback({ type: "success", msg: `Message sent to ${name}` });
      setSelectedStudent(null);
      setSelectedTeacher(null);
      setSearch("");
      setStudents([]);
      // Don't clear teachers, just keep the table
      loadDemands();
    } catch (err) {
      console.error("Message send error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Failed to send message";
      setFeedback({ type: "danger", msg: errorMsg });
    } finally {
      setSending(false);
    }
  }

  const selectedRecipient = recipientType === "student" ? selectedStudent : selectedTeacher;

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <MessageSquare size={28} className="text-primary" />
        Send Messages
      </h3>

      {feedback.msg && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show rounded-4`} role="alert">
          {feedback.msg}
          <button type="button" className="btn-close" onClick={() => setFeedback({ type: "", msg: "" })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* COMPOSE SECTION */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white p-4 border-0">
              <h5 className="mb-0 fw-bold">New Message</h5>
              <p className="text-muted small mb-0">Send a message to a student or teacher</p>
            </div>
            <div className="card-body p-4 pt-0">

              {/* Recipient type toggle */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Send to</label>
                <div className="btn-group w-100">
                  <button
                    className={`btn ${recipientType === "student" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => {
                      setRecipientType("student");
                      setSelectedStudent(null);
                      setSelectedTeacher(null);
                      setStudents([]);
                      setTeachers([]);
                      setSearch("");
                      setSelectedClass("");
                    }}
                  >
                    Student
                  </button>
                  <button
                    className={`btn ${recipientType === "teacher" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => {
                      setRecipientType("teacher");
                      setSelectedStudent(null);
                      setSelectedTeacher(null);
                      setStudents([]);
                      setTeachers([]);
                      setSearch("");
                      setSelectedClass("");
                    }}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              {/* Class selector (students only) */}
              {recipientType === "student" && (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Filter by Class</label>
                  <select
                    className="form-select border-0 bg-light"
                    value={selectedClass}
                    onChange={(e) => loadStudentsForClass(e.target.value)}
                  >
                    <option value="">— All classes —</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search */}
              {!selectedRecipient && (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">
                    {recipientType === "student" ? "Search Student" : "Search Teacher"}
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      placeholder={recipientType === "student" ? "Name or Student ID..." : "Name or email..."}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyUp={(e) => e.key === "Enter" && searchRecipients()}
                    />
                    <button className="btn btn-primary" onClick={searchRecipients}>
                      <Search size={18} />
                    </button>
                  </div>

                  {/* Student results */}
                  {recipientType === "student" && students.length > 0 && (
                    <div className="list-group mt-2 shadow-sm border-0">
                      {students.map((s) => (
                        <button
                          key={s._id}
                          className="list-group-item list-group-item-action border-0 py-2"
                          onClick={() => setSelectedStudent(s)}
                        >
                          <div className="fw-bold">{s.user?.name}</div>
                          <div className="small text-muted">{s.studentId} — {s.class?.name}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Teacher table results */}
                  {recipientType === "teacher" && teachers.length > 0 && (
                    <div className="table-responsive mt-3 border rounded-4 overflow-hidden shadow-sm bg-white">
                      <table className="table table-hover align-middle mb-0 small">
                        <thead className="bg-light">
                          <tr>
                            <th className="border-0">Name</th>
                            <th className="border-0">Dept/ID</th>
                            <th className="border-0 text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teachers.map((t) => (
                            <tr key={t._id}>
                              <td>
                                <div className="fw-bold">{t.user?.name}</div>
                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{t.user?.email}</div>
                              </td>
                              <td>
                                <div>{t.department || "No dept."}</div>
                                <div className="text-muted small">{t.teacherId}</div>
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                  onClick={() => setSelectedTeacher(t)}
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {recipientType === "teacher" && teachers.length === 0 && search && (
                    <div className="text-center p-3 text-muted">No teachers found matching "{search}"</div>
                  )}
                </div>
              )}

              {/* Selected recipient & message */}
              {selectedRecipient && (
                <div className="p-3 bg-light rounded-4 mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                        <User size={16} className="text-primary" />
                      </div>
                      <div>
                        <div className="fw-bold small">{selectedRecipient.user?.name}</div>
                        <div className="text-muted" style={{ fontSize: 10 }}>
                          {recipientType === "student"
                            ? `${selectedStudent?.studentId} — ${selectedStudent?.class?.name}`
                            : `${selectedTeacher?.teacherId} — ${selectedTeacher?.department || "No dept."}`}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-link text-danger btn-sm p-0 m-0"
                      onClick={() => {
                        setSelectedStudent(null);
                        setSelectedTeacher(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    className="form-control border-0 bg-white"
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                  <button
                    className="btn btn-primary w-100 mt-3 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={sendMessage}
                    disabled={sending}
                  >
                    <Send size={16} />
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HISTORY SECTION */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white p-4 border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Message History</h5>
              <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={loadDemands}>
                Refresh
              </button>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="p-5 text-center">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : demands.length === 0 ? (
                <div className="p-5 text-center text-muted">No message history found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4">Recipient</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th className="pe-4">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demands.map((d) => {
                        const recipName = d.recipientType === "teacher"
                          ? d.teacher?.user?.name
                          : d.student?.user?.name;
                        return (
                          <tr key={d._id}>
                            <td className="ps-4">
                              <div className="fw-bold small">{recipName || "—"}</div>
                              <div className="text-muted" style={{ fontSize: 10 }}>
                                {d.recipientType === "teacher"
                                  ? d.teacher?.teacherId
                                  : d.student?.studentId}
                              </div>
                            </td>
                            <td>
                              <span className={`badge rounded-pill ${d.recipientType === "teacher" ? "bg-info text-dark" : "bg-secondary"}`}>
                                {d.recipientType}
                              </span>
                            </td>
                            <td>
                              <div className="small text-truncate" style={{ maxWidth: "150px" }}>
                                {d.message}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${d.status === "pending"
                                    ? "bg-warning text-dark"
                                    : d.status === "read"
                                      ? "bg-info text-dark"
                                      : "bg-success"
                                  }`}
                              >
                                {d.status}
                              </span>
                            </td>
                            <td className="pe-4">
                              <div className="small text-muted">
                                {new Date(d.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card-footer bg-white p-3 border-0">
              <PaginationBar page={page} pages={totalPages} onPage={setPage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
