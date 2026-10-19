"use client";
import Sidebar from "@/components/Sidebar";
import { Download, FileText, Table } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Reports & Exports</div>
              <div className="page-subtitle">Download sales data, GST reports, and order history</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }} className="fade-in">
            {[
              { icon: <Table size={24} />, title: "Download Orders (Excel)", sub: "Full order history with filters", color: "var(--accent-green)", action: "Download .xlsx" },
              { icon: <FileText size={24} />, title: "Daily Sales PDF", sub: "Today's complete sales report", color: "var(--accent-red)", action: "Generate PDF" },
              { icon: <FileText size={24} />, title: "GST Report", sub: "Monthly tax summary for accounting", color: "var(--accent-blue)", action: "Download PDF" },
            ].map((r, i) => (
              <div key={i} className="card" style={{ cursor: "pointer", textAlign: "center", padding: 28 }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = r.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <div style={{ color: r.color, marginBottom: 12 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>{r.sub}</div>
                <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  <Download size={14} /> {r.action}
                </button>
              </div>
            ))}
          </div>

          <div className="card fade-in fade-in-delay-1">
            <div className="card-title">Filter Orders for Export</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">From Date</label>
                <input type="date" className="input-field" defaultValue="2026-10-01" />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">To Date</label>
                <input type="date" className="input-field" defaultValue="2026-10-15" />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Payment Type</label>
                <select className="input-field">
                  <option>All</option>
                  <option>Cash</option>
                  <option>UPI</option>
                </select>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Category</label>
                <select className="input-field">
                  <option>All</option>
                  <option>Waffles</option>
                  <option>Desserts</option>
                  <option>Beverages</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ gap: 8 }}>
              <Download size={15} /> Download Filtered Orders as Excel
            </button>
          </div>

          <div className="card fade-in fade-in-delay-2" style={{ marginTop: 16 }}>
            <div className="card-title">Recent Exports</div>
            {[
              { name: "orders_oct_2026.xlsx", date: "Today, 2:30 PM", size: "48 KB", type: "Excel" },
              { name: "gst_sep_2026.pdf", date: "Oct 1, 2026", size: "12 KB", type: "PDF" },
              { name: "daily_sales_oct14.pdf", date: "Yesterday", size: "8 KB", type: "PDF" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 24 }}>{f.type === "Excel" ? "📊" : "📄"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.date} · {f.size}</div>
                </div>
                <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }}>
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
