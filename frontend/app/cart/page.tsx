"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { menuItems } from "@/lib/mockData";
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
} from "lucide-react";
import { validatePhone, validateCustomerName, validateCart } from "@/lib/validation";
import { useToast } from "@/lib/toastContext";
import { getSocket } from "@/lib/socket";

type CartItem = { id: number; name: string; price: number; qty: number; emoji: string };

const categories = ["All", "Waffles", "Desserts", "Beverages", "Combos"];

export default function CartPage() {
  const { showError, showSuccess } = useToast();

  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [discount, setDiscount] = useState("");
  const [step, setStep] = useState<"menu" | "checkout" | "payment" | "success">("menu");
  const [payment, setPayment] = useState<"cash" | "upi" | "split" | null>(null);
  const [note, setNote] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const filtered = menuItems
    .filter((i) => activeCategory === "All" || i.category === activeCategory)
    .filter((i) => i.available);

  const addToCart = (item: (typeof menuItems)[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1, emoji: item.emoji }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0)
    );
  };

  const subtotal = cart.reduce((acc, c) => acc + c.price * c.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const discountAmt = discount === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + gst - discountAmt;
  const cartCount = cart.reduce((acc, c) => acc + c.qty, 0);

  const getCartQty = (id: number) => cart.find((c) => c.id === id)?.qty || 0;

  // Centralized Validation before going to Payment step
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
        gstAmount: gst,
        gstRate: 0.05,
        discountAmount: discountAmt,
        discountCode: discountAmt > 0 ? discount : null,
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
      setStep("success");
      showSuccess(
        `Order #${data.order.id} sent to Kitchen & WhatsApp receipt sent to ${customer.phone}!`,
        "Order Dispatched"
      );

      // Emit socket event as well for immediate redundancy
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
            <div style={{ fontFamily: "Space Grotesk", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Order Placed &amp; Sent to Kitchen!
            </div>
            <div style={{ color: "var(--accent-orange)", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Bill No: {finalBillNo}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>
              🍳 Live ticket dispatched to Kitchen Kanban display
            </div>
            <div style={{ color: "var(--accent-green)", fontSize: 13, marginBottom: 20 }}>
              📱 WhatsApp receipt delivered to {customer.phone}
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Receipt Summary</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{customer.name}</span>
              </div>
              <div className="divider" />
              {cart.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span>
                    {c.emoji} {c.name} × {c.qty}
                  </span>
                  <span>₹{c.price * c.qty}</span>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              {discountAmt > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--accent-green)" }}>
                  <span>Discount ({discount})</span>
                  <span>-₹{discountAmt}</span>
                </div>
              )}
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}>
                <span>Total</span>
                <span style={{ color: "var(--accent-orange)" }}>₹{total}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px 0", fontSize: 15 }}
              onClick={() => {
                setCart([]);
                setCustomer({ name: "", phone: "" });
                setStep("menu");
                setPayment(null);
                setDiscount("");
                setNote("");
                setIsUrgent(false);
                setPlacedOrder(null);
              }}
            >
              + Next Order
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
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontFamily: "Space Grotesk", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                Billing &amp; Order POS
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {step === "menu" && "Select menu items and adjust quantities"}
                {step === "checkout" && "Enter customer contact for WhatsApp receipt"}
                {step === "payment" && "Choose payment mode and dispatch to kitchen"}
              </p>
            </div>

            {/* Stepper */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {[
                { key: "menu", label: "1. Menu" },
                { key: "checkout", label: "2. Customer" },
                { key: "payment", label: "3. Payment" },
              ].map((s, idx) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      background: step === s.key ? "var(--accent-orange)" : "rgba(255, 255, 255, 0.05)",
                      color: step === s.key ? "white" : "var(--text-muted)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (s.key === "menu") setStep("menu");
                      if (s.key === "checkout" && cart.length > 0) setStep("checkout");
                    }}
                  >
                    {s.label}
                  </span>
                  {idx < 2 && <span style={{ color: "var(--border)" }}>›</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
            {/* Main Area */}
            <div>
              {step === "menu" && (
                <>
                  {/* Category Filter */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        className={`btn ${activeCategory === cat ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setActiveCategory(cat)}
                        style={{ fontSize: 12, padding: "6px 14px" }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Menu Items Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
                    {filtered.map((item) => {
                      const qty = getCartQty(item.id);
                      return (
                        <div
                          key={item.id}
                          className="card"
                          style={{
                            padding: 16,
                            cursor: "pointer",
                            border: qty > 0 ? "1px solid var(--accent-orange)" : "1px solid var(--border)",
                            position: "relative",
                            transition: "transform 0.15s, border-color 0.15s",
                          }}
                          onClick={() => addToCart(item)}
                        >
                          <div style={{ fontSize: 36, marginBottom: 8 }}>{item.emoji}</div>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, minHeight: 28 }}>
                            {item.category} • Freshly prepared
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 800, color: "var(--accent-orange)", fontSize: 15 }}>
                              ₹{item.price}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: "4px 8px", fontSize: 11 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                              >
                                + Add
                              </button>
                              {qty > 0 && (
                                <span
                                  style={{
                                    background: "var(--accent-orange)",
                                    color: "white",
                                    width: 22,
                                    height: 22,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  {qty}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {step === "checkout" && (
                <div className="card fade-in" style={{ maxWidth: 520 }}>
                  <div className="card-title">Customer Contact &amp; Details</div>

                  <div className="input-group">
                    <label className="input-label">
                      <User size={13} style={{ display: "inline", marginRight: 4 }} />
                      Customer Name *
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Rahul Sharma"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <Phone size={13} style={{ display: "inline", marginRight: 4 }} />
                      WhatsApp Phone Number * (10 Digits)
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. 9876543210"
                      type="tel"
                      maxLength={10}
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, "") })}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Receipt PDF will be sent automatically to this WhatsApp number.
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <Tag size={13} style={{ display: "inline", marginRight: 4 }} />
                      Discount / Coupon Code
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="input-field"
                        placeholder="e.g. WELCOME10"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value.toUpperCase())}
                      />
                      {discount === "WELCOME10" && (
                        <span className="badge badge-green" style={{ whiteSpace: "nowrap" }}>
                          ✓ 10% off
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Kitchen Special Instruction / Note</label>
                    <input
                      className="input-field"
                      placeholder="e.g. Extra crispy, no whipped cream"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      borderRadius: 12,
                      background: isUrgent ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.02)",
                      border: isUrgent ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                    onClick={() => setIsUrgent(!isUrgent)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Flame size={18} color={isUrgent ? "#ef4444" : "var(--text-muted)"} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: isUrgent ? "#ef4444" : "inherit" }}>
                          Urgent Priority Order
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Highlights red on Kitchen Kanban display
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      style={{ transform: "scale(1.2)", cursor: "pointer" }}
                    />
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div className="card fade-in" style={{ maxWidth: 520 }}>
                  <div className="card-title">Select Payment Mode</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { id: "cash", icon: "💵", label: "Cash Payment", sub: "Collect cash at billing counter" },
                      { id: "upi", icon: "📱", label: "UPI / QR Code", sub: "Customer scans counter QR code" },
                      { id: "split", icon: "⚡", label: "Split (Cash + UPI)", sub: "Partial cash & partial UPI" },
                    ].map((p) => (
                      <div
                        key={p.id}
                        className={`payment-option ${payment === p.id ? "selected" : ""}`}
                        onClick={() => setPayment(p.id as any)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="payment-icon">{p.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{p.label}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.sub}</div>
                        </div>
                        {payment === p.id && (
                          <div style={{ marginLeft: "auto", color: "var(--accent-orange)", fontWeight: 700 }}>
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="cart-sidebar fade-in fade-in-delay-1">
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: "Space Grotesk",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Receipt size={18} /> Order Summary
                {cartCount > 0 && (
                  <span
                    style={{
                      background: "var(--accent-orange)",
                      color: "white",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                  <div style={{ fontSize: 13 }}>Cart is empty</div>
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: "auto", maxHeight: 260 }}>
                  {cart.map((item) => (
                    <div className="cart-row" key={item.id}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {item.emoji} {item.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--accent-orange)", fontWeight: 700 }}>
                          ₹{item.price * item.qty}
                        </div>
                      </div>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>
                          {item.qty}
                        </span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="divider" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>GST (5%)</span>
                  <span>₹{gst}</span>
                </div>
                {discountAmt > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-green)" }}>
                    <span>Discount</span>
                    <span>-₹{discountAmt}</span>
                  </div>
                )}
                <div className="divider" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "Space Grotesk",
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: "var(--accent-orange)" }}>₹{total}</span>
                </div>
              </div>

              {step === "menu" && (
                <button
                  className="btn btn-primary"
                  disabled={cart.length === 0}
                  onClick={() => setStep("checkout")}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "12px 0",
                    fontSize: 14,
                    opacity: cart.length === 0 ? 0.4 : 1,
                  }}
                >
                  Continue to Customer <ChevronRight size={16} />
                </button>
              )}

              {step === "checkout" && (
                <button
                  className="btn btn-primary"
                  onClick={handleProceedToPayment}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "12px 0",
                    fontSize: 14,
                  }}
                >
                  Select Payment Method <ChevronRight size={16} />
                </button>
              )}

              {step === "payment" && (
                <button
                  className="btn btn-primary"
                  disabled={!payment || isSubmitting}
                  onClick={handleConfirmOrder}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "12px 0",
                    fontSize: 14,
                    opacity: !payment || isSubmitting ? 0.5 : 1,
                    background: "linear-gradient(135deg, var(--accent-orange), var(--accent-amber))",
                  }}
                >
                  {isSubmitting ? "Dispatching to Kitchen..." : "✓ Confirm & Send to Kitchen"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
