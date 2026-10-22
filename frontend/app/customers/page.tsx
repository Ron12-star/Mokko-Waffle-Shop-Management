"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { Search, UserPlus, RefreshCw, X, Star, Users, Phone, DollarSign } from "lucide-react";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  visits: number;
  spent: number;
  points: number;
  segment: "VIP" | "Regular" | "New";
  lastOrder: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const loadCustomers = async (searchQuery = "") => {
    setLoading(true);
    try {
      const res = await api.getCustomers(searchQuery);
      if (res?.success && Array.isArray(res.customers)) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    loadCustomers(val);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert("Please provide both name and 10-digit mobile number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.addCustomer({ name: newName.trim(), phone: newPhone.trim() });
      if (res?.success) {
        setFeedbackMsg(`✓ Customer ${res.customer.name} registered with 25 welcome points!`);
        setIsAddModalOpen(false);
        setNewName("");
        setNewPhone("");
        loadCustomers();
        setTimeout(() => setFeedbackMsg(""), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to register customer");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0);
  const vipCount = customers.filter((c) => c.segment === "VIP").length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.spent || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Customer CRM & Loyalty</div>
              <div className="page-subtitle">
                {customers.length} registered customers · Realtime spend & rewards tracking
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => loadCustomers(search)}>
                <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
              </button>
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <UserPlus size={15} /> Add Customer
              </button>
            </div>
          </div>

          {feedbackMsg && (
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
              {feedbackMsg}
            </div>
          )}

          {/* Quick Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }} className="fade-in">
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={14} /> Total Patrons
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                {customers.length}
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <Star size={14} color="var(--accent-amber)" /> VIP Club Members
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-amber)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                {vipCount} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>members</span>
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <DollarSign size={14} /> Cumulative Spend
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-orange)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                ₹{totalRevenue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="card fade-in" style={{ marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                className="input-field"
                placeholder="Search customers by name or 10-digit phone..."
                value={search}
                onChange={handleSearchChange}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {/* Customer Table */}
          <div className="card fade-in fade-in-delay-1">
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                Loading customer database from backend...
              </div>
            ) : customers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                No customers found matching &quot;{search}&quot;. Click &quot;Add Customer&quot; above to create one.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Customer", "Phone", "Visits", "Total Spent", "Loyalty Rewards", "Tier Segment", "Last Order"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 12px",
                              textAlign: "left",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.6px",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-glass)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                          {c.name}
                        </td>
                        <td style={{ padding: "12px", fontSize: 13, color: "var(--text-muted)" }}>
                          {c.phone}
                        </td>
                        <td style={{ padding: "12px", fontSize: 13, fontWeight: 600 }}>{c.visits}</td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: 13,
                            fontWeight: 800,
                            color: "var(--accent-orange)",
                            fontFamily: "Space Grotesk",
                          }}
                        >
                          ₹{(c.spent || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ color: "var(--accent-amber)", fontWeight: 700, fontSize: 13 }}>
                            ⭐ {c.points} pts
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            className={`badge ${
                              c.segment === "VIP"
                                ? "badge-orange"
                                : c.segment === "Regular"
                                ? "badge-blue"
                                : "badge-green"
                            }`}
                          >
                            {c.segment}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: 12, color: "var(--text-muted)" }}>
                          {c.lastOrder}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Customer Modal */}
          {isAddModalOpen && (
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
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Register New Customer</div>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomer}>
                  <div className="input-group">
                    <label className="input-label">Customer Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Vikram Sharma"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">WhatsApp Mobile Number</label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 13,
                          color: "var(--text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        +91
                      </span>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="98765 43210"
                        required
                        maxLength={10}
                        style={{ paddingLeft: 42 }}
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Receipts and special deals will be sent to this WhatsApp number
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? "Saving..." : "Save Customer (+25 Pts)"}
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
