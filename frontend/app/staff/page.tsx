"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { UserPlus, RefreshCw, X, Clock, ShoppingCart, UserCheck, UserX } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: "Counter" | "Kitchen" | "Manager";
  status: "On Shift" | "Off Shift";
  since: string;
  orders: number;
  sales: number;
  avatar: string;
  phone?: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"Counter" | "Kitchen" | "Manager">("Counter");
  const [newPhone, setNewPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await api.getStaff();
      if (res?.success && Array.isArray(res.staff)) {
        setStaff(res.staff);
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleToggleShift = async (id: string) => {
    try {
      const res = await api.toggleShift(id);
      if (res?.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: res.staff.status, since: res.staff.since } : s))
        );
      }
    } catch (err: any) {
      alert(err.message || "Failed to update shift");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.addStaff({
        name: newName.trim(),
        role: newRole,
        phone: newPhone.trim(),
      });
      if (res?.success) {
        setFeedback(`✓ Added ${res.staff.name} to team roster!`);
        setIsModalOpen(false);
        setNewName("");
        setNewPhone("");
        loadStaff();
        setTimeout(() => setFeedback(""), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to add staff member");
    } finally {
      setSubmitting(false);
    }
  };

  const onShiftStaff = staff.filter((s) => s.status === "On Shift");

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Staff Management & Shift Tracker</div>
              <div className="page-subtitle">
                {onShiftStaff.length} of {staff.length} staff currently clocked in and on active shift
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" onClick={loadStaff}>
                <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
              </button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <UserPlus size={15} /> Add Staff
              </button>
            </div>
          </div>

          {feedback && (
            <div
              style={{
                background: "var(--accent-green-glow)",
                border: "1px solid var(--accent-green)",
                borderRadius: 10,
                padding: "10px 16px",
                marginBottom: 16,
                color: "var(--accent-green)",
                fontSize: 13,
                fontWeight: 600,
              }}
              className="fade-in"
            >
              {feedback}
            </div>
          )}

          {/* Staff Grid */}
          {loading ? (
            <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              Loading team directory from backend...
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="fade-in">
              {staff.map((s) => {
                const isOnShift = s.status === "On Shift";
                return (
                  <div
                    key={s.id}
                    className="card"
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      border: isOnShift ? "1px solid var(--border)" : "1px dashed var(--border)",
                      opacity: isOnShift ? 1 : 0.8,
                    }}
                  >
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        background:
                          s.role === "Counter"
                            ? "var(--accent-orange-glow)"
                            : s.role === "Kitchen"
                            ? "var(--accent-purple-glow)"
                            : "var(--accent-blue-glow)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "Space Grotesk",
                        fontSize: 22,
                        fontWeight: 900,
                        color:
                          s.role === "Counter"
                            ? "var(--accent-orange)"
                            : s.role === "Kitchen"
                            ? "var(--accent-purple)"
                            : "var(--accent-blue)",
                        flexShrink: 0,
                      }}
                    >
                      {s.avatar || s.name.charAt(0)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</div>
                        <button
                          className={`btn ${isOnShift ? "btn-secondary" : "btn-primary"}`}
                          style={{ padding: "4px 10px", fontSize: 11, gap: 4 }}
                          onClick={() => handleToggleShift(s.id)}
                        >
                          {isOnShift ? (
                            <>
                              <UserX size={12} /> Clock Out
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} /> Clock In
                            </>
                          )}
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <span
                          className={`badge ${
                            s.role === "Counter"
                              ? "badge-orange"
                              : s.role === "Kitchen"
                              ? "badge-purple"
                              : "badge-blue"
                          }`}
                        >
                          {s.role}
                        </span>
                        <span className={`badge ${isOnShift ? "badge-green" : "badge-red"}`}>
                          {s.status}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 8,
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} /> Since {s.since || "—"}
                        </span>
                        {s.role === "Counter" ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <ShoppingCart size={12} /> {s.orders} orders · ₹{s.sales.toLocaleString()}
                          </span>
                        ) : (
                          <span>{s.orders} orders prepared</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Staff Modal */}
          {isModalOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                className="card"
                style={{
                  width: 440,
                  maxWidth: "92vw",
                  padding: 24,
                  border: "1px solid var(--border)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Add Staff Member</div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddStaff}>
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Ramesh Patel"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Assigned Role</label>
                    <select
                      className="input-field"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                    >
                      <option value="Counter">Counter (Billing & POS)</option>
                      <option value="Kitchen">Kitchen (Live Order KDS)</option>
                      <option value="Manager">Manager (Reports & Inventory)</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Mobile Number (Optional)</label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="98765 00000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? "Saving..." : "Add to Team"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
