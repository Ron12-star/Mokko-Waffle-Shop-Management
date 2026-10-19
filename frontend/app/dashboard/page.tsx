"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import {
  todayStats, weeklySales, monthlySales,
  bestSellers, peakHourData, menuItems,
} from "@/lib/mockData";
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Target, Clock } from "lucide-react";

const MONTHLY_TARGET = 150000;

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
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "10px 14px", fontSize: 13,
      }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>₹{p.value?.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [salesTab, setSalesTab] = useState<"weekly" | "monthly">("weekly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const heatMax = Math.max(...peakHourData.map((h) => h.value));

  const getHeatColor = (value: number) => {
    const intensity = value / heatMax;
    if (intensity > 0.8) return `rgba(255,107,53,0.9)`;
    if (intensity > 0.6) return `rgba(255,107,53,0.65)`;
    if (intensity > 0.4) return `rgba(255,107,53,0.4)`;
    if (intensity > 0.2) return `rgba(255,107,53,0.2)`;
    return `rgba(255,107,53,0.07)`;
  };

  const progressPct = Math.min(
    100,
    Math.round((todayStats.totalSales / MONTHLY_TARGET) * 100)
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Dashboard</div>
              <div className="page-subtitle">
                Thursday, 15 October 2026 &nbsp;·&nbsp; Live Overview
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <span className="badge badge-green">● Live</span>
              <span className="badge badge-orange">🧇 Kitchen: 4 orders</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard
              label="Today's Revenue" color="orange"
              value={`₹${todayStats.totalSales.toLocaleString()}`}
              icon={<IndianRupee size={18} color="var(--accent-orange)" />}
              badge="+14% vs yesterday" badgeUp
            />
            <StatCard
              label="Total Orders" color="purple"
              value={todayStats.totalOrders}
              icon={<ShoppingBag size={18} color="var(--accent-purple)" />}
              badge="+8 vs yesterday" badgeUp
            />
            <StatCard
              label="Waffles Sold" color="amber"
              value={todayStats.wafflesSold}
              icon="🧇"
              badge="+5% this week" badgeUp
            />
            <StatCard
              label="Avg Order Value" color="green"
              value={`₹${todayStats.aov}`}
              icon={<Target size={18} color="var(--accent-green)" />}
              badge="-3% vs last week" badgeUp={false}
            />
          </div>

          {/* Sales Chart + Best Sellers */}
          <div className="charts-grid">
            {/* Sales Chart */}
            <div className="card fade-in fade-in-delay-1">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div className="card-title" style={{ margin: 0 }}>Sales Overview</div>
                <div className="tab-group">
                  <button
                    className={`tab-btn ${salesTab === "weekly" ? "active" : ""}`}
                    onClick={() => setSalesTab("weekly")}
                  >Weekly</button>
                  <button
                    className={`tab-btn ${salesTab === "monthly" ? "active" : ""}`}
                    onClick={() => setSalesTab("monthly")}
                  >Monthly</button>
                </div>
              </div>
              {mounted && (
                <ResponsiveContainer width="100%" height={240}>
                  {salesTab === "weekly" ? (
                    <AreaChart data={weeklySales}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="sales" name="Revenue" stroke="#ff6b35" strokeWidth={2} fill="url(#salesGrad)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sales" name="Revenue" fill="#ff6b35" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {/* Best Sellers */}
            <div className="card fade-in fade-in-delay-2">
              <div className="card-title">🏆 Best Sellers</div>
              <div className="rank-list">
                {bestSellers.map((item, i) => (
                  <div className="rank-item" key={item.name}>
                    <div className={`rank-num ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                      {i + 1}
                    </div>
                    <div className="rank-bar-wrap">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="rank-name">{item.name}</div>
                        <span className={item.trend === "up" ? "trend-up" : "trend-down"}>
                          {item.trend === "up" ? "↑" : "↓"} {item.change}
                        </span>
                      </div>
                      <div className="rank-bar">
                        <div
                          className="rank-bar-fill"
                          style={{ width: `${(item.count / 350) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="rank-count">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hour Heatmap + Revenue vs Target + Waffle vs Dessert chart */}
          <div className="charts-grid-3">
            {/* Peak Hour */}
            <div className="card fade-in fade-in-delay-1">
              <div className="card-title">⏰ Peak Hours Today</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginBottom: 10 }}>
                {peakHourData.map((h) => (
                  <div key={h.hour} style={{ textAlign: "center" }}>
                    <div
                      className="heat-cell"
                      style={{
                        background: getHeatColor(h.value),
                        width: "100%", height: 40, borderRadius: 6,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                        color: h.value > heatMax * 0.5 ? "white" : "var(--text-muted)",
                      }}
                    >
                      {h.value}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3 }}>{h.hour}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={12} /> Peak: <strong style={{ color: "var(--accent-orange)" }}>7 PM (28 orders)</strong>
              </div>
            </div>

            {/* Revenue vs Target */}
            <div className="card fade-in fade-in-delay-2">
              <div className="card-title">🎯 Monthly Target</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", width: 140, height: 70 }}>
                  <svg viewBox="0 0 140 70" width={140} height={70}>
                    <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="var(--bg-primary)" strokeWidth={12} strokeLinecap="round" />
                    <path
                      d="M 10 70 A 60 60 0 0 1 130 70"
                      fill="none"
                      stroke="url(#gaugeGrad)"
                      strokeWidth={12}
                      strokeLinecap="round"
                      strokeDasharray={`${(progressPct / 100) * 188} 188`}
                    />
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ff6b35" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-orange)", fontFamily: "Space Grotesk" }}>
                      {progressPct}%
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "center", width: "100%" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                    ₹{todayStats.totalSales.toLocaleString()} / ₹{MONTHLY_TARGET.toLocaleString()}
                  </div>
                  <div style={{ height: 6, background: "var(--bg-primary)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${progressPct}%`,
                      background: "linear-gradient(90deg, var(--accent-orange), var(--accent-amber))",
                      borderRadius: 99, transition: "width 1s ease",
                    }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
                  <div style={{ background: "var(--bg-glass)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Cash</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>₹{(todayStats.cashSales / 1000).toFixed(1)}k</div>
                  </div>
                  <div style={{ background: "var(--bg-glass)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>UPI</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>₹{(todayStats.upiSales / 1000).toFixed(1)}k</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Waffles vs Desserts */}
            <div className="card fade-in fade-in-delay-3">
              <div className="card-title">🍽️ Category Split</div>
              {mounted && (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklySales} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
                    <Bar dataKey="waffles" name="Waffles" fill="#ff6b35" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="desserts" name="Desserts" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Today's Special + Slow movers */}
          <div className="charts-grid">
            <div className="card fade-in">
              <div className="card-title">⭐ Today&apos;s Specials</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {menuItems.filter((_, i) => i < 4).map((item) => (
                  <div key={item.id} style={{
                    background: "var(--bg-glass)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 10,
                    flex: "1 1 180px",
                  }}>
                    <span style={{ fontSize: 30 }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                      <div style={{ color: "var(--accent-orange)", fontWeight: 700, fontSize: 14, fontFamily: "Space Grotesk" }}>
                        ₹{item.price}
                      </div>
                    </div>
                    <span className="badge badge-orange" style={{ marginLeft: "auto" }}>Special</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card fade-in fade-in-delay-1">
              <div className="card-title">🐢 Slow Moving Items</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {menuItems
                  .sort((a, b) => a.sold - b.sold)
                  .slice(0, 4)
                  .map((item) => (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 8, background: "var(--bg-glass)",
                    }}>
                      <span style={{ fontSize: 20 }}>{item.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Only {item.sold} sold this month
                        </div>
                      </div>
                      <span className="badge badge-red">Low</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
