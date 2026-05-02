import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "../api/client";
import { Download, FileText, Plus, Search, Trash } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function DocumentCenterPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await api.get("/documents");
      setDocuments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post("/documents", formData);
      setShowModal(false);
      fetchDocs();
    } catch (err) {
      alert("Upload failed");
    }
  };

  const deleteDoc = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocs();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <div className="p-4 text-center">Opening vaults...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Document Center</h2>
          <p className="text-muted">Repository for certificates, contracts, and transcripts.</p>
        </div>
        {(user.role === 'admin' || user.role === 'secretary') && (
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Upload Document
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="px-4 py-3">Document Name</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Owner</th>
                  <th className="py-3">Upload Date</th>
                  <th className="px-4 py-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc._id}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-2 rounded text-primary">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="fw-semibold">{doc.title}</div>
                          <div className="small text-muted">{doc.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="badge bg-light text-dark text-capitalize">{doc.type}</span>
                    </td>
                    <td className="py-3 small text-muted">{doc.owner?.name || 'Unknown'}</td>
                    <td className="py-3 small text-muted">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <a href={`${BASE_URL}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">
                          <Download size={16} />
                        </a>
                        {(user.role === 'admin' || user._id === doc.createdBy) && (
                          <button className="btn btn-light btn-sm text-danger" onClick={() => deleteDoc(doc._id)}>
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Upload New Document</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Title</label>
                    <input name="title" type="text" className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Document Type</label>
                    <select name="type" className="form-select">
                      <option value="certificate">Certificate</option>
                      <option value="contract">Contract</option>
                      <option value="report">Academic Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Select File</label>
                    <input name="file" type="file" className="form-control" required />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Upload</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
