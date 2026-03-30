'use client'
import { useState, useEffect } from "react";

const AVATAR_COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6","#f97316","#84cc16"];

const statusConfig = {
  "In-progress": { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  "Pending":     { bg: "#fef9c3", color: "#a16207", dot: "#eab308" },
  "Completed":   { bg: "#dcfce7", color: "#15803d", dot: "#22c55e" },
  "New":         { bg: "#f3e8ff", color: "#7e22ce", dot: "#a855f7" },
};

const priorityConfig = {
  "High":   { bg: "#fee2e2", color: "#b91c1c" },
  "Medium": { bg: "#ffedd5", color: "#c2410c" },
  "Low":    { bg: "#f0fdf4", color: "#166534" },
};

const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = "task-manager-tasks-v1";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveToStorage(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {}
}

const emptyForm = { name: "", due: "", assigned: "", avatar: "", status: "New", priority: "Medium" };

export default function Todo() {
  const [tasks, setTasks] = useState(() => loadFromStorage());
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [saveStatus, setSaveStatus] = useState(null);

  // Persist to localStorage whenever tasks change
  useEffect(() => {
    saveToStorage(tasks);
  }, [tasks]);

  function updateTasks(newTasks) {
    setTasks(newTasks);
  }

  const filtered = tasks.filter(t =>
    (filterStatus === "All" || t.status === filterStatus) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.assigned.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function openCreate() {
    setForm(emptyForm);
    setEditTask(null);
    setShowModal(true);
  }
  function openEdit(task) {
    setForm({ name: task.name, due: task.due, assigned: task.assigned, avatar: task.avatar, status: task.status, priority: task.priority });
    setEditTask(task);
    setShowModal(true);
  }
  function handleSave() {
    if (!form.name.trim() || !form.assigned.trim()) return;
    const initials = form.avatar.trim() || form.assigned.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
    let newTasks;
    if (editTask) {
      newTasks = tasks.map(t => t.id === editTask.id ? { ...t, ...form, avatar: initials } : t);
    } else {
      const newTask = {
        id: Date.now(),
        created: new Date().toLocaleString("en-GB", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" }),
        ...form,
        avatar: initials
      };
      newTasks = [newTask, ...tasks];
    }
    updateTasks(newTasks);
    setShowModal(false);
  }
  function handleDelete(id) {
    const newTasks = tasks.filter(t => t.id !== id);
    updateTasks(newTasks);
    setDeleteId(null);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: "#64748b", fontSize: 15 }}>Loading your tasks…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif", padding: "0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .task-row { transition: background 0.15s; }
        .task-row:hover { background: #f0f7ff !important; }
        .action-btn { border: none; cursor: pointer; border-radius: 8px; padding: 7px 10px; font-size: 13px; font-weight: 600; transition: all 0.15s; display:inline-flex;align-items:center;gap:4px; }
        .btn-edit { background: #eff6ff; color: #2563eb; }
        .btn-edit:hover { background: #dbeafe; }
        .btn-delete { background: #fff1f2; color: #e11d48; }
        .btn-delete:hover { background: #ffe4e6; }
        .page-btn { border: 1.5px solid #e2e8f0; background: #fff; color: #475569; border-radius: 8px; width: 34px; height: 34px; display:inline-flex;align-items:center;justify-content:center; cursor: pointer; font-size:13px;font-weight:600;transition:all 0.15s; }
        .page-btn:hover, .page-btn.active { background: #2563eb; color:#fff;border-color:#2563eb; }
        .modal-overlay { position:fixed;inset:0;background:rgba(15,23,42,0.45);backdrop-filter:blur(3px);z-index:100;display:flex;align-items:center;justify-content:center; }
        .modal { background:#fff;border-radius:20px;padding:36px 32px;width:100%;max-width:480px;box-shadow:0 24px 64px rgba(15,23,42,0.18);animation:fadeIn 0.2s ease; }
        .input-field { width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:inherit;background:#f8fafc;transition:border 0.15s;outline:none;box-sizing:border-box; }
        .input-field:focus { border-color:#2563eb;background:#fff; }
        select.input-field { appearance:none; }
        .create-btn { background: linear-gradient(135deg,#2563eb,#4f46e5); color:#fff;border:none;padding:10px 22px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:opacity 0.15s;font-family:inherit; }
        .create-btn:hover { opacity:0.9; }
        .search-wrap { position:relative; }
        .search-wrap svg { position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none; }
        .search-input { padding:10px 14px 10px 38px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;width:280px;font-family:inherit;background:#fff;outline:none;transition:border 0.15s; }
        .search-input:focus { border-color:#2563eb; }
        .filter-tab { border:1.5px solid #e2e8f0;background:#fff;color:#64748b;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:inherit; }
        .filter-tab.active { background:#2563eb;color:#fff;border-color:#2563eb; }
        .confirm-modal { background:#fff;border-radius:16px;padding:32px;max-width:360px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(15,23,42,0.18);animation:fadeIn 0.2s ease; }
        .save-badge { display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:99px;transition:all 0.3s; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e2e8f0", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Task Manager
          </div>
          <div style={{ color: "#64748b", fontSize: 14, marginTop: 2, display: "flex", alignItems: "center", gap: 10 }}>
            <span>Admin Dashboard · {tasks.length} total tasks</span>
            {saveStatus === "saving" && (
              <span className="save-badge" style={{ background: "#eff6ff", color: "#2563eb" }}>
                <div style={{ width: 10, height: 10, border: "2px solid #bfdbfe", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Saving…
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="save-badge" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Saved
              </span>
            )}
          </div>
        </div>
        <button className="create-btn" onClick={openCreate}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Create Task
        </button>
      </div>

      <div style={{ padding: "28px 32px" }}>
        {/* Stats Row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "Total Tasks", value: tasks.length, color: "#2563eb", bg: "#eff6ff" },
            { label: "In Progress", value: tasks.filter(t=>t.status==="In-progress").length, color: "#d97706", bg: "#fffbeb" },
            { label: "Completed", value: tasks.filter(t=>t.status==="Completed").length, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Pending", value: tasks.filter(t=>t.status==="Pending").length, color: "#7c3aed", bg: "#faf5ff" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "16px 24px", flex: "1", minWidth: 140, border: `1.5px solid ${s.color}22` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,0.06)" }}>
          {/* Toolbar */}
          <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #f1f5f9", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All","New","In-progress","Pending","Completed"].map(s => (
                <button key={s} className={`filter-tab${filterStatus===s?" active":""}`} onClick={()=>{setFilterStatus(s);setPage(1);}}>{s}</button>
              ))}
            </div>
            <div className="search-wrap">
              <svg width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
              <input className="search-input" placeholder="Search tasks or assignee…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Task Name","Created Date","Due Date","Assigned","Status","Priority","Actions"].map(h => (
                    <th key={h} style={{ padding: "13px 20px", textAlign: "left", fontWeight: 700, color: "#475569", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1.5px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "64px", textAlign: "center", color: "#94a3b8", fontSize: 15 }}>
                      <div style={{ marginBottom: 10 }}>
                        <svg width="36" height="36" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24" style={{ display: "block", margin: "0 auto 12px" }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>
                      </div>
                      {tasks.length === 0 ? "No tasks yet. Create your first task!" : "No tasks match your filters."}
                    </td>
                  </tr>
                ) : paginated.map((task, i) => {
                  const sc = statusConfig[task.status] || statusConfig["New"];
                  const pc = priorityConfig[task.priority] || priorityConfig["Low"];
                  const avatarColor = AVATAR_COLORS[task.id % AVATAR_COLORS.length];
                  return (
                    <tr key={task.id} className="task-row" style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc", borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "15px 20px", maxWidth: 280 }}>
                        <div style={{ fontWeight: 600, color: "#0f172a", lineHeight: 1.4 }}>{task.name}</div>
                      </td>
                      <td style={{ padding: "15px 20px", color: "#64748b", whiteSpace: "nowrap", fontSize: 13 }}>{task.created}</td>
                      <td style={{ padding: "15px 20px", color: "#64748b", whiteSpace: "nowrap", fontSize: 13, fontWeight: 500 }}>{task.due || "—"}</td>
                      <td style={{ padding: "15px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, letterSpacing: "0.03em" }}>{task.avatar}</div>
                          <span style={{ fontWeight: 500, color: "#334155", fontSize: 13, whiteSpace: "nowrap" }}>{task.assigned}</span>
                        </div>
                      </td>
                      <td style={{ padding: "15px 20px" }}>
                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 99, padding: "5px 12px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                          {task.status}
                        </span>
                      </td>
                      <td style={{ padding: "15px 20px" }}>
                        <span style={{ background: pc.bg, color: pc.color, borderRadius: 99, padding: "5px 12px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{task.priority}</span>
                      </td>
                      <td style={{ padding: "15px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="action-btn btn-edit" onClick={() => openEdit(task)} title="Edit">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            Edit
                          </button>
                          <button className="action-btn btn-delete" onClick={() => setDeleteId(task.id)} title="Delete">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6m5 0V4h4v2"/></svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1.5px solid #f1f5f9", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>
              Showing <strong style={{ color: "#0f172a" }}>{paginated.length}</strong> of <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> tasks
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ opacity: page===1 ? 0.4 : 1 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn${page===n?" active":""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} style={{ opacity: page===totalPages ? 0.4 : 1 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{editTask ? "Edit Task" : "Create New Task"}</div>
              <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Task Name *</label>
                <input className="input-field" placeholder="Enter task description…" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Assigned To *</label>
                  <input className="input-field" placeholder="Full name" value={form.assigned} onChange={e=>setForm({...form,assigned:e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Due Date</label>
                  <input className="input-field" placeholder="e.g. 30 April, 2024" value={form.due} onChange={e=>setForm({...form,due:e.target.value})} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Status</label>
                  <select className="input-field" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    {["New","In-progress","Pending","Completed"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Priority</label>
                  <select className="input-field" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                    {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {!form.name.trim() || !form.assigned.trim() ? (
                <div style={{ fontSize: 12, color: "#94a3b8", background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                  * Task name and assigned person are required
                </div>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button
                className="create-btn"
                onClick={handleSave}
                disabled={!form.name.trim() || !form.assigned.trim()}
                style={{ opacity: (!form.name.trim() || !form.assigned.trim()) ? 0.5 : 1, cursor: (!form.name.trim() || !form.assigned.trim()) ? "not-allowed" : "pointer" }}
              >
                {editTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" fill="none" stroke="#e11d48" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6m5 0V4h4v2"/></svg>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Delete Task?</div>
            <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>This action cannot be undone. The task will be permanently removed.</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "10px 24px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: "10px 24px", border: "none", borderRadius: 10, background: "#e11d48", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}