import React, { useEffect, useState } from "react";
import api from "../../../api/client";
import { Download, FileText, Plus, Search, User } from "lucide-react";

export default function AdminPaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    title: "Tuition Fee - " + new Date().toLocaleString('default', { month: 'long' }),
    amount: "",
    dueDate: new Date().toISOString().split('T')[0],
  });

  const [studentSearch, setStudentSearch] = useState("");
  const [q, setQ] = useState("");

  const fetchData = async (searchQuery = "") => {
    try {
      const [invRes, stuRes] = await Promise.all([
        api.get(`/payments/invoices${searchQuery ? `?q=${searchQuery}` : ''}`),
        api.get("/students?limit=1000"),
      ]);
      setInvoices(Array.isArray(invRes.data.data) ? invRes.data.data : []);
      setStudents(Array.isArray(stuRes.data.items) ? stuRes.data.items : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(q);
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  const filteredStudents = (students || []).filter(s =>
    s.user?.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments/invoices", {
        ...formData,
        amount: Number(formData.amount),
        items: [{ description: formData.title, price: Number(formData.amount) }],
      });
      setShowModal(false);
      setStudentSearch(""); // Reset search
      fetchData(q);
    } catch (err) {
      alert("Failed to create invoice");
    }
  };

  if (loading && !q) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="fw-bold mb-0">Financial Management</h2>
          <p className="text-muted small mb-0">Manage tuition fees, invoices, and student payments.</p>
        </div>
        <div className="d-flex gap-2 flex-grow-1 justify-content-md-end" style={{ maxWidth: '600px' }}>
          <div className="position-relative flex-grow-1">
            <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
            <input
              className="form-control ps-5 border-0 shadow-sm rounded-pill py-2"
              placeholder="Search by student name or ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button
            className="btn btn-primary px-4 rounded-pill shadow-sm d-flex align-items-center gap-2 fw-bold"
            onClick={() => {
              setStudentSearch("");
              setShowModal(true);
            }}
          >
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-primary text-white">
            <div className="small opacity-75">Total Revenue (Paid)</div>
            <div className="h2 fw-bold mb-0">
              ${invoices.filter(i => i.status === 'paid').reduce((acc, current) => acc + current.amount, 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-warning">
            <div className="small text-dark opacity-75">Pending Invoices</div>
            <div className="h2 fw-bold mb-0">
              ${invoices.filter(i => i.status === 'pending').reduce((acc, current) => acc + current.amount, 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white border">
            <div className="small text-muted">Active Students</div>
            <div className="h2 fw-bold mb-0 text-dark">{students.length}</div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="px-4 py-3 border-0">Student</th>
                  <th className="py-3 border-0">Invoice Title</th>
                  <th className="py-3 border-0">Amount</th>
                  <th className="py-3 border-0">Due Date</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32 }}
                        >
                          <User size={16} className="text-muted" />
                        </div>
                        <div>
                          <div className="fw-semibold">{inv.student?.user?.name}</div>
                          <div className="small text-muted">{inv.student?.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <FileText size={14} className="text-primary" />
                        {inv.title}
                      </div>
                    </td>
                    <td className="py-3 fw-bold">${inv.amount.toLocaleString()}</td>
                    <td className="py-3 text-muted">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-3 py-2 ${inv.status === 'paid' ? 'bg-success-subtle text-success' :
                          inv.status === 'pending' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'
                        }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button className="btn btn-light btn-sm me-2" title="Download Receipt">
                        <Download size={16} />
                      </button>
                      {inv.status === 'pending' && (
                        <button className="btn btn-outline-success btn-sm">
                          Mark Paid
                        </button>
                      )}
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
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">New Invoice</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Student</label>
                    <div className="position-relative mb-2">
                      <Search className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" size={14} />
                      <input
                        type="text"
                        className="form-control form-control-sm ps-4"
                        placeholder="Type to search student..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <select
                      className="form-select"
                      required
                      size={5}
                      value={formData.studentId}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    >
                      <option value="">{filteredStudents.length > 0 ? "Choose a student..." : "No students found"}</option>
                      {filteredStudents.map(s => (
                        <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold">Amount ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.dueDate}
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Generate</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
