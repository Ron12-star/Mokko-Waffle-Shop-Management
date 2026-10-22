"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { AlertTriangle, Plus, RefreshCw, X, Package, DollarSign, TrendingDown } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
  supplier: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);

  // New item form state
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("kg");
  const [newStock, setNewStock] = useState<number>(10);
  const [newMinStock, setNewMinStock] = useState<number>(5);
  const [newCost, setNewCost] = useState<number>(100);
  const [newSupplier, setNewSupplier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getInventory();
      if (res?.success && Array.isArray(res.inventory)) {
        setInventory(res.inventory);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleUpdateStock = async (id: number, val: number) => {
    try {
      const res = await api.updateStock(id, val);
      if (res?.success) {
        setInventory((prev) =>
          prev.map((item) => (item.id === id ? { ...item, stock: res.item.stock } : item))
        );
        setEditingStockId(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update stock");
    }
  };

  const handleQuickAdd = async (id: number, currentStock: number, addAmount: number) => {
    await handleUpdateStock(id, currentStock + addAmount);
  };

  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.addIngredient({
        name: newName.trim(),
        unit: newUnit,
        stock: Number(newStock),
        minStock: Number(newMinStock),
        costPerUnit: Number(newCost),
        supplier: newSupplier.trim() || "Local Vendor",
      });
      if (res?.success) {
        setFeedback(`✓ Added ${res.item.name} to inventory!`);
        setIsModalOpen(false);
        setNewName("");
        setNewSupplier("");
        loadInventory();
        setTimeout(() => setFeedback(""), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to add ingredient");
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockItems = inventory.filter((i) => i.stock <= i.minStock);
  const totalValuation = inventory.reduce((sum, i) => sum + i.stock * (i.costPerUnit || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Inventory & Stock Control</div>
              <div className="page-subtitle">
                {inventory.length} raw ingredients · {lowStockItems.length} low stock warnings
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" onClick={loadInventory}>
                <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
              </button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={15} /> Add Ingredient
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

          {/* Quick Stats Banner */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }} className="fade-in">
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <Package size={14} /> Total Items Monitored
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                {inventory.length} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>ingredients</span>
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingDown size={14} color="var(--accent-red)" /> Low Stock Alerts
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: lowStockItems.length > 0 ? "var(--accent-red)" : "var(--accent-green)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                {lowStockItems.length} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>need reorder</span>
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <DollarSign size={14} /> Inventory Valuation
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent-orange)", fontFamily: "Space Grotesk", marginTop: 4 }}>
                ₹{totalValuation.toLocaleString()}
              </div>
            </div>
          </div>

          {lowStockItems.length > 0 && (
            <div
              style={{
                background: "var(--accent-red-glow)",
                border: "1px solid var(--accent-red)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "var(--accent-red)",
                fontWeight: 600,
              }}
              className="fade-in"
            >
              <AlertTriangle size={18} />
              <span>
                <strong>{lowStockItems.length} ingredient(s)</strong> are currently running below safety buffer! Restock to avoid kitchen delays.
              </span>
            </div>
          )}

          {/* Inventory Table */}
          <div className="card fade-in fade-in-delay-1">
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                Loading live inventory from backend...
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Ingredient", "Supplier", "Current Stock", "Min Threshold", "Cost / Unit", "Status", "Quick Adjust"].map(
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
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const isLow = item.stock <= item.minStock;
                      const maxCapacity = Math.max(item.minStock * 3, item.stock);
                      const pct = Math.min(100, Math.round((item.stock / maxCapacity) * 100));

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            transition: "background 0.2s",
                          }}
                        >
                          <td style={{ padding: "12px", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                            {item.name}
                          </td>
                          <td style={{ padding: "12px", fontSize: 12, color: "var(--text-muted)" }}>
                            {item.supplier || "Standard"}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {editingStockId === item.id ? (
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input
                                  type="number"
                                  className="input-field"
                                  style={{ width: 70, padding: "4px 8px", fontSize: 13 }}
                                  value={tempStock}
                                  onChange={(e) => setTempStock(Number(e.target.value))}
                                />
                                <button
                                  className="btn btn-primary"
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  onClick={() => handleUpdateStock(item.id, tempStock)}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  onClick={() => setEditingStockId(null)}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div
                                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                                onClick={() => {
                                  setEditingStockId(item.id);
                                  setTempStock(item.stock);
                                }}
                                title="Click to edit"
                              >
                                <div style={{ width: 80, height: 6, background: "var(--bg-primary)", borderRadius: 99, overflow: "hidden" }}>
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${pct}%`,
                                      background: isLow ? "var(--accent-red)" : "var(--accent-green)",
                                      borderRadius: 99,
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: isLow ? "var(--accent-red)" : "var(--text-primary)",
                                  }}
                                >
                                  {item.stock} {item.unit}
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px", fontSize: 13, color: "var(--text-muted)" }}>
                            {item.minStock} {item.unit}
                          </td>
                          <td style={{ padding: "12px", fontSize: 13, fontWeight: 600 }}>
                            ₹{item.costPerUnit}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span className={`badge ${isLow ? "badge-red" : "badge-green"}`}>
                              {isLow ? "⚠ Low Stock" : "✓ In Stock"}
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: "4px 8px", fontSize: 11 }}
                                onClick={() => handleQuickAdd(item.id, item.stock, 5)}
                                title="Add +5 units"
                              >
                                +5
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: "4px 8px", fontSize: 11 }}
                                onClick={() => handleQuickAdd(item.id, item.stock, 10)}
                                title="Add +10 units"
                              >
                                +10
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Ingredient Modal */}
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
                  width: 460,
                  maxWidth: "92vw",
                  padding: 24,
                  border: "1px solid var(--border)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Add Inventory Ingredient</div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateIngredient}>
                  <div className="input-group">
                    <label className="input-label">Ingredient / Raw Material Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Dark Chocolate Chips"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="input-group">
                      <label className="input-label">Unit of Measure</label>
                      <select className="input-field" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
                        <option value="kg">kg (Kilograms)</option>
                        <option value="Liters">Liters</option>
                        <option value="pcs">pcs (Pieces)</option>
                        <option value="Tubs">Tubs</option>
                        <option value="Packets">Packets</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Cost / Unit (₹)</label>
                      <input
                        type="number"
                        className="input-field"
                        required
                        value={newCost}
                        onChange={(e) => setNewCost(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="input-group">
                      <label className="input-label">Initial Stock</label>
                      <input
                        type="number"
                        className="input-field"
                        required
                        value={newStock}
                        onChange={(e) => setNewStock(Number(e.target.value))}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Min Alert Threshold</label>
                      <input
                        type="number"
                        className="input-field"
                        required
                        value={newMinStock}
                        onChange={(e) => setNewMinStock(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Supplier / Vendor Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Callebaut India"
                      value={newSupplier}
                      onChange={(e) => setNewSupplier(e.target.value)}
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
                      {submitting ? "Saving..." : "Add to Inventory"}
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
