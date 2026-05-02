import React, { useState } from "react";
import api from "../../../api/client";
import { useAuth } from "../../../auth/AuthContext";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function save(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.put("/users/me", {
        name,
        email,
        password: password ? password : undefined,
      });
      setPassword("");
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h3 className="mb-3">My Profile</h3>
      <div className="card shadow-sm" style={{ maxWidth: 720 }}>
        <div className="card-body">
          {error ? <div className="alert alert-danger">{error}</div> : null}
          {success ? <div className="alert alert-success">{success}</div> : null}
          <form onSubmit={save}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">New password (optional)</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-end">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

