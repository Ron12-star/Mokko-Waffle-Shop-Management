"use client";
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { Download, FileText, Table, Filter, RefreshCw, Calendar, IndianRupee, ShoppingBag, CreditCard, Search } from "lucide-react";

interface OrderData {
  id: string;
  orderNumber: string;
  tokenNumber: number;
  type: string;
  tableNumber?: string;
  customer?: { name: string; phone: string };
  items?: Array<{ name: string; qty: number; price: number; selectedToppings?: string[] }>;
  summary?: {
    subtotal: number;
    discount: number;
    cgst: number;
    sgst: number;
    total: number;
  };
  couponCode?: string;
  payment?: {
    method: string;
    status: string;
    cashAmount?: number;
    upiAmount?: number;
  };
  status: string;
  createdAt: string;
  time?: string;
}

interface ExportHistoryItem {
  id: string;
  name: string;
  date: string;
  count: number;
  type: string;
  size: string;
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [datePreset, setDatePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [recentExports, setRecentExports] = useState<ExportHistoryItem[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res?.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders for reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Payment filter
      if (paymentFilter !== "All") {
        if (order.payment?.method?.toLowerCase() !== paymentFilter.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "All") {
        if (order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = order.customer?.name?.toLowerCase().includes(q);
        const matchesPhone = order.customer?.phone?.includes(q);
        const matchesNumber = order.orderNumber?.toLowerCase().includes(q);
        const matchesToken = String(order.tokenNumber).includes(q);
        if (!matchesName && !matchesPhone && !matchesNumber && !matchesToken) {
          return false;
        }
      }

      // Date Presets & Custom Date
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const orderDateStr = order.createdAt.slice(0, 10);

        if (datePreset === "today") {
          if (orderDateStr !== todayStr) return false;
        } else if (datePreset === "yesterday") {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          if (orderDateStr !== yesterday.toISOString().slice(0, 10)) return false;
        } else if (datePreset === "last7") {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          if (orderDate < sevenDaysAgo) return false;
        } else if (datePreset === "custom") {
          if (customFrom && orderDateStr < customFrom) return false;
          if (customTo && orderDateStr > customTo) return false;
        }
      }

      return true;
    });
  }, [orders, paymentFilter, statusFilter, searchQuery, datePreset, customFrom, customTo]);

  // Aggregate stats
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.summary?.total || 0), 0);
  }, [filteredOrders]);

  const totalDiscount = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.summary?.discount || 0), 0);
  }, [filteredOrders]);

  const totalGST = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.summary?.cgst || 0) + (o.summary?.sgst || 0), 0);
  }, [filteredOrders]);

  const aov = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;

  // Export to Excel-compatible CSV with UTF-8 BOM
  const exportToExcel = (exportType: "orders" | "daily" | "gst") => {
    let filename = "";
    let csvRows: string[] = [];
    const timestamp = new Date().toISOString().slice(0, 10);

    if (exportType === "orders") {
      filename = `MOKKO_Orders_Report_${timestamp}.csv`;
      const headers = [
        "Order #",
        "Token",
        "Type",
        "Date",
        "Time",
        "Customer Name",
        "Customer Phone",
        "Items",
        "Subtotal (INR)",
        "Discount (INR)",
        "Coupon Code",
        "CGST 2.5% (INR)",
        "SGST 2.5% (INR)",
        "Total (INR)",
        "Payment Mode",
        "Payment Status",
        "Order Status",
      ];
      csvRows.push(headers.join(","));

      filteredOrders.forEach((o) => {
        const itemsStr = (o.items || [])
          .map((i) => `${i.name} x${i.qty} (₹${i.price})`)
          .join(" | ");

        const row = [
          `"${o.orderNumber || ""}"`,
          `"${o.tokenNumber || ""}"`,
          `"${o.type || ""}"`,
          `"${o.createdAt?.slice(0, 10) || ""}"`,
          `"${o.time || ""}"`,
          `"${(o.customer?.name || "Walk-in").replace(/"/g, '""')}"`,
          `"${o.customer?.phone || ""}"`,
          `"${itemsStr.replace(/"/g, '""')}"`,
          o.summary?.subtotal || 0,
          o.summary?.discount || 0,
          `"${o.couponCode || "None"}"`,
          o.summary?.cgst || 0,
          o.summary?.sgst || 0,
          o.summary?.total || 0,
          `"${(o.payment?.method || "cash").toUpperCase()}"`,
          `"${o.payment?.status || "paid"}"`,
          `"${(o.status || "").toUpperCase()}"`,
        ];
        csvRows.push(row.join(","));
      });
    } else if (exportType === "daily") {
      filename = `MOKKO_Daily_Sales_Summary_${timestamp}.csv`;
      csvRows.push("MOKKO WAFFLES & MORE - DAILY SALES SUMMARY");
      csvRows.push(`Report Generated On,${new Date().toLocaleString("en-IN")}`);
      csvRows.push(`Total Orders,${filteredOrders.length}`);
      csvRows.push(`Total Revenue (INR),₹${totalRevenue.toLocaleString()}`);
      csvRows.push(`Total Discount Given (INR),₹${totalDiscount.toLocaleString()}`);
      csvRows.push(`Total GST Collected (INR),₹${totalGST.toLocaleString()}`);
      csvRows.push(`Average Order Value (INR),₹${aov}`);
      csvRows.push("");
      csvRows.push("Detailed Breakdown By Order:");
      csvRows.push("Order #,Customer,Phone,Items Count,Total (INR),Payment Mode,Status");
      filteredOrders.forEach((o) => {
        csvRows.push(
          `"${o.orderNumber}","${o.customer?.name || "Walk-in"}","${o.customer?.phone || ""}","${(o.items || []).length}","${o.summary?.total || 0}","${(o.payment?.method || "").toUpperCase()}","${o.status}"`
        );
      });
    } else if (exportType === "gst") {
      filename = `MOKKO_GST_Tax_Report_${timestamp}.csv`;
      csvRows.push("MOKKO WAFFLES & MORE - GST COMPLIANCE REPORT");
      csvRows.push(`Shop GSTIN,24AABCU9603R1ZM`);
      csvRows.push(`Report Period,${datePreset === "custom" ? `${customFrom} to ${customTo}` : datePreset}`);
      csvRows.push(`Taxable Turnover (Subtotal - Discount),₹${(totalRevenue - totalGST).toFixed(2)}`);
      csvRows.push(`CGST Rate,2.5%`);
      csvRows.push(`Total CGST Collected,₹${(totalGST / 2).toFixed(2)}`);
      csvRows.push(`SGST Rate,2.5%`);
      csvRows.push(`Total SGST Collected,₹${(totalGST / 2).toFixed(2)}`);
      csvRows.push(`Total GST Liability,₹${totalGST.toFixed(2)}`);
      csvRows.push(`Gross Sales,₹${totalRevenue.toFixed(2)}`);
    }

    const csvContent = csvRows.join("\r\n");
    // UTF-8 BOM so Excel opens Hindi/Rupee/Special chars seamlessly
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Record in recent exports
    setRecentExports((prev) => [
      {
        id: `exp-${Date.now()}`,
        name: filename,
        date: "Just now",
        count: filteredOrders.length,
        type: exportType === "orders" ? "Excel (.csv)" : "Tax/Sales (.csv)",
        size: `${Math.max(1, Math.round(csvContent.length / 1024))} KB`,
      },
      ...prev.slice(0, 4),
    ]);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Reports & Live Excel Export</div>
              <div className="page-subtitle">
                Filter orders by date, mode, or status, and export production-ready Excel & GST sheets
              </div>
            </div>
            <button className="btn btn-secondary" onClick={fetchOrders} title="Refresh data">
              <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh Data
            </button>
          </div>

          {/* Quick Export Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }} className="fade-in">
            <div
              className="card"
              style={{ cursor: "pointer", textAlign: "center", padding: 24, border: "1px solid var(--border)", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-green)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              onClick={() => exportToExcel("orders")}
            >
              <div style={{ color: "var(--accent-green)", marginBottom: 10 }}>
                <Table size={28} style={{ margin: "0 auto" }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Full Orders (Excel)</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                Filtered list with customer details, item breakdown & payment modes
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                <Download size={14} /> Download Excel (.csv)
              </button>
            </div>

            <div
              className="card"
              style={{ cursor: "pointer", textAlign: "center", padding: 24, border: "1px solid var(--border)", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-orange)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              onClick={() => exportToExcel("daily")}
            >
              <div style={{ color: "var(--accent-orange)", marginBottom: 10 }}>
                <FileText size={28} style={{ margin: "0 auto" }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Daily Sales Summary</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                Consolidated revenue, order counts, discounts & payment metrics
              </div>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                <Download size={14} /> Download Summary
              </button>
            </div>

            <div
              className="card"
              style={{ cursor: "pointer", textAlign: "center", padding: 24, border: "1px solid var(--border)", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-blue)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              onClick={() => exportToExcel("gst")}
            >
              <div style={{ color: "var(--accent-blue)", marginBottom: 10 }}>
                <FileText size={28} style={{ margin: "0 auto" }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>GST Tax Sheet</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                Government-ready GST 5% breakdown (2.5% CGST + 2.5% SGST)
              </div>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                <Download size={14} /> Download GST Report
              </button>
            </div>
          </div>

          {/* Metrics summary banner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 20,
            }}
            className="fade-in"
          >
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <IndianRupee size={14} /> Total Sales (Filtered)
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--accent-orange)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                ₹{totalRevenue.toLocaleString()}
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <ShoppingBag size={14} /> Orders Count
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                {filteredOrders.length} orders
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <CreditCard size={14} /> Average Order Value
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--accent-green)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                ₹{aov}
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <FileText size={14} /> GST Collected
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--accent-blue)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                ₹{totalGST.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Interactive Filters Card */}
          <div className="card fade-in" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Filter size={16} color="var(--accent-orange)" /> Filter Data for Custom Export
              </div>
              <span className="badge badge-orange">{filteredOrders.length} orders matching</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
              {/* Search */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Search</label>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Customer, phone, or #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: 32 }}
                  />
                </div>
              </div>

              {/* Date Preset */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Date Preset</label>
                <select className="input-field" value={datePreset} onChange={(e) => setDatePreset(e.target.value)}>
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {/* Payment Type */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Payment Mode</label>
                <select className="input-field" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                  <option value="All">All Modes</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="split">Split</option>
                </select>
              </div>

              {/* Order Status */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Order Status</label>
                <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="ready">Ready</option>
                  <option value="preparing">Preparing</option>
                  <option value="incoming">Incoming</option>
                </select>
              </div>
            </div>

            {/* Custom Date Inputs if selected */}
            {datePreset === "custom" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">From Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">To Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setPaymentFilter("All");
                  setStatusFilter("All");
                  setDatePreset("all");
                  setCustomFrom("");
                  setCustomTo("");
                }}
              >
                Reset Filters
              </button>
              <button className="btn btn-primary" onClick={() => exportToExcel("orders")} style={{ gap: 8 }}>
                <Download size={15} /> Export {filteredOrders.length} Filtered Orders to Excel (.csv)
              </button>
            </div>
          </div>

          {/* Live Preview Table */}
          <div className="card fade-in" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="card-title" style={{ margin: 0 }}>
                Live Data Preview ({filteredOrders.length} Orders)
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Ready to be downloaded</span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                Loading live orders from backend...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                No orders match your filter criteria.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Order #", "Customer", "Date & Time", "Items", "Payment", "Status", "Total"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 12px",
                            textAlign: h === "Total" ? "right" : "left",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(0, 10).map((o) => (
                      <tr
                        key={o.id}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          transition: "background 0.2s",
                        }}
                      >
                        <td style={{ padding: "12px", fontWeight: 700, fontSize: 13, color: "var(--accent-orange)" }}>
                          {o.orderNumber}
                        </td>
                        <td style={{ padding: "12px", fontSize: 13 }}>
                          <div style={{ fontWeight: 600 }}>{o.customer?.name || "Walk-in"}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.customer?.phone || "—"}</div>
                        </td>
                        <td style={{ padding: "12px", fontSize: 12, color: "var(--text-muted)" }}>
                          {o.createdAt?.slice(0, 10)} {o.time || ""}
                        </td>
                        <td style={{ padding: "12px", fontSize: 12 }}>
                          {(o.items || []).map((i) => `${i.name} (x${i.qty})`).join(", ")}
                        </td>
                        <td style={{ padding: "12px", fontSize: 12 }}>
                          <span className={`badge ${o.payment?.method === "upi" ? "badge-blue" : "badge-green"}`}>
                            {(o.payment?.method || "cash").toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: 12 }}>
                          <span
                            className={`badge ${
                              o.status === "completed"
                                ? "badge-green"
                                : o.status === "ready"
                                ? "badge-blue"
                                : "badge-orange"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight: 800,
                            fontSize: 14,
                            color: "var(--text-primary)",
                            fontFamily: "Space Grotesk",
                          }}
                        >
                          ₹{o.summary?.total || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length > 10 && (
                  <div style={{ textAlign: "center", padding: "12px 0", fontSize: 12, color: "var(--text-muted)" }}>
                    Showing first 10 of {filteredOrders.length} orders. Full dataset will be exported to Excel.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Exports Log */}
          <div className="card fade-in">
            <div className="card-title">Recent Downloads & Export Activity</div>
            {recentExports.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "10px 0" }}>
                No exports run in this session yet. Click any button above to generate a real Excel or CSV file.
              </div>
            ) : (
              recentExports.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontSize: 24 }}>📊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {f.date} · {f.count} rows · {f.size} · {f.type}
                    </div>
                  </div>
                  <span className="badge badge-green">✓ Downloaded</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
