"use client";
import Sidebar from "@/components/Sidebar";

export default function StaffPage() {
  const staff = [
    { name: "Ravi Kumar", role: "Counter", status: "On Shift", since: "9:00 AM", orders: 34, sales: 9800, avatar: "R" },
    { name: "Meena Joshi", role: "Kitchen", status: "On Shift", since: "9:00 AM", orders: 34, sales: 0, avatar: "M" },
    { name: "Suresh Patil", role: "Kitchen", status: "On Shift", since: "2:00 PM", orders: 0, sales: 0, avatar: "S" },
    { name: "Anita Das", role: "Counter", status: "Off Shift", since: "—", orders: 0, sales: 0, avatar: "A" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Staff Management</div>
              <div className="page-subtitle">{staff.filter(s => s.status === "On Shift").length} staff on shift</div>
            </div>
            <button className="btn btn-primary">+ Add Staff</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }} className="fade-in">
            {staff.map((s, i) => (
              <div key={i} className="card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: s.role === "Counter" ? "var(--accent-orange-glow)" : "var(--accent-purple-glow)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 800,
                  color: s.role === "Counter" ? "var(--accent-orange)" : "var(--accent-purple)",
                  flexShrink: 0,
                }}>{s.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <span className={`badge ${s.role === "Counter" ? "badge-orange" : "badge-purple"}`}>{s.role}</span>
                    <span className={`badge ${s.status === "On Shift" ? "badge-green" : "badge-red"}`}>{s.status}</span>
                  </div>
                  {s.status === "On Shift" && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                      Since {s.since} · {s.role === "Counter" ? `${s.orders} orders · ₹${s.sales.toLocaleString()} sales` : `${s.orders} orders prepared`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
