import React, { useEffect, useState } from "react";
import api from "../../../api/client";
import { CreditCard, Download, FileText, HelpCircle, ShieldCheck } from "lucide-react";

export default function StudentPaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get("/payments/invoices");
        setInvoices(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading your finacial records...</div>;

  const pendingBalances = invoices
    .filter(i => i.status !== 'paid')
    .reduce((acc, curr) => {
      const net = curr.amount - (curr.discountAmount || 0);
      const rem = net - (curr.paidAmount || 0);
      return acc + rem;
    }, 0);

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-0">Financial Statement</h2>
        <p className="text-muted">Review your tuition fee balance and payment history.</p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm overflow-hidden bg-white border">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 fw-bold">Invoices & Charges</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light text-muted small text-uppercase">
                    <tr>
                      <th className="px-4 py-3 border-0 text-start">Description</th>
                      <th className="py-3 border-0">Balance</th>
                      <th className="py-3 border-0">Due Date</th>
                      <th className="py-3 border-0">Status</th>
                      <th className="px-4 py-3 border-0 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          No financial records found.
                        </td>
                      </tr>
                    ) : invoices.map((inv) => {
                      const net = inv.amount - (inv.discountAmount || 0);
                      const rem = net - (inv.paidAmount || 0);

                      return (
                        <tr key={inv._id}>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FileText size={18} />
                              </div>
                              <div>
                                <div className="fw-semibold">{inv.title}</div>
                                <div className="small text-muted">INV-{inv._id.slice(-6).toUpperCase()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 fw-bold text-danger">
                            {rem > 0 ? `$${rem.toLocaleString()}` : <span className="text-success">$0 (Fully Paid)</span>}
                            {inv.discountAmount > 0 && <div className="smaller text-success">Benefit Applied</div>}
                          </td>
                          <td className="py-3 text-muted">{new Date(inv.dueDate).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span className={`badge rounded-pill px-3 py-2 ${
                              inv.status === 'paid' ? 'bg-success-subtle text-success' :
                              inv.status === 'partial' ? 'bg-info-subtle text-info' :
                              inv.status === 'pending' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'
                            }`}>
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 ms-auto" disabled>
                              Statement
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-dark text-white p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <CreditCard size={32} className="text-primary" />
              <div className="text-uppercase small fw-bold opacity-50">Total Owed</div>
            </div>
            <div className="h1 fw-bold mb-2">${pendingBalances.toLocaleString()}</div>
            <div className="small opacity-75">Your current outstanding balance across all services.</div>
            <hr className="opacity-25" />
            <div className="small d-flex align-items-center gap-2">
              <ShieldCheck size={16} className="text-success" />
              Verified Financial Data
            </div>
          </div>

          <div className="card border-0 shadow-sm p-4 bg-light text-center border-dashed">
            <h6 className="fw-bold mb-3">Notice on Payments</h6>
            <div className="small text-muted mb-3">
              Online payments are currently disabled. Please visit the <strong>Administration Office</strong> to settle any outstanding balances using Cash, Card, or Check.
            </div>
            <div className="badge bg-primary text-wrap p-2 w-100">
              Hours: Mon - Fri | 8 AM - 4 PM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
