"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { menuItems } from "@/lib/mockData";
import { Plus, Search, ToggleLeft, ToggleRight } from "lucide-react";

const categories = ["All", "Waffles", "Desserts", "Beverages", "Combos"];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState(menuItems);
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Menu Management</div>
              <div className="page-subtitle">{items.length} items · {items.filter(i => i.available).length} available</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary">
                <Plus size={15} /> Add Combo
              </button>
              <button className="btn btn-primary">
                <Plus size={15} /> Add Item
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 20 }} className="fade-in">
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input-field"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          {/* Category Tabs */}
          <div className="category-tabs fade-in">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "Waffles" ? "🧇" : cat === "Desserts" ? "🍮" : cat === "Beverages" ? "🥤" : cat === "Combos" ? "🎉" : "✨"} {cat}
                {cat !== "All" && (
                  <span style={{ marginLeft: 6, opacity: 0.6 }}>
                    ({items.filter(i => i.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="menu-grid">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className={`menu-item-card fade-in`}
                style={{ animationDelay: `${i * 0.04}s`, opacity: item.available ? 1 : 0.5 }}
              >
                {/* Toggle */}
                <div className="menu-item-toggle">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {/* Image */}
                <div className="menu-item-img">{item.emoji}</div>

                <div className="menu-item-body">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="badge badge-purple" style={{ fontSize: 10 }}>{item.category}</span>
                    {!item.available && (
                      <span className="badge badge-red" style={{ fontSize: 10 }}>Sold Out</span>
                    )}
                  </div>
                  <div className="menu-item-name">{item.name}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div className="menu-item-price">₹{item.price}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {item.sold} sold
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: "6px 0", fontSize: 12, justifyContent: "center" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn"
                      style={{
                        flex: 1, padding: "6px 0", fontSize: 12, justifyContent: "center",
                        background: "var(--accent-orange-glow)", color: "var(--accent-orange)",
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No items found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try a different search or category</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
