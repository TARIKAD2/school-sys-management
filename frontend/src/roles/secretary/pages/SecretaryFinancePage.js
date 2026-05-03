import React, { useEffect, useState } from "react";
import api from "../../../api/client";
import { CreditCard, Plus, Search, CheckCircle, Clock, AlertCircle, Printer } from "lucide-react";

export default function SecretaryFinancePage() {
  const [stats, setStats] = useState({ totalRevenue: 0, collected: 0, pending: 0, collectedPercentage: 0 });
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null); // invoice object
  const [formData, setFormData] = useState({
    studentId: "",
    title: "Tuition Fee – " + new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    amount: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [payData, setPayData] = useState({ amount: "", method: "cash" });

  const fetchData = async () => {
    try {
      const [invRes, stuRes, statsRes] = await Promise.all([
        api.get("/payments/invoices"),
        api.get("/students"),
        api.get("/payments/stats"),
      ]);
      setInvoices(Array.isArray(invRes.data.data) ? invRes.data.data : []);
      setStudents(Array.isArray(stuRes.data.items) ? stuRes.data.items : []);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments/invoices", {
        ...formData,
        amount: Number(formData.amount),
        items: [{ description: formData.title, price: Number(formData.amount) }],
      });
      setShowCreateModal(false);
      setFormData({ studentId: "", title: "Tuition Fee", amount: "", dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create invoice");
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments/record", {
        invoiceId: showPayModal._id,
        amount: Number(payData.amount),
        method: payData.method,
      });
      setShowPayModal(null);
      alert("✅ Payment recorded successfully!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payment");
    }
  };

  const printReceipt = (inv) => {
    const student = inv.student;
    const netAmount = inv.amount - (inv.discountAmount || 0);
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: auto; border: 1px solid #eee; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #0d6efd; }
        .divider { border-top: 2px solid #0d6efd; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 15px 0; font-weight: bold; font-size: 1.2em; }
        .badge { background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px; }
      </style>
      </head><body>
      <div class="header">
        <div class="logo">🏫 BRIGHT FUTURE ACADEMY</div>
        <h2>Payment Statement</h2>
        <div>Invoice #INV-${inv._id.slice(-6).toUpperCase()}</div>
      </div>
      <div class="divider"></div>
      <div class="row"><strong>Student:</strong> <span>${student?.user?.name || "N/A"}</span></div>
      <div class="row"><strong>Student ID:</strong> <span>${student?.studentId || "N/A"}</span></div>
      <div class="row"><strong>Description:</strong> <span>${inv.title}</span></div>
      <div class="divider"></div>
      <div class="row"><span>Subtotal:</span> <span>$${inv.amount.toLocaleString()}</span></div>
      ${inv.discountAmount > 0 ? `<div class="row text-success"><span>Discount:</span> <span>-$${inv.discountAmount.toLocaleString()}</span></div>` : ''}
      <div class="row"><span>Paid to Date:</span> <span>$${inv.paidAmount.toLocaleString()}</span></div>
      <div class="total-row"><span>Remaining Balance:</span> <span>$${(netAmount - inv.paidAmount).toLocaleString()}</span></div>
      <div class="row"><strong>Status:</strong> <span class="badge" style="background:${inv.status === 'paid' ? '#d1fae5' : '#fef3c7'}">${inv.status.toUpperCase()}</span></div>
      <div class="divider"></div>
      <div class="footer">Thank you for your trust. For any questions, please contact the administration.</div>
      <br/><div style="text-align:center"><button onclick="window.print()" class="no-print">🖨️ Print Statement</button></div>
      <style> @media print { .no-print { display: none; } } </style>
      </body></html>
    `);
    win.document.close();
  };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return (
      inv.title?.toLowerCase().includes(q) ||
      inv.student?.user?.name?.toLowerCase().includes(q) ||
      inv.student?.studentId?.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container-fluid p-3 p-md-4 px-md-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Financial Management</h2>
          <p className="text-muted mb-0">Track tuition, manage partial payments, and issue student statements.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 px-4 shadow-sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} /> <span className="fw-bold">New Invoice</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: <CheckCircle size={22} />, color: "primary", subtitle: `${stats.collectedPercentage}% Collected` },
          { label: "Collected Cash", value: `$${stats.collected.toLocaleString()}`, icon: <CreditCard size={22} />, color: "success" },
          { label: "Pending Balance", value: `$${stats.pending.toLocaleString()}`, icon: <Clock size={22} />, color: "warning" },
          { label: "Unpaid Invoices", value: invoices.filter(i => i.status !== "paid").length, icon: <AlertCircle size={22} />, color: "danger" },
        ].map((s, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 bg-white h-100">
              <div className={`text-${s.color} mb-2 d-flex justify-content-between align-items-center`}>
                {s.icon}
                {s.subtitle && <span className="badge bg-primary-subtle text-primary small">{s.subtitle}</span>}
              </div>
              <div className="small text-muted">{s.label}</div>
              <div className="h4 fw-bold mb-0">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0 d-flex align-items-center gap-2">
          <Search size={16} className="text-muted" />
          <input
            className="form-control border-0 shadow-none"
            placeholder="Search students or invoices…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="px-4 py-3 border-0">Student</th>
                  <th className="py-3 border-0">Invoice Title</th>
                  <th className="py-3 border-0">Payment Progress</th>
                  <th className="py-3 border-0">Due Date</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="px-4 py-3 border-0 text-end">Management</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No financial records found.</td></tr>
                ) : filtered.map(inv => {
                  const netTotal = inv.amount - (inv.discountAmount || 0);
                  const remaining = netTotal - (inv.paidAmount || 0);
                  const progress = Math.min(100, Math.round(((inv.paidAmount || 0) / netTotal) * 100));

                  return (
                    <tr key={inv._id}>
                      <td className="px-4 py-3">
                        <div className="fw-semibold">{inv.student?.user?.name || "—"}</div>
                        <div className="small text-muted">{inv.student?.studentId}</div>
                      </td>
                      <td className="py-3">
                        <div className="small fw-medium">{inv.title}</div>
                        <div className="text-muted smaller">Total: ${netTotal.toLocaleString()}</div>
                      </td>
                      <td className="py-3" style={{ minWidth: "150px" }}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span>${inv.paidAmount?.toLocaleString()} paid</span>
                          <span className="text-muted">{progress}%</span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className={`progress-bar bg-${progress === 100 ? 'success' : 'primary'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {remaining > 0 && <div className="smaller text-danger mt-1">Left: ${remaining.toLocaleString()}</div>}
                      </td>
                      <td className="py-3 small text-muted">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${inv.status === "paid" ? "bg-success-subtle text-success" :
                            inv.status === "partial" ? "bg-info-subtle text-info" :
                              inv.status === "pending" ? "bg-warning-subtle text-warning" : "bg-danger-subtle text-danger"
                          }`}>{inv.status.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => printReceipt(inv)}>
                            <Printer size={14} /> Statement
                          </button>
                          {inv.status !== "paid" && (
                            <button
                              className="btn btn-success btn-sm d-flex align-items-center gap-1"
                              onClick={() => {
                                setShowPayModal(inv);
                                setPayData({ amount: remaining, method: "cash" });
                              }}
                            >
                              <CreditCard size={14} /> Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Issue New Charge</h5>
                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreateInvoice}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Student</label>
                    <select className="form-select" required value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })}>
                      <option value="">Search student for billing…</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Reason for Charge</label>
                    <input className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Base Amount ($)</label>
                      <input type="number" min="1" className="form-control" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                      <div className="smaller text-muted mt-1">Discounts will be applied automatically.</div>
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Deadline</label>
                      <input type="date" className="form-control" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setShowCreateModal(false)}>Discard</button>
                  <button type="submit" className="btn btn-primary px-5 fw-bold">Establish Invoice</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Manual Payment Receipt</h5>
                <button className="btn-close" onClick={() => setShowPayModal(null)} />
              </div>
              <form onSubmit={handleRecordPayment}>
                <div className="modal-body text-center py-4">
                  <div className="avatar mb-3 mx-auto bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>
                    <CreditCard size={30} />
                  </div>
                  <h6 className="fw-bold mb-1">{showPayModal.student?.user?.name}</h6>
                  <p className="text-muted small mb-4">{showPayModal.title}</p>

                  <div className="text-start">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Amount to record ($)</label>
                      <input
                        type="number"
                        min="1"
                        max={showPayModal.amount - (showPayModal.discountAmount || 0) - (showPayModal.paidAmount || 0)}
                        className="form-control form-control-lg text-center fw-bold"
                        required
                        value={payData.amount}
                        onChange={e => setPayData({ ...payData, amount: e.target.value })}
                      />
                    </div>
                    <div className="mb-3 text-center">
                      <div className="btn-group w-100" role="group">
                        {['cash', 'card', 'transfer'].map(m => (
                          <React.Fragment key={m}>
                            <input
                              type="radio"
                              className="btn-check"
                              name="method"
                              id={`method-${m}`}
                              checked={payData.method === m}
                              onChange={() => setPayData({ ...payData, method: m })}
                            />
                            <label className="btn btn-outline-primary text-capitalize" htmlFor={`method-${m}`}>{m}</label>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light w-100 mb-2" onClick={() => setShowPayModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success w-100 fw-bold py-2">Confirm Collection</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
