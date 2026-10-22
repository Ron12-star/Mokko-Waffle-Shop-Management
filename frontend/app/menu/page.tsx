"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderPlus,
  Sparkles,
  Layers,
  CheckCircle,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { api, MenuItemData, CategoryData, ToppingData } from "@/lib/api";
import { useToast } from "@/lib/toastContext";

export default function MenuPage() {
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [toppings, setToppings] = useState<ToppingData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"menu" | "toppings">("menu");

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("✨");

  const [showToppingModal, setShowToppingModal] = useState(false);
  const [newToppingName, setNewToppingName] = useState("");
  const [newToppingPrice, setNewToppingPrice] = useState("");
  const [newToppingEmoji, setNewToppingEmoji] = useState("🍫");

  // Item form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Waffles");
  const [formPriceType, setFormPriceType] = useState<"single" | "sizes">("single");
  const [formPrice, setFormPrice] = useState("");
  const [formSmallPrice, setFormSmallPrice] = useState("");
  const [formBigPrice, setFormBigPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEmoji, setFormEmoji] = useState("🧇");

  // Load data from Backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [menuRes, catRes, topRes] = await Promise.all([
        api.getMenu(),
        api.getCategories(),
        api.getToppings(),
      ]);
      setItems(menuRes.items || []);
      setCategories(catRes.categories || []);
      setToppings(topRes.toppings || []);
    } catch (err: any) {
      showError(err.message || "Failed to load menu from backend", "Backend Connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items
  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "All" || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Toggle Item Availability
  const handleToggleItem = async (id: number) => {
    try {
      const res = await api.toggleMenuItem(id);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, available: res.item.available } : i))
      );
      showSuccess(
        `${res.item.name} is now ${res.item.available ? "In Stock (Available)" : "Sold Out (Hidden)"}`
      );
    } catch (err: any) {
      showError(err.message, "Toggle Failed");
    }
  };

  // Open Item Modal (Add or Edit)
  const openItemModal = (item?: MenuItemData) => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormCategory(item.category);
      if (item.sizes && (item.sizes.small || item.sizes.big)) {
        setFormPriceType("sizes");
        setFormSmallPrice(item.sizes.small?.toString() || "");
        setFormBigPrice(item.sizes.big?.toString() || "");
        setFormPrice(item.price.toString());
      } else {
        setFormPriceType("single");
        setFormPrice(item.price.toString());
        setFormSmallPrice("");
        setFormBigPrice("");
      }
      setFormDescription(item.description || "");
      setFormEmoji(item.emoji || "🧇");
    } else {
      setEditingItem(null);
      setFormName("");
      setFormCategory(categories[0]?.name || "Waffles");
      setFormPriceType("single");
      setFormPrice("");
      setFormSmallPrice("");
      setFormBigPrice("");
      setFormDescription("");
      setFormEmoji("🧇");
    }
    setShowItemModal(true);
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showError("Item name is required", "Validation Error");
      return;
    }

    const payload: Partial<MenuItemData> = {
      name: formName.trim(),
      category: formCategory,
      description: formDescription.trim(),
      emoji: formEmoji || "✨",
    };

    if (formPriceType === "sizes") {
      const small = Number(formSmallPrice);
      const big = Number(formBigPrice);
      if (!small || !big) {
        showError("Please enter both Small and Big size prices", "Validation Error");
        return;
      }
      payload.sizes = { small, big };
      payload.price = small; // base price
    } else {
      const price = Number(formPrice);
      if (!price) {
        showError("Please enter an item price", "Validation Error");
        return;
      }
      payload.price = price;
      payload.sizes = null;
    }

    try {
      if (editingItem) {
        const res = await api.updateMenuItem(editingItem.id, payload);
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? res.item : i)));
        showSuccess(`Updated ${res.item.name} successfully`);
      } else {
        const res = await api.createMenuItem(payload);
        setItems((prev) => [...prev, res.item]);
        showSuccess(`Added ${res.item.name} to menu`);
      }
      setShowItemModal(false);
    } catch (err: any) {
      showError(err.message, "Save Failed");
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;
    try {
      await api.deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showSuccess(`Deleted "${name}"`);
    } catch (err: any) {
      showError(err.message, "Delete Failed");
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showError("Category name is required", "Validation Error");
      return;
    }
    try {
      const res = await api.createCategory({ name: newCatName.trim(), emoji: newCatEmoji });
      setCategories((prev) => [...prev, res.category]);
      setNewCatName("");
      setShowCategoryModal(false);
      showSuccess(`New menu type "${res.category.name}" added!`);
    } catch (err: any) {
      showError(err.message, "Category Error");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Menu items under this category won't be deleted.`)) return;
    try {
      await api.deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId && c.name !== catName));
      if (activeCategory === catName) setActiveCategory("All");
      showSuccess(`Deleted category "${catName}"`);
    } catch (err: any) {
      showError(err.message, "Delete Error");
    }
  };

  // Add Topping (Reserved)
  const handleAddTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToppingName.trim() || !newToppingPrice) {
      showError("Topping name and price are required", "Validation Error");
      return;
    }
    try {
      const res = await api.addTopping({
        name: newToppingName.trim(),
        price: Number(newToppingPrice),
        emoji: newToppingEmoji,
        available: true,
        isReserved: true,
      });
      setToppings((prev) => [...prev, res.topping]);
      setNewToppingName("");
      setNewToppingPrice("");
      setShowToppingModal(false);
      showSuccess(`Added "${res.topping.name}" to reserved toppings pool!`);
    } catch (err: any) {
      showError(err.message, "Error Adding Topping");
    }
  };

  // Toggle Topping Availability
  const handleToggleTopping = async (id: number) => {
    try {
      const res = await api.toggleTopping(id);
      setToppings((prev) =>
        prev.map((t) => (t.id === id ? { ...t, available: res.topping.available } : t))
      );
      showSuccess(`${res.topping.name} availability toggled`);
    } catch (err: any) {
      showError(err.message, "Toggle Error");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>MOKKO Menu Studio</span>
                <span className="badge badge-orange" style={{ fontSize: 11, fontWeight: 700 }}>
                  Live Menu
                </span>
              </div>
              <div className="page-subtitle">
                {items.length} total items · {items.filter((i) => i.available).length} active ·{" "}
                {categories.length} categories/types
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary"
                onClick={loadData}
                title="Refresh from Backend"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCategoryModal(true)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FolderPlus size={15} /> Add Type / Category
              </button>
              <button
                className="btn btn-primary"
                onClick={() => openItemModal()}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={15} /> Add Menu Item
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs: Menu Items vs Extra Toppings */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              onClick={() => setActiveTab("menu")}
              className={`cat-tab ${activeTab === "menu" ? "active" : ""}`}
              style={{ fontWeight: 600, padding: "8px 18px" }}
            >
              🧇 Menu Items &amp; Categories ({items.length})
            </button>
            <button
              onClick={() => setActiveTab("toppings")}
              className={`cat-tab ${activeTab === "toppings" ? "active" : ""}`}
              style={{ fontWeight: 600, padding: "8px 18px", display: "flex", alignItems: "center", gap: 8 }}
            >
              <span>🍫 Extra Toppings</span>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 20,
                  background: "rgba(212, 122, 42, 0.25)",
                  color: "var(--accent-orange)",
                  border: "1px solid rgba(212, 122, 42, 0.4)",
                  letterSpacing: "0.5px",
                }}
              >
                RESERVED
              </span>
            </button>
          </div>

          {activeTab === "menu" ? (
            <>
              {/* Search Bar */}
              <div style={{ position: "relative", marginBottom: 20 }} className="fade-in">
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  className="input-field"
                  placeholder="Search waffles, brownies, shakes, coffee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
              </div>

              {/* Category Tabs */}
              <div className="category-tabs fade-in" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                <button
                  className={`cat-tab ${activeCategory === "All" ? "active" : ""}`}
                  onClick={() => setActiveCategory("All")}
                >
                  ✨ All Items ({items.length})
                </button>
                {categories.map((cat) => {
                  const count = items.filter((i) => i.category.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <div key={cat.id || cat.name} style={{ display: "inline-flex", alignItems: "center" }}>
                      <button
                        className={`cat-tab ${activeCategory === cat.name ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat.name)}
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      >
                        {cat.emoji} {cat.name}
                        <span style={{ marginLeft: 6, opacity: 0.65 }}>({count})</span>
                      </button>
                      <button
                        title={`Delete ${cat.name} type`}
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          borderLeft: "none",
                          color: "var(--text-muted)",
                          padding: "8px 8px",
                          borderRadius: "0 8px 8px 0",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Menu Grid */}
              <div className="menu-grid">
                {filtered.map((item, i) => (
                  <div
                    key={item.id}
                    className="menu-item-card fade-in"
                    style={{
                      animationDelay: `${Math.min(i * 0.02, 0.4)}s`,
                      opacity: item.available ? 1 : 0.6,
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      padding: 16,
                      position: "relative",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Top action row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "rgba(212, 122, 42, 0.15)",
                          color: "var(--accent-orange)",
                          border: "1px solid rgba(212, 122, 42, 0.25)",
                        }}
                      >
                        {item.category}
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          className="btn-icon"
                          onClick={() => openItemModal(item)}
                          title="Edit Item"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "none",
                            color: "var(--text-secondary)",
                            padding: 6,
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          title="Delete Item"
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "none",
                            color: "#ef4444",
                            padding: 6,
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                        <label className="toggle" title="Live Stock Toggle">
                          <input
                            type="checkbox"
                            checked={item.available}
                            onChange={() => handleToggleItem(item.id)}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>

                    {/* Emoji + Item Name */}
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 28,
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: "rgba(246, 237, 226, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: "1px solid var(--border)",
                        }}
                      >
                        {item.emoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: "var(--text-primary)",
                            lineHeight: 1.3,
                            marginBottom: 4,
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.description || "Freshly prepared at MOKKO"}
                        </div>
                      </div>
                    </div>

                    {/* Pricing display: Small/Big vs Single */}
                    <div
                      style={{
                        paddingTop: 10,
                        borderTop: "1px dashed var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {item.sizes && (item.sizes.small || item.sizes.big) ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          {item.sizes.small && (
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                padding: "3px 8px",
                                borderRadius: 6,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid var(--border)",
                                color: "var(--text-primary)",
                              }}
                            >
                              Small: <strong style={{ color: "var(--accent-orange)" }}>₹{item.sizes.small}</strong>
                            </span>
                          )}
                          {item.sizes.big && (
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                padding: "3px 8px",
                                borderRadius: 6,
                                background: "rgba(212, 122, 42, 0.15)",
                                border: "1px solid rgba(212, 122, 42, 0.3)",
                                color: "var(--text-primary)",
                              }}
                            >
                              Big: <strong style={{ color: "var(--accent-orange)" }}>₹{item.sizes.big}</strong>
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-orange)" }}>
                          ₹{item.price}
                        </div>
                      )}

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: item.available ? "#10b981" : "var(--text-muted)",
                        }}
                      >
                        {item.available ? "● In Stock" : "○ Sold Out"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Extra Toppings Section (Reserved for Future Use) */
            <div className="fade-in">
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(212, 122, 42, 0.3)",
                  borderRadius: "var(--radius-lg)",
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                        Extra Toppings &amp; Add-ons
                      </h3>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 20,
                          background: "rgba(212, 122, 42, 0.2)",
                          color: "var(--accent-orange)",
                          border: "1px solid rgba(212, 122, 42, 0.4)",
                        }}
                      >
                        🔒 Reserved for Future Customizer
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, maxWidth: 680 }}>
                      This module manages extra toppings (Nutella drizzle, ice cream scoops, Biscoff spread, nuts).
                      The data architecture and CRUD endpoints are fully implemented and ready. It will integrate
                      into the live ordering customizer in an upcoming update.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowToppingModal(true)}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Plus size={15} /> Add Extra Topping
                  </button>
                </div>

                {/* Toppings Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 14,
                    marginTop: 20,
                  }}
                >
                  {toppings.map((top) => (
                    <div
                      key={top.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 24 }}>{top.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                            {top.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--accent-orange)", fontWeight: 700 }}>
                            +₹{top.price}
                          </div>
                        </div>
                      </div>

                      <label className="toggle" title="Toggle active status">
                        <input
                          type="checkbox"
                          checked={top.available}
                          onChange={() => handleToggleTopping(top.id)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal: Add / Edit Menu Item */}
          {showItemModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(5px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  width: "100%",
                  maxWidth: 520,
                  padding: 24,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                    {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                  </h3>
                  <button
                    onClick={() => setShowItemModal(false)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveItem}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                      Item Name *
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Belgian Dark Chocolate Waffle"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                        Category / Type *
                      </label>
                      <select
                        className="input-field"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        style={{ width: "100%" }}
                      >
                        {categories.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.emoji} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                        Icon / Emoji
                      </label>
                      <input
                        className="input-field"
                        placeholder="🧇 / 🍫 / ☕"
                        value={formEmoji}
                        onChange={(e) => setFormEmoji(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Pricing Mode Toggle: Single Price vs Small & Big Sizes */}
                  <div style={{ marginBottom: 14, background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                      Pricing Configuration
                    </label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <button
                        type="button"
                        className={`btn ${formPriceType === "single" ? "btn-primary" : "btn-secondary"}`}
                        style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}
                        onClick={() => setFormPriceType("single")}
                      >
                        Single Fixed Price
                      </button>
                      <button
                        type="button"
                        className={`btn ${formPriceType === "sizes" ? "btn-primary" : "btn-secondary"}`}
                        style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}
                        onClick={() => setFormPriceType("sizes")}
                      >
                        Small &amp; Big Sizes
                      </button>
                    </div>

                    {formPriceType === "single" ? (
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 149"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          min="1"
                        />
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                            Small Size Price (₹) *
                          </label>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="e.g. 49"
                            value={formSmallPrice}
                            onChange={(e) => setFormSmallPrice(e.target.value)}
                            min="1"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                            Big Size Price (₹) *
                          </label>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="e.g. 100"
                            value={formBigPrice}
                            onChange={(e) => setFormBigPrice(e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                      Description
                    </label>
                    <textarea
                      className="input-field"
                      placeholder="e.g. Crisp golden waffle with rich chocolate sauce"
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      style={{ resize: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowItemModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingItem ? "Update Item" : "Create Item"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Add Category / Type */}
          {showCategoryModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(5px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  width: "100%",
                  maxWidth: 420,
                  padding: 24,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add New Menu Type / Category</h3>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddCategory}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                      Category / Type Name *
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Pancakes, Mocktails, Sundaes"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                      Category Emoji Icon
                    </label>
                    <input
                      className="input-field"
                      placeholder="🥞 / 🍹 / 🍨"
                      value={newCatEmoji}
                      onChange={(e) => setNewCatEmoji(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCategoryModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Add Topping (Reserved) */}
          {showToppingModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(5px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  width: "100%",
                  maxWidth: 420,
                  padding: 24,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add Extra Topping</h3>
                  <button
                    onClick={() => setShowToppingModal(false)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddTopping}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                      Topping Name *
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Roasted Cashews, Marshmallows"
                      value={newToppingName}
                      onChange={(e) => setNewToppingName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="e.g. 30"
                        value={newToppingPrice}
                        onChange={(e) => setNewToppingPrice(e.target.value)}
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                        Emoji Icon
                      </label>
                      <input
                        className="input-field"
                        placeholder="🥜 / 🍬 / 🍫"
                        value={newToppingEmoji}
                        onChange={(e) => setNewToppingEmoji(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowToppingModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Topping
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
