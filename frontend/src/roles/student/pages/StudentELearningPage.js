import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "../../../api/client";
import { Book, Calendar, Clock, Download, FileText, Layout, MessageSquare, Send } from "lucide-react";

export default function StudentELearningPage() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(null);

  const fetchData = async () => {
    try {
      const [modRes, lesRes, asgRes] = await Promise.all([
        api.get("/modules"),
        api.get("/elearning/lessons"),
        api.get("/elearning/assignments"),
      ]);
      setModules(Array.isArray(modRes.data.items) ? modRes.data.items : []);
      setLessons(lesRes.data.data);
      setAssignments(asgRes.data.data);
      if (modRes.data.items?.length > 0) setSelectedModule(modRes.data.items[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmission = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("assignmentId", showSubModal._id);
    
    try {
      await api.post("/elearning/submissions", formData);
      setShowSubModal(null);
      alert("Assignment submitted successfully!");
    } catch (err) {
      alert("Failed to submit assignment");
    }
  };

  if (loading) return <div className="p-4 text-center text-primary fw-semibold">Accessing Online Classroom...</div>;

  const filteredLessons = lessons.filter(l => l.module?._id === selectedModule);
  const filteredAssignments = assignments.filter(a => a.module?._id === selectedModule);

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-0">My Courses</h2>
        <p className="text-muted">Access your lessons and complete your assignments online.</p>
      </div>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 h-100 bg-white">
            <h6 className="fw-bold mb-3 px-2">Enrolled Modules</h6>
            <div className="list-group list-group-flush">
              {modules.map(mod => (
                <button
                  key={mod._id}
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 py-3 ${selectedModule === mod._id ? 'active bg-primary' : ''}`}
                  onClick={() => setSelectedModule(mod._id)}
                >
                  <div className="small opacity-75">{mod.code}</div>
                  <div className="fw-bold">{mod.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="mb-4">
            <div className="card border-0 shadow-sm p-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-4" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #004085 100%)' }}>
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h4 className="fw-bold mb-2">Welcome to your Virtual Classroom</h4>
                  <p className="opacity-75 mb-0">Stay organized with your lessons and never miss a deadline. Good luck with your studies!</p>
                </div>
                <div className="col-md-4 text-end d-none d-md-block">
                  <Book size={64} className="opacity-25" />
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                  <h6 className="mb-0 fw-bold">Course Lessons</h6>
                </div>
                <div className="card-body p-0">
                  {filteredLessons.length === 0 ? (
                    <div className="p-5 text-center text-muted">No lessons available yet.</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {filteredLessons.map(lesson => (
                        <div key={lesson._id} className="list-group-item p-4 border-0 border-bottom hover:bg-light transition-all">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-3">
                              <div className="bg-primary-subtle p-3 rounded-circle text-primary">
                                <FileText size={20} />
                              </div>
                              <div>
                                <div className="fw-bold fs-5">{lesson.title}</div>
                                <div className="small text-muted mb-2">Uploaded on {new Date(lesson.createdAt).toLocaleDateString()}</div>
                                <div className="small text-muted">{lesson.content}</div>
                              </div>
                            </div>
                            <a href={`${BASE_URL}${lesson.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                              <Download size={14} className="me-1" /> View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm border border-warning-subtle">
                <div className="card-header bg-warning-subtle py-3 text-warning-emphasis">
                  <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <Calendar size={18} /> Pending Assignments
                  </h6>
                </div>
                <div className="card-body p-0">
                  {filteredAssignments.length === 0 ? (
                    <div className="p-5 text-center text-muted">No pending assignments.</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {filteredAssignments.map(asg => {
                        const isOverdue = new Date(asg.deadline) < new Date();
                        return (
                          <div key={asg._id} className="list-group-item p-4 border-0 border-bottom">
                            <h6 className="fw-bold mb-2">{asg.title}</h6>
                            <div className="small text-muted mb-3">{asg.instructions}</div>
                            <div className={`small mb-4 d-flex align-items-center gap-1 ${isOverdue ? 'text-danger fw-bold' : 'text-primary'}`}>
                              <Clock size={14} /> Deadline: {new Date(asg.deadline).toLocaleDateString()}
                            </div>
                            <button 
                              className="btn btn-primary w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
                              onClick={() => setShowSubModal(asg)}
                            >
                              <Send size={16} /> Submit Assignment
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSubModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Submit: {showSubModal.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowSubModal(null)}></button>
              </div>
              <form onSubmit={handleSubmission}>
                <div className="modal-body p-4">
                  <div className="bg-light p-3 rounded-3 mb-4 small text-muted">
                    Your submission will be timestamped and visible to your teacher. Ensure your files are in PDF or Image format.
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Note to Teacher</label>
                    <textarea name="content" className="form-control" rows="3" placeholder="Additional comments..."></textarea>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Upload Solution File</label>
                    <div className="border border-dashed p-4 text-center rounded-3 bg-light">
                      <input name="file" type="file" className="form-control" required />
                      <div className="small text-muted mt-2">Maximum file size: 10MB</div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowSubModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow">Send Submission</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
