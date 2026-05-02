import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import { UserCheck, Search, Users, BookOpen, Clock } from "lucide-react";

export default function SecretaryAttendancePage() {
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Record structure: { [studentId]: { status, note } }
  const [records, setRecords] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: cls }, { data: mods }] = await Promise.all([
          api.get("/classes?limit=200&sort=name"),
          api.get("/modules?limit=200&sort=name")
        ]);
        setClasses(cls.items || []);
        setModules(mods.items || []);
      } catch (err) {
        setError("Failed to load metadata (classes/modules)");
      } finally {
        setLoadingClasses(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setRecords({});
      return;
    }
    async function loadStudents() {
      setLoadingStudents(true);
      setError("");
      setSuccess("");
      try {
        const { data } = await api.get(`/students?classId=${selectedClassId}&limit=500`);
        setStudents(data.items || []);
        
        // Initialize all as present
        const initial = {};
        (data.items || []).forEach(s => {
          initial[s._id] = { status: 'present', note: '' };
        });
        setRecords(initial);
      } catch (err) {
        setError("Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, [selectedClassId]);

  const updateRecord = (studentId, fields) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], ...fields }
    }));
  };

  async function saveAttendance() {
    if (!selectedClassId) {
      setError("Please select a class first.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        date,
        classId: selectedClassId,
      };
      if (selectedModuleId) payload.moduleId = selectedModuleId;

      const { data: sheet } = await api.post("/attendance", payload);

      const recordsToSave = Object.entries(records).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        absenceTime: data.status !== 'present' ? data.absenceTime || "" : undefined,
        absenceType: data.status !== 'present' ? data.absenceType || "unjustified" : undefined,
        note: data.note || (data.status !== 'present' ? 'Marked by Secretary' : '')
      }));

      await api.put(`/attendance/${sheet.item._id}/records`, { records: recordsToSave });
      
      setSuccess("Attendance successfully recorded!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <UserCheck size={28} className="text-primary" />
          Attendance Management
        </h3>
        <div className="d-flex gap-3 align-items-center bg-white p-2 px-3 rounded-4 shadow-sm border">
          <div className="d-flex align-items-center gap-2">
            <Clock size={16} className="text-muted" />
            <label className="small text-muted fw-bold mb-0">DATE:</label>
          </div>
          <input 
            type="date" 
            className="form-control form-control-sm border-0 fw-bold" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            style={{ width: '130px' }}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-4 shadow-sm mb-4 border-0">{error}</div>}
      {success && <div className="alert alert-success rounded-4 shadow-sm mb-4 border-0">{success}</div>}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-5">
              <label className="form-label text-muted small fw-bold d-flex align-items-center gap-2">
                <Users size={14} /> 1. SELECT CLASS
              </label>
              <select 
                className="form-select border-0 bg-light rounded-3 py-2" 
                value={selectedClassId} 
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={loadingClasses}
              >
                <option value="">Choose a class...</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.level})</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-5">
              <label className="form-label text-muted small fw-bold d-flex align-items-center gap-2">
                <BookOpen size={14} /> 2. SELECT MODULE (Optional)
              </label>
              <select 
                className="form-select border-0 bg-light rounded-3 py-2" 
                value={selectedModuleId} 
                onChange={(e) => setSelectedModuleId(e.target.value)}
              >
                <option value="">Choose a module...</option>
                {modules.map(m => (
                  <option key={m._id} value={m._id}>[{m.code}] {m.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2">
               <button 
                 className="btn btn-primary w-100 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-bold" 
                 onClick={saveAttendance}
                 disabled={saving || !selectedClassId || students.length === 0}
               >
                 {saving ? (
                   <span className="spinner-border spinner-border-sm" role="status"></span>
                 ) : "Save Sheet"}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white p-4 border-0 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold">Students Roll Call</h5>
              <p className="text-muted small mb-0">Set status and absence details for each student</p>
            </div>
            <div className="bg-light px-3 py-1 rounded-pill small fw-bold text-primary border">
              {students.length} Students
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {loadingStudents ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="mt-2 text-muted">Loading students...</div>
            </div>
          ) : !selectedClassId ? (
            <div className="p-5 text-center text-muted">
              <div className="bg-light d-inline-block p-4 rounded-circle mb-3">
                <Search size={40} className="opacity-50" />
              </div>
              <p className="mb-0">Select a class to start marking attendance</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-5 text-center text-muted">No students registered in this class.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3 text-muted small fw-bold">STUDENT</th>
                    <th className="py-3 text-muted small fw-bold text-center">STATUS</th>
                    <th className="py-3 text-muted small fw-bold">ABSENCE DETAILS</th>
                    <th className="py-3 text-muted small fw-bold">NOTE</th>
                    <th className="pe-4 py-3 text-muted small fw-bold text-end">QUICK ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const record = records[s._id] || { status: 'present', note: '', absenceTime: '', absenceType: 'unjustified' };
                    return (
                      <tr key={s._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                              {s.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{s.user?.name}</div>
                              <div className="text-[10px] text-muted">ID: {s.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            {['present', 'absent', 'late'].map(st => (
                              <button 
                                key={st}
                                className={`btn btn-sm px-2 rounded-pill font-monospace ${record.status === st ? (st === 'present' ? 'btn-success' : st === 'absent' ? 'btn-danger' : 'btn-warning') + ' shadow-sm' : 'btn-outline-secondary'}`}
                                onClick={() => updateRecord(s._id, { status: st })}
                                style={{ fontSize: '9px', height: '24px' }}
                              >
                                {st.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td>
                          {record.status !== 'present' ? (
                            <div className="d-flex gap-2">
                              <input 
                                type="time" 
                                className="form-control form-control-sm border-0 bg-light" 
                                value={record.absenceTime || ""}
                                title="Time"
                                onChange={(e) => updateRecord(s._id, { absenceTime: e.target.value })}
                                style={{ fontSize: '11px', width: '85px' }}
                              />
                              <select 
                                className="form-select form-select-sm border-0 bg-light"
                                value={record.absenceType || "unjustified"}
                                onChange={(e) => updateRecord(s._id, { absenceType: e.target.value })}
                                style={{ fontSize: '11px', width: '100px' }}
                              >
                                <option value="unjustified">Unjustified</option>
                                <option value="justified">Justified</option>
                                <option value="medical">Medical</option>
                                <option value="family">Family</option>
                              </select>
                            </div>
                          ) : <span className="text-muted small opacity-50 font-monospace">—</span>}
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-control form-control-sm border-0 bg-light" 
                            placeholder="Add a note..."
                            value={record.note}
                            onChange={(e) => updateRecord(s._id, { note: e.target.value })}
                            style={{ fontSize: '11px' }}
                          />
                        </td>
                        <td className="pe-4 text-end">
                          <button 
                            className={`btn btn-sm border-0 rounded-circle ${record.status === 'present' ? 'text-danger' : 'text-success'}`}
                            onClick={() => updateRecord(s._id, { status: record.status === 'present' ? 'absent' : 'present' })}
                          >
                            {record.status === 'present' ? <Users size={16} /> : <UserCheck size={16} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
