'use client'

import { useState } from "react";


const CATEGORIES = [
  { id: 1, label: "Team Building Retreat Meeting", color: "#ef6c47", bg: "#fde8e2" },
  { id: 2, label: "Product Launch Strategy Meeting", color: "#3bbfad", bg: "#e0f7f4" },
  { id: 3, label: "Monthly Sales Review", color: "#4caf72", bg: "#e2f5e9" },
  { id: 4, label: "Team Lunch Celebration", color: "#e57373", bg: "#fdecea" },
  { id: 5, label: "Marketing Campaign Kickoff", color: "#f5c842", bg: "#fdf8e1" },
];

const INITIAL_EVENTS = {
  "2026-03-01": [
    { id: 101, time: "12:29p", label: "Interview - Frontend", color: "#3a3a4a", dot: "#ef6c47" },
    { id: 102, time: "4:05p", label: "Meeting", color: "#f5c842", dot: "#f5c842" },
  ],
  "2026-03-08": [
    { id: 103, time: "5:18a", label: "Interview - Frontend Engineer", color: "#3a3a4a", dot: null, fullWidth: true },
  ],
  "2026-03-09": [
    { id: 104, time: "11:09a", label: "Phone", color: "#4caf72", dot: "#fff" },
  ],
  "2026-03-11": [
    { id: 105, time: "2:02a", label: "Meeting", color: "#3bbfad", dot: "#fff" },
    { id: 106, time: "8:09a", label: "Buy Des", color: "#ef6c47", dot: "#fff" },
  ],
  "2026-03-19": [
    { id: 107, time: "4:29a", label: "Setup Github Repository", color: "#ef6c47", dot: null, fullWidth: true, span: 2 },
  ],
  "2026-05-05": [
    { id: 108, time: "1:09p", label: "Meeting", color: "#3a3a4a", dot: "#fff" },
  ],
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function Calendar() {
  const today = new Date();
  const [current, setCurrent] = useState({ year: 2026, month: 2 }); // March 2026
  const [view, setView] = useState("Month");
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [form, setForm] = useState({ time: "", label: "", categoryId: 1 });

  const { year, month } = current;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1);

  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" });

  const goToPrev = () => {
    setCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  };
  const goToNext = () => {
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  };
  const goToToday = () => setCurrent({ year: today.getFullYear(), month: today.getMonth() });

  const openAddModal = (date) => {
    setModalDate(date);
    setForm({ time: "", label: "", categoryId: 1 });
    setShowModal(true);
  };

  const handleAddEvent = () => {
    if (!form.label.trim() || !form.time.trim()) return;
    const cat = CATEGORIES.find((c) => c.id === Number(form.categoryId));
    const newEvent = {
      id: Date.now(),
      time: form.time,
      label: form.label,
      color: cat.color,
      dot: "#fff",
    };
    setEvents((prev) => ({
      ...prev,
      [modalDate]: [...(prev[modalDate] || []), newEvent],
    }));
    setShowModal(false);
  };

  // Build grid cells
  const cells = [];
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, current: false, key: null });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, key: formatKey(year, month, d) });
  }
  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, key: null });
  }

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div style={styles.root}>
      {/* Left Sidebar */}
      <aside style={styles.sidebar}>
        <button style={styles.addBtn} onClick={() => openAddModal(formatKey(year, month, 1))}>
          <span style={styles.plus}>＋</span> Add New Schedule
        </button>
        <p style={styles.hint}>Drag and drop your event or click in the calendar</p>
        <div style={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <div key={cat.id} style={{ ...styles.categoryItem, background: cat.bg }}>
              <span style={{ ...styles.catDot, background: cat.color }} />
              <span style={{ ...styles.catLabel, color: cat.color }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Calendar */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.navGroup}>
            <button style={styles.navBtn} onClick={goToPrev}>Prev</button>
            <button style={styles.navBtn} onClick={goToNext}>Next</button>
            <button style={{ ...styles.navBtn, ...styles.todayBtn }} onClick={goToToday}>Today</button>
          </div>
          <h2 style={styles.monthTitle}>{monthName} {year}</h2>
          <div style={styles.viewGroup}>
            {["Month", "Week", "Day", "List"].map((v) => (
              <button
                key={v}
                style={{ ...styles.viewBtn, ...(view === v ? styles.viewBtnActive : {}) }}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Day Headers */}
        <div style={styles.dayHeaders}>
          {DAYS.map((d) => (
            <div key={d} style={styles.dayHeader}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={styles.grid}>
          {cells.map((cell, idx) => {
            const cellEvents = cell.key ? events[cell.key] || [] : [];
            const todayCell = cell.current && isToday(cell.day);
            return (
              <div
                key={idx}
                style={{
                  ...styles.cell,
                  ...(cell.current ? {} : styles.cellFaded),
                  ...(todayCell ? styles.cellToday : {}),
                }}
                onClick={() => cell.current && openAddModal(cell.key)}
              >
                <span style={{ ...styles.dayNum, ...(todayCell ? styles.dayNumToday : {}) }}>
                  {cell.day}
                </span>
                <div style={styles.eventList}>
                  {cellEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        ...styles.eventChip,
                        background: ev.color,
                        color: "#fff",
                      }}
                      title={ev.label}
                    >
                      {ev.dot && (
                        <span style={{ ...styles.evDot, background: ev.dot }} />
                      )}
                      <span style={styles.evTime}>{ev.time}</span>
                      <span style={styles.evLabel}>{ev.label}</span>
                    </div>
                  ))}
                  {cellEvents.length > 3 && (
                    <div style={styles.moreChip}>+{cellEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Add New Schedule</h3>
            <p style={styles.modalDate}>
              {modalDate ? new Date(modalDate + "T00:00:00").toDateString() : ""}
            </p>
            <input
              style={styles.input}
              placeholder="Event title"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
            <input
              style={styles.input}
              placeholder="Time (e.g. 9:00a)"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
            <select
              style={styles.input}
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.confirmBtn} onClick={handleAddEvent}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#e8e8e8",
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    padding: "24px",
    gap: "20px",
    boxSizing: "border-box",
  },
  sidebar: {
    width: "260px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ef6c47",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "14px 20px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(239,108,71,0.35)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  plus: {
    fontSize: "20px",
    fontWeight: "300",
  },
  hint: {
    fontSize: "13px",
    color: "#666",
    margin: "0",
    lineHeight: "1.5",
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  categoryItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  catDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  catLabel: {
    fontSize: "13px",
    fontWeight: "500",
    lineHeight: "1.3",
  },
  main: {
    flex: 1,
    background: "#f0f0f0",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "#f0f0f0",
    borderBottom: "1px solid #ddd",
    flexWrap: "wrap",
    gap: "10px",
  },
  navGroup: {
    display: "flex",
    gap: "6px",
  },
  navBtn: {
    background: "transparent",
    border: "1.5px solid #ef6c47",
    color: "#ef6c47",
    borderRadius: "8px",
    padding: "7px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  todayBtn: {
    background: "#ef6c47",
    color: "#fff",
  },
  monthTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
  },
  viewGroup: {
    display: "flex",
    background: "#e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  viewBtn: {
    background: "transparent",
    border: "none",
    padding: "7px 16px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#666",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  viewBtnActive: {
    background: "#ef6c47",
    color: "#fff",
    fontWeight: "700",
    borderRadius: "8px",
  },
  dayHeaders: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    background: "#f0f0f0",
    borderBottom: "1px solid #ddd",
  },
  dayHeader: {
    textAlign: "center",
    padding: "10px 0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    letterSpacing: "0.05em",
  },
  grid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(6, 1fr)",
    borderLeft: "1px solid #ddd",
    borderTop: "1px solid #ddd",
  },
  cell: {
    borderRight: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
    padding: "6px 6px 4px",
    minHeight: "100px",
    background: "#f8f8f8",
    cursor: "pointer",
    transition: "background 0.12s",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    position: "relative",
  },
  cellFaded: {
    background: "#efefef",
    cursor: "default",
  },
  cellToday: {
    background: "#fff8f5",
  },
  dayNum: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#444",
    alignSelf: "flex-end",
    marginBottom: "2px",
  },
  dayNumToday: {
    background: "#ef6c47",
    color: "#fff",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
  },
  eventList: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    width: "100%",
  },
  eventChip: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    borderRadius: "5px",
    padding: "2px 6px",
    fontSize: "11px",
    fontWeight: "500",
    overflow: "hidden",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  evDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  evTime: {
    fontWeight: "700",
    flexShrink: 0,
    fontSize: "10px",
  },
  evLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "11px",
  },
  moreChip: {
    fontSize: "10px",
    color: "#888",
    paddingLeft: "4px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    width: "340px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
  },
  modalDate: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
  },
  input: {
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    outline: "none",
    color: "#333",
    width: "100%",
    boxSizing: "border-box",
    background: "#fafafa",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1.5px solid #ddd",
    background: "#fff",
    color: "#666",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#ef6c47",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(239,108,71,0.3)",
  },
};