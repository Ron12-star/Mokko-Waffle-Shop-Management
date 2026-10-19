"use client";
import Sidebar from "@/components/Sidebar";
import { inventory } from "@/lib/mockData";
import { AlertTriangle, Plus } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Inventory</div>
              <div className="page-subtitle">
                {inventory.filter(i => i.stock <= i.minStock).length} low stock alerts
              </div>
            </div>
            <button className="btn btn-primary"><Plus size={15} /> Add Ingredient</button>
          </div>

          {inventory.filter(i => i.stock <= i.minStock).length > 0 && (
            <div style={{
              background: "var(--accent-red-glow)", border: "1px solid var(--accent-red)",
              borderRadius: 12, padding: "12px 16px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10, fontSize: 13,
              color: "var(--accent-red)", fontWeight: 600,
            }} className="fade-in">
              <AlertTriangle size={16} />
              {inventory.filter(i => i.stock <= i.minStock).length} ingredients are running low!
              WhatsApp alert sent to manager.
            </div>
          )}

          <div className="card fade-in fade-in-delay-1">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Ingredient", "Unit", "Current Stock", "Min Stock", "Cost/Unit", "Status"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  const pct = Math.min(100, Math.round((item.stock / (item.minStock * 3)) * 100));
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: 600, fontSize: 13 }}>{item.name}</td>
                      <td style={{ padding: "12px", fontSize: 13, color: "var(--text-muted)" }}>{item.unit}</td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 80, height: 6, background: "var(--bg-primary)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: isLow ? "var(--accent-red)" : "var(--accent-green)", borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isLow ? "var(--accent-red)" : "var(--text-primary)" }}>
                            {item.stock} {item.unit}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px", fontSize: 13, color: "var(--text-muted)" }}>{item.minStock} {item.unit}</td>
                      <td style={{ padding: "12px", fontSize: 13 }}>₹{item.cost}</td>
                      <td style={{ padding: "12px" }}>
                        <span className={`badge ${isLow ? "badge-red" : "badge-green"}`}>
                          {isLow ? "⚠ Low Stock" : "✓ OK"}
                        </span>
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
  );
}
