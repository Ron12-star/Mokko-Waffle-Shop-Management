"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingBag,
  Target, Clock, RefreshCw, Flame, Award, PieChart as PieIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

function StatCard({ label, value, icon, color, badge, badgeUp }: any) {
  return (
    <div className={`stat-card ${color} fade-in`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {badge && (
        <span className={`stat-badge ${badgeUp ? "up" : "down"}`}>
          {badgeUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {badge}
        </span>
      )}
      <div className={`stat-icon ${color}`}>{icon}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
      }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color || "var(--accent-orange)" }}>
            {p.name}: <strong>₹{p.value?.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const WaffleTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--accent-orange)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
      }}>
        <p style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 4 }}>
          🧇 {label} ({data?.date})
        </p>
        <p style={{ color: "var(--accent-orange)" }}>
          Waffles Sold: <strong>{data?.count} units</strong>
        </p>
        <p style={{ color: "#10b981" }}>
          Revenue: <strong>₹{data?.revenue?.toLocaleString()}</strong>
        </p>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Small: {data?.smallQty} | Big: {data?.bigQty}
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    wafflesSold: 0,
    dessertsSold: 0,
    beveragesSold: 0,
    aov: 0,
    cashSales: 0,
    upiSales: 0,
    target: 150000,
    weeklySales: [
      { day: "Mon", date: "Oct 19", sales: 0, orders: 0, waffles: 0 },
      { day: "Tue", date: "Oct 20", sales: 0, orders: 0, waffles: 0 },
      { day: "Wed", date: "Oct 21", sales: 0, orders: 0, waffles: 0 },
      { day: "Thu", date: "Today", sales: 0, orders: 0, waffles: 0 },
      { day: "Fri", date: "Oct 23", sales: 0, orders: 0, waffles: 0 },
      { day: "Sat", date: "Oct 24", sales: 0, orders: 0, waffles: 0 },
      { day: "Sun", date: "Oct 25", sales: 0, orders: 0, waffles: 0 },
    ],
    monthlySales: [
      { name: "Week 1", sales: 0 },
      { name: "Week 2", sales: 0 },
      { name: "Week 3", sales: 0 },
      { name: "Week 4 (Current)", sales: 0 },
    ],
  });

  const [waffleAnalytics, setWaffleAnalytics] = useState<any>({
    todayWafflesSold: 0,
    todayWaffleRevenue: 0,
    waffleSharePercentage: 0,
    dailyTrend: [
      { day: "Mon", date: "Oct 19", count: 0, revenue: 0, smallQty: 0, bigQty: 0 },
      { day: "Tue", date: "Oct 20", count: 0, revenue: 0, smallQty: 0, bigQty: 0 },
      { day: "Wed", date: "Oct 21", count: 0, revenue: 0, smallQty: 0, bigQty: 0 },
      { day: "Thu", date: "Today", count: 0, revenue: 0, smallQty: 0, bigQty: 0 },
      { day: "Fri", date: "Oct 23", count: 0, revenue: 0, smallQty: 0, bigQty: 0 },
      { day: "Sat", date: "Oct 24", count: 0, revenue: 0, smallQty: 0, bigQty: 0 },
      { day: "Sun", date: "Oct 25", count: 0, revenue: 0, smallQty: 0, bigQty: 0 },
    ],
    topFlavors: [],
    sizeDistribution: {
      small: { count: 0, percent: 0, label: "Small Size" },
      big: { count: 0, percent: 0, label: "Big Size" },
    },
    peakWaffleHour: "--",
  });

  const [salesTab, setSalesTab] = useState<"weekly" | "monthly">("weekly");

  // Fetch real data from backend
  const loadDashboardData = async () => {
    try {
      const [statsRes, waffleRes] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getDailyWaffleAnalytics().catch(() => null),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (waffleRes?.waffleAnalytics) setWaffleAnalytics(waffleRes.waffleAnalytics);
    } catch (e) {
      console.warn("Could not load backend analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadDashboardData();

    // Listen for real-time order creation to refresh stats dynamically
    const socket = getSocket();
    const handleNewOrder = () => {
      loadDashboardData();
    };

    socket.on("order:created", handleNewOrder);
    socket.on("order:status_updated", handleNewOrder);

    return () => {
      socket.off("order:created", handleNewOrder);
      socket.off("order:status_updated", handleNewOrder);
    };
  }, []);

  const progressPct = Math.min(
    100,
    Math.round(((stats.totalRevenue || 0) / (stats.target || 150000)) * 100)
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>MOKKO Executive Dashboard</span>
                <span className="badge badge-green">● Live Realtime</span>
              </div>
              <div className="page-subtitle">
                Sales Overview &amp; Daily Waffle Performance Analytics
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={loadDashboardData}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* Top High-level Stats */}
          <div className="stats-grid">
            <StatCard
              label="Today's Revenue"
              color="orange"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              icon={<IndianRupee size={18} color="var(--accent-orange)" />}
            />
            <StatCard
              label="Total Orders"
              color="purple"
              value={stats.totalOrders}
              icon={<ShoppingBag size={18} color="var(--accent-purple)" />}
            />
            <StatCard
              label="Waffles Sold Today"
              color="amber"
              value={`${stats.wafflesSold} 🧇`}
              icon="🧇"
            />
            <StatCard
              label="Avg Order Value"
              color="green"
              value={`₹${stats.aov}`}
              icon={<Target size={18} color="var(--accent-green)" />}
            />
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* 🧇 DEDICATED DAILY BASIS WAFFLE SELLING SECTION                   */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div
            className="fade-in"
            style={{
              background: "linear-gradient(135deg, rgba(74, 35, 17, 0.45) 0%, rgba(39, 22, 13, 0.85) 100%)",
              border: "1px solid rgba(212, 122, 42, 0.35)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 28px",
              marginBottom: 28,
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            {/* Section Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>🧇</span>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--brand-cream)", letterSpacing: "-0.5px" }}>
                    Daily Basis Waffle Selling Performance
                  </h2>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: "rgba(212, 122, 42, 0.25)",
                      color: "var(--accent-orange)",
                      border: "1px solid rgba(212, 122, 42, 0.4)",
                    }}
                  >
                    DAILY TRACKER
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                  Day-by-day waffle sales volume, flavor breakdown, and Small vs Big size customer preferences
                </div>
              </div>

              {/* Quick Summary Pill */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  background: "rgba(0,0,0,0.3)",
                  padding: "8px 16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Waffle Revenue</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-orange)" }}>
                    ₹{waffleAnalytics.todayWaffleRevenue?.toLocaleString()}
                  </div>
                </div>
                <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Share of Total Sales</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>
                    {waffleAnalytics.waffleSharePercentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Waffle Chart + Leaderboard + Size Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
              {/* Daily Waffle Sales Bar Chart (7-day trend) */}
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: 12,
                  padding: 18,
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                    Daily Waffle Sales (Units Sold This Week)
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Peak Hour: <strong>{waffleAnalytics.peakWaffleHour}</strong>
                  </div>
                </div>

                {mounted && (
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={waffleAnalytics.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 237, 226, 0.05)" />
                      <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                      <Tooltip content={<WaffleTooltip />} />
                      <Bar
                        dataKey="count"
                        name="Waffles Sold"
                        fill="var(--accent-orange)"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Flavor Leaderboard & Small vs Big Sizes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Size Distribution Meter */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    borderRadius: 12,
                    padding: 14,
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      Waffle Sizes Ratio
                    </span>
                    <span style={{ color: "var(--accent-orange)", fontWeight: 700 }}>
                      Small {waffleAnalytics.sizeDistribution?.small?.percent}% · Big {waffleAnalytics.sizeDistribution?.big?.percent}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        width: `${waffleAnalytics.sizeDistribution?.small?.percent}%`,
                        background: "#8b5cf6",
                        height: "100%",
                      }}
                      title={`Small: ${waffleAnalytics.sizeDistribution?.small?.count} units`}
                    />
                    <div
                      style={{
                        width: `${waffleAnalytics.sizeDistribution?.big?.percent}%`,
                        background: "var(--accent-orange)",
                        height: "100%",
                      }}
                      title={`Big: ${waffleAnalytics.sizeDistribution?.big?.count} units`}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>
                    <span>🟣 Small: {waffleAnalytics.sizeDistribution?.small?.count} sold</span>
                    <span>🟠 Big: {waffleAnalytics.sizeDistribution?.big?.count} sold</span>
                  </div>
                </div>

                {/* Top Selling Waffle Flavors Today */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    borderRadius: 12,
                    padding: 14,
                    border: "1px solid var(--border)",
                    flex: 1,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--text-primary)" }}>
                    🏆 Top Waffle Flavors Today
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {waffleAnalytics.topFlavors?.slice(0, 4).map((f: any, idx: number) => (
                      <div
                        key={f.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 12,
                          padding: "4px 0",
                          borderBottom: idx < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14 }}>{f.emoji}</span>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, color: "var(--accent-orange)" }}>{f.soldToday} sold</span>
                          <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>{f.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart + Monthly Target Progress */}
          <div className="charts-grid" style={{ marginBottom: 28 }}>
            <div className="card fade-in">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div className="card-title" style={{ margin: 0 }}>Sales Overview</div>
                <div className="tab-group">
                  <button
                    className={`tab-btn ${salesTab === "weekly" ? "active" : ""}`}
                    onClick={() => setSalesTab("weekly")}
                  >
                    Weekly
                  </button>
                  <button
                    className={`tab-btn ${salesTab === "monthly" ? "active" : ""}`}
                    onClick={() => setSalesTab("monthly")}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {mounted && (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={
                      salesTab === "weekly"
                        ? (stats.weeklySales || [
                            { day: "Mon", sales: 0 },
                            { day: "Tue", sales: 0 },
                            { day: "Wed", sales: 0 },
                            { day: "Thu", sales: stats.totalRevenue || 0 },
                            { day: "Fri", sales: 0 },
                            { day: "Sat", sales: 0 },
                            { day: "Sun", sales: 0 },
                          ])
                        : (stats.monthlySales || [
                            { name: "Week 1", sales: 0 },
                            { name: "Week 2", sales: 0 },
                            { name: "Week 3", sales: 0 },
                            { name: "Week 4 (Current)", sales: stats.totalRevenue || 0 },
                          ])
                    }
                  >
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 237, 226, 0.05)" />
                    <XAxis
                      dataKey={salesTab === "weekly" ? "day" : "name"}
                      stroke="var(--text-muted)"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="Revenue"
                      stroke="var(--accent-orange)"
                      strokeWidth={2.5}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly Target Gauge Card */}
            <div className="card fade-in">
              <div className="card-title">🎯 Monthly Target</div>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: "var(--accent-orange)", lineHeight: 1 }}>
                  {progressPct}%
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
                  ₹{stats.totalRevenue?.toLocaleString()} of ₹{stats.target?.toLocaleString()} Target
                </div>

                <div
                  style={{
                    height: 12,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    margin: "20px 0 16px",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, var(--accent-orange), #10b981)",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "left", marginTop: 16 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>💵 Cash Collected</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                      ₹{stats.cashSales?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>📱 UPI Received</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                      ₹{stats.upiSales?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
