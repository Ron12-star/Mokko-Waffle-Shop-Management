"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  Tag,
  Receipt,
  ChevronRight,
  Flame,
  CheckCircle2,
  X,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { validatePhone, validateCustomerName, validateCart } from "@/lib/validation";
import { useToast } from "@/lib/toastContext";
import { getSocket } from "@/lib/socket";
import { api, MenuItemData, CategoryData, CouponData, ToppingData } from "@/lib/api";

type CartItem = {
  cartItemId: string;
  id: number;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  size?: "small" | "big" | null;
};

export default function CartPage() {
  const { showError, showSuccess } = useToast();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [toppings, setToppings] = useState<ToppingData[]>([]);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; description: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Size Picker Modal state
  const [sizePickerItem, setSizePickerItem] = useState<MenuItemData | null>(null);

  // Checkout flow state
  const [step, setStep] = useState<"menu" | "checkout" | "payment" | "success">("menu");
  const [payment, setPayment] = useState<"cash" | "upi" | "split" | null>(null);
  const [note, setNote] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [showReservedToppings, setShowReservedToppings] = useState(false);

  // Load menu, categories, coupons & toppings dynamically from Backend
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [menuRes, catRes, coupRes, topRes] = await Promise.all([
          api.getMenu().catch(() => ({ items: [] })),
          api.getCategories().catch(() => ({ categories: [] })),
          api.getCoupons().catch(() => ({ coupons: [] })),
          api.getToppings().catch(() => ({ toppings: [] })),
        ]);
        setMenuItems(menuRes.items || []);
        setCategories(catRes.categories || []);
        setCoupons(coupRes.coupons || []);
        setToppings(topRes.toppings || []);
      } catch (err: any) {
        showError("Failed to fetch menu from backend server", "Connection Error");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const filtered = menuItems
    .filter((i) => activeCategory === "All" || i.category.toLowerCase() === activeCategory.toLowerCase())
    .filter((i) => i.available);

  // Handle adding an item (with size selection if applicable)
  const handleItemClick = (item: MenuItemData) => {
    if (item.sizes && (item.sizes.small || item.sizes.big)) {
      setSizePickerItem(item);
    } else {
      addItemToCart(item, null, item.price);
    }
  };

  const addItemToCart = (item: MenuItemData, size: "small" | "big" | null, price: number) => {
    const sizeSuffix = size ? ` (${size === "small" ? "Small" : "Big"})` : "";
    const cartItemId = `${item.id}-${size || "std"}`;
    const itemName = `${item.name}${sizeSuffix}`;

    setCart((prev) => {
      const existing = prev.find((c) => c.cartItemId === cartItemId);
      if (existing) {
        return prev.map((c) => (c.cartItemId === cartItemId ? { ...c, qty: c.qty + 1 } : c));
      }
      return [
        ...prev,
        {
          cartItemId,
          id: item.id,
          name: itemName,
          price,
          qty: 1,
          emoji: item.emoji,
          size,
        },
      ];
    });

    setSizePickerItem(null);
  };

  const updateQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.cartItemId === cartItemId ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, c) => acc + c.price * c.qty, 0);
  const gst = 0; // GST removed

  // Recalculate or revalidate coupon discount
  let discountAmt = appliedCoupon?.discountAmount || 0;
  if (appliedCoupon && subtotal === 0) {
    discountAmt = 0;
  }
  const total = Math.max(0, subtotal - discountAmt);
  const cartCount = cart.reduce((acc, c) => acc + c.qty, 0);

  // Apply Coupon via Backend API
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      showError("Please enter a coupon code", "Coupon Required");
      return;
    }
    if (subtotal === 0) {
      showError("Add items to your cart before applying a coupon", "Cart Empty");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await api.validateCoupon(code, subtotal);
      setAppliedCoupon({
        code,
        discountAmount: res.discountAmount,
        description: res.coupon?.description || `Saved ₹${res.discountAmount}`,
      });
      setCouponInput("");
      showSuccess(res.message, "Coupon Applied");
    } catch (err: any) {
      showError(err.message || "Invalid coupon code", "Coupon Error");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showSuccess("Coupon removed");
  };

  // Validation before going to Payment step
  const handleProceedToPayment = () => {
    const nameValidation = validateCustomerName(customer.name);
    if (!nameValidation.isValid) {
      showError(nameValidation.error || "Please enter customer name", "Invalid Name");
      return;
    }

    const phoneValidation = validatePhone(customer.phone);
    if (!phoneValidation.isValid) {
      showError(
        phoneValidation.error || "Please enter a valid 10-digit Indian phone number (starts with 6, 7, 8, or 9)",
        "Invalid Phone Number"
      );
      return;
    }

    const cartValidation = validateCart(cart);
    if (!cartValidation.isValid) {
      showError(cartValidation.error || "Cart is empty", "Invalid Cart");
      return;
    }

    setStep("payment");
  };

  // Submit order to Backend + Broadcast via Socket.io to Kitchen
  const handleConfirmOrder = async () => {
    if (!payment) {
      showError("Please select a payment method", "Payment Required");
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
      },
      items: cart.map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        qty: c.qty,
        emoji: c.emoji,
      })),
      paymentMethod: payment,
      transactionId: payment === "upi" ? `UPI${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
      urgent: isUrgent,
      kitchenNote: note.trim(),
      summary: {
        subtotal,
        gstAmount: 0,
        gstRate: 0,
        discountAmount: discountAmt,
        discountCode: appliedCoupon ? appliedCoupon.code : null,
        total,
      },
    };

    try {
      const response = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to create order on server");
      }

      setPlacedOrder(data.order);
      setWhatsappSent(Boolean(data.whatsappSent));
      setWaLink(data.waLink || `https://api.whatsapp.com/send?phone=91${customer.phone.replace(/\D/g, '')}`);
      if (data.pdfPath) {
        const filename = data.pdfPath.split(/[\\/]/).pop();
        setPdfUrl(`http://localhost:4000/api/receipt/file/${filename}`);
      }
      setStep("success");
      showSuccess(
        `Order #${data.order.id} sent to Kitchen & WhatsApp receipt generated!`,
        "Order Dispatched"
      );

      // Socket sync
      try {
        const socket = getSocket();
        socket.emit("create-order", orderPayload);
      } catch (sockErr) {
        console.warn("Socket notification warning:", sockErr);
      }
    } catch (err: any) {
      console.error("Order submit failed:", err);
      showError(err.message || "Could not connect to backend server. Make sure port 4000 is running.", "Server Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    const finalBillNo = placedOrder?.billNo || "MK-000125";
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: 40, maxWidth: 460 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: "Fredoka", fontSize: 30, fontWeight: 700, marginBottom: 8, color: "var(--brand-cream)" }}>
              Order Placed &amp; Dispatched to Kitchen!
            </div>
            <div style={{ color: "var(--accent-orange)", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Bill No: {finalBillNo}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>
              🍳 Live ticket dispatched to Kitchen Kanban display
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 20,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10b981",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              <span>💾</span>
              <span>Order stored in backend database &amp; receipt archived locally</span>
            </div>

            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Customer</span>
                <span style={{ fontWeight: 600 }}>{customer.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Phone</span>
                <span style={{ fontWeight: 600 }}>+91 {customer.phone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Payment</span>
                <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{payment}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "var(--accent-green)" }}>
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTop: "1px solid var(--border)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--accent-orange)",
                }}
              >
                <span>Total Paid</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Action Buttons: Local PDF Receipt View & Print */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    justifyContent: "center",
                    padding: "12px 18px",
                    textDecoration: "none",
                    fontSize: 14,
                    gap: 8,
                  }}
                >
                  📄 View / Print Local PDF Receipt
                </a>
              )}
            </div>

            <button
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => {
                setCart([]);
                setCustomer({ name: "", phone: "" });
                setPayment(null);
                setAppliedCoupon(null);
                setNote("");
                setIsUrgent(false);
                setWaLink(null);
                setPdfUrl(null);
                setStep("menu");
              }}
            >
              Start New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container" style={{ paddingBottom: 60 }}>
          {/* Header */}
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Billing &amp; Counter POS</div>
              <div className="page-subtitle">Select items · Apply coupons · Dispatch directly to kitchen</div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <span className="badge badge-green">● Counter Terminal Active</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 390px", gap: 24, alignItems: "start" }}>
            {/* Left: Menu Items Selector */}
            <div>
              {/* Category Filter Pills */}
              <div className="category-tabs fade-in" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                <button
                  className={`cat-tab ${activeCategory === "All" ? "active" : ""}`}
                  onClick={() => setActiveCategory("All")}
                >
                  ✨ All Items
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    className={`cat-tab ${activeCategory.toLowerCase() === c.name.toLowerCase() ? "active" : ""}`}
                    onClick={() => setActiveCategory(c.name)}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                  gap: 14,
                }}
              >
                {filtered.map((item) => {
                  const hasSizes = Boolean(item.sizes && (item.sizes.small || item.sizes.big));
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        padding: 14,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        position: "relative",
                      }}
                      className="menu-card-hover"
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                        <span style={{ fontSize: 32 }}>{item.emoji}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, color: "var(--text-primary)" }}>
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              marginTop: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.description}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: 8,
                          borderTop: "1px dashed var(--border)",
                        }}
                      >
                        {hasSizes ? (
                          <div style={{ display: "flex", gap: 6, fontSize: 11 }}>
                            <span style={{ color: "var(--text-secondary)" }}>
                              Sm: <strong style={{ color: "var(--accent-orange)" }}>₹{item.sizes?.small}</strong>
                            </span>
                            <span style={{ color: "var(--text-secondary)" }}>
                              Bg: <strong style={{ color: "var(--accent-orange)" }}>₹{item.sizes?.big}</strong>
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--accent-orange)" }}>
                            ₹{item.price}
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: "rgba(212, 122, 42, 0.15)",
                            color: "var(--accent-orange)",
                            fontWeight: 700,
                          }}
                        >
                          + Add
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reserved Toppings Banner */}
              <div
                style={{
                  marginTop: 24,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(212, 122, 42, 0.3)",
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Sparkles size={16} color="var(--accent-orange)" />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                      Extra Toppings Customizer Pool
                    </span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(212, 122, 42, 0.2)",
                        color: "var(--accent-orange)",
                        fontWeight: 700,
                      }}
                    >
                      RESERVED FOR FUTURE USE
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReservedToppings(!showReservedToppings)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: 12,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {showReservedToppings ? "Hide Toppings" : "Preview Toppings"}
                </button>
              </div>

              {showReservedToppings && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {toppings.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontSize: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {t.emoji} {t.name}
                      </span>
                      <strong style={{ color: "var(--accent-orange)" }}>+₹{t.price}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Cart, Customer & Checkout Sidebar */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: 20,
                position: "sticky",
                top: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <ShoppingBag size={18} color="var(--accent-orange)" />
                  <span>Current Cart ({cartCount})</span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 12, cursor: "pointer" }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: 13 }}>
                    🛒 Cart is empty. Click any waffle or brownie to start billing!
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, marginRight: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--accent-orange)", fontWeight: 700 }}>
                          ₹{item.price} each
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          className="btn-icon"
                          onClick={() => updateQty(item.cartItemId, -1)}
                          style={{ width: 24, height: 24, padding: 0 }}
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 700, width: 20, textAlign: "center" }}>
                          {item.qty}
                        </span>
                        <button
                          className="btn-icon"
                          onClick={() => updateQty(item.cartItemId, 1)}
                          style={{ width: 24, height: 24, padding: 0 }}
                        >
                          <Plus size={11} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => removeItem(item.cartItemId)}
                          style={{ width: 24, height: 24, padding: 0, color: "#ef4444" }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Customer Details Form */}
              <div style={{ marginBottom: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>
                  Customer Details (For Bill &amp; WhatsApp Receipt)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ position: "relative" }}>
                    <User size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      className="input-field"
                      placeholder="Customer Name (e.g. Rahul Sharma)"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      style={{ paddingLeft: 32, fontSize: 12 }}
                    />
                  </div>
                  <div style={{ position: "relative" }}>
                    <Phone size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      className="input-field"
                      placeholder="WhatsApp Mobile (e.g. 9876543210)"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      style={{ paddingLeft: 32, fontSize: 12 }}
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════ */}
              {/* 🎟️ COUPON CODE INPUT & QUICK APPLY CHIPS                     */}
              {/* ════════════════════════════════════════════════════════════ */}
              <div style={{ marginBottom: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>
                  Coupon / Discount Code
                </div>

                {appliedCoupon ? (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.35)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <strong style={{ color: "#10b981" }}>{appliedCoupon.code}</strong>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        {appliedCoupon.description}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      title="Remove coupon"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input
                        className="input-field"
                        placeholder="Enter coupon (e.g. WELCOME10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        style={{ fontSize: 12, textTransform: "uppercase" }}
                      />
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        style={{ fontSize: 12, padding: "0 14px", flexShrink: 0 }}
                      >
                        {isApplyingCoupon ? "Applying..." : "Apply"}
                      </button>
                    </div>

                    {/* Quick clickable coupon chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {coupons.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => handleApplyCoupon(c.code)}
                          style={{
                            background: "rgba(212, 122, 42, 0.1)",
                            border: "1px solid rgba(212, 122, 42, 0.25)",
                            borderRadius: 6,
                            padding: "3px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--accent-orange)",
                            cursor: "pointer",
                          }}
                        >
                          🎟️ {c.code}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Kitchen Note & Urgent Flag */}
              <div style={{ marginBottom: 16 }}>
                <input
                  className="input-field"
                  placeholder="Kitchen note (e.g. Extra crispy, less ice)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ fontSize: 12, marginBottom: 8 }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", color: isUrgent ? "#ef4444" : "var(--text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                  />
                  <span>🔥 Mark as Urgent Order (Priority Kitchen Ticket)</span>
                </label>
              </div>

              {/* Bill Summary Breakdown */}
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 16,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--text-secondary)" }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {gst > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--text-secondary)" }}>
                    <span>GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#10b981", fontWeight: 700 }}>
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmt}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px solid var(--border)",
                    fontSize: 15,
                    fontWeight: 800,
                    color: "var(--accent-orange)",
                  }}
                >
                  <span>Grand Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Payment Method Selection & Checkout Trigger */}
              {step === "menu" ? (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "12px 16px" }}
                  onClick={handleProceedToPayment}
                  disabled={cart.length === 0}
                >
                  Proceed to Payment (₹{total})
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>
                    Select Payment Method
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                    <button
                      className={`btn ${payment === "cash" ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "10px 4px", fontSize: 11, flexDirection: "column", gap: 4 }}
                      onClick={() => setPayment("cash")}
                    >
                      <span>💵 Cash</span>
                    </button>
                    <button
                      className={`btn ${payment === "upi" ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "10px 4px", fontSize: 11, flexDirection: "column", gap: 4 }}
                      onClick={() => setPayment("upi")}
                    >
                      <span>📱 UPI / QR</span>
                    </button>
                    <button
                      className={`btn ${payment === "split" ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "10px 4px", fontSize: 11, flexDirection: "column", gap: 4 }}
                      onClick={() => setPayment("split")}
                    >
                      <span>⚡ Split</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setStep("menu")}
                      style={{ flex: 1 }}
                    >
                      Back
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleConfirmOrder}
                      disabled={isSubmitting || !payment}
                      style={{ flex: 2, justifyContent: "center" }}
                    >
                      {isSubmitting ? "Dispatching..." : `Confirm & Print Bill`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal: Waffle / Item Size Selection (Small vs Big) */}
          {sizePickerItem && (
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
                  maxWidth: 380,
                  padding: 24,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>{sizePickerItem.emoji}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                  {sizePickerItem.name}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                  Select serving size for this waffle
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {sizePickerItem.sizes?.small && (
                    <button
                      onClick={() => addItemToCart(sizePickerItem, "small", sizePickerItem.sizes!.small!)}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: "16px 10px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--text-primary)",
                      }}
                      className="menu-card-hover"
                    >
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Small Size</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-orange)" }}>
                        ₹{sizePickerItem.sizes.small}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Single serving</span>
                    </button>
                  )}

                  {sizePickerItem.sizes?.big && (
                    <button
                      onClick={() => addItemToCart(sizePickerItem, "big", sizePickerItem.sizes!.big!)}
                      style={{
                        background: "rgba(212, 122, 42, 0.12)",
                        border: "1px solid rgba(212, 122, 42, 0.35)",
                        borderRadius: 12,
                        padding: "16px 10px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--text-primary)",
                      }}
                      className="menu-card-hover"
                    >
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Big Size</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-orange)" }}>
                        ₹{sizePickerItem.sizes.big}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--accent-orange)" }}>Full size treat</span>
                    </button>
                  )}
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => setSizePickerItem(null)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
