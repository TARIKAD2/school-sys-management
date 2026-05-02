import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "../../../api/client";
import { BookOpen, Clock, FileUp, Layout, Plus, Send, Users } from "lucide-react";

export default function TeacherELearningPage() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'lesson' or 'assignment'

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

  const handleFileUpload = async (type, e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("module", selectedModule);
    
    try {
      await api.post(`/elearning/${type}s`, formData);
      setShowModal(null);
      fetchData();
    } catch (err) {
      alert(`Failed to upload ${type}`);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading learning materials...</div>;

  const filteredLessons = lessons.filter(l => l.module?._id === selectedModule);
  const filteredAssignments = assignments.filter(a => a.module?._id === selectedModule);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">E-Learning Hub</h2>
          <p className="text-muted">Manage your digital course materials and student assignments.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal('lesson')}>
            <BookOpen size={18} /> New Lesson
          </button>
          <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => setShowModal('assignment')}>
            <Send size={18} /> New Assignment
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-4 h-100 bg-white">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Layout size={18} className="text-primary" /> My Modules
            </h6>
            <div className="list-group list-group-flush">
              {modules.map(mod => (
                <button
                  key={mod._id}
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 ${selectedModule === mod._id ? 'active bg-primary' : ''}`}
                  onClick={() => setSelectedModule(mod._id)}
                >
                  <div className="fw-semibold">{mod.name}</div>
                  <div className={`small ${selectedModule === mod._id ? 'text-white-50' : 'text-muted'}`}>{mod.code}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <ul className="nav nav-tabs border-0 mb-4 bg-light p-1 rounded-3" style={{ width: 'fit-content' }}>
            <li className="nav-item">
              <button className="nav-link border-0 active rounded-3 px-4 py-2">Content & Activities</button>
            </li>
          </ul>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Published Lessons</h6>
                  <span className="badge bg-light text-primary">{filteredLessons.length}</span>
                </div>
                <div className="card-body p-0">
                  {filteredLessons.length === 0 ? (
                    <div className="p-5 text-center text-muted small">No lessons uploaded yet for this module.</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {filteredLessons.map(lesson => (
                        <div key={lesson._id} className="list-group-item p-3 border-0 border-bottom">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex gap-3">
                              <div className="bg-light p-2 rounded text-primary">
                                <FileUp size={20} />
                              </div>
                              <div>
                                <div className="fw-semibold">{lesson.title}</div>
                                <div className="small text-muted">{new Date(lesson.createdAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <a href={`${BASE_URL}${lesson.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">View</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Active Assignments</h6>
                  <span className="badge bg-light text-primary">{filteredAssignments.length}</span>
                </div>
                <div className="card-body p-0">
                  {filteredAssignments.length === 0 ? (
                    <div className="p-5 text-center text-muted small">Create an assignment to start tracking submissions.</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {filteredAssignments.map(asg => (
                        <div key={asg._id} className="list-group-item p-3 border-0 border-bottom">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="fw-semibold">{asg.title}</div>
                            <span className="badge bg-danger-subtle text-danger small">
                              Due: {new Date(asg.deadline).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="small text-muted text-truncate mb-3">{asg.instructions}</div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="small d-flex align-items-center gap-1 text-muted">
                              <Users size={14} /> 12 Submissions
                            </div>
                            <button className="btn btn-outline-primary btn-sm">Review</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create {showModal === 'lesson' ? 'Lesson' : 'Assignment'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(null)}></button>
              </div>
              <form onSubmit={(e) => handleFileUpload(showModal, e)}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title</label>
                    <input name="title" type="text" className="form-control" required />
                  </div>
                  {showModal === 'assignment' ? (
                    <>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Instructions</label>
                        <textarea name="instructions" className="form-control" rows="3" required></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Deadline</label>
                        <input name="deadline" type="date" className="form-control" required />
                      </div>
                    </>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Content / Description</label>
                      <textarea name="content" className="form-control" rows="3"></textarea>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Upload File</label>
                    <input name="file" type="file" className="form-control" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Upload & Publish</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
