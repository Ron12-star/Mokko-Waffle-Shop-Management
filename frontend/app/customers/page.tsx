"use client";
import Sidebar from "@/components/Sidebar";
import { customers } from "@/lib/mockData";
import { Search, UserPlus } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Customers</div>
              <div className="page-subtitle">{customers.length} registered customers</div>
            </div>
            <button className="btn btn-primary"><UserPlus size={15} /> Add Customer</button>
          </div>

          <div className="card fade-in" style={{ marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input className="input-field" placeholder="Search by name or phone..." style={{ paddingLeft: 36 }} />
            </div>
          </div>

          <div className="card fade-in fade-in-delay-1">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Customer", "Phone", "Visits", "Total Spent", "Loyalty Points", "Segment", "Last Order"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-glass)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>{c.name}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "var(--text-muted)" }}>{c.phone}</td>
                    <td style={{ padding: "12px", fontSize: 13 }}>{c.visits}</td>
                    <td style={{ padding: "12px", fontSize: 13, fontWeight: 700, color: "var(--accent-orange)", fontFamily: "Space Grotesk" }}>₹{c.spent.toLocaleString()}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ color: "var(--accent-amber)", fontWeight: 700 }}>⭐ {c.points} pts</span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span className={`badge ${c.segment === "VIP" ? "badge-orange" : c.segment === "Regular" ? "badge-blue" : "badge-green"}`}>
                        {c.segment}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: 13, color: "var(--text-muted)" }}>{c.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
