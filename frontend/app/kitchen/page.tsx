"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { api } from "@/lib/api";
import {
  Bell,
  ChefHat,
  Clock,
  AlertTriangle,
  CheckCircle,
  Flame,
  Volume2,
  VolumeX,
  GripVertical,
  ArrowLeft,
  Radio,
  LogOut,
} from "lucide-react";
import styles from "./kitchen.module.css";
import { getSocket, playChime } from "@/lib/socket";
import { useToast } from "@/lib/toastContext";

type Order = {
  id: string;
  customer: string;
  phone: string;
  items: string[];
  note: string;
  time: string;
  total: number;
  payment: string;
  urgent: boolean;
  timer?: number;
};

type Column = "incoming" | "preparing" | "ready";

const COLS: { key: Column; label: string; icon: React.ReactNode; emptyIcon: string }[] = [
  { key: "incoming", label: "Incoming Orders", icon: <Bell size={16} />, emptyIcon: "⏳" },
  { key: "preparing", label: "Preparing", icon: <Flame size={16} />, emptyIcon: "🍳" },
  { key: "ready", label: "Ready to Serve", icon: <CheckCircle size={16} />, emptyIcon: "✅" },
];

function formatBackendOrder(raw: any): Order {
  const itemsList = Array.isArray(raw.items)
    ? raw.items.map((it: any) =>
        typeof it === "string" ? it : `${it.emoji || "🧇"} ${it.name} × ${it.qty || 1}`
      )
    : [];

  return {
    id: raw.id || raw.billNo || `ORD-${Date.now().toString().slice(-4)}`,
    customer: raw.customer?.name || raw.customer || "Guest",
    phone: raw.customer?.phone || raw.phone || "",
    items: itemsList.length > 0 ? itemsList : ["1x Custom Order"],
    note: raw.kitchenNote || raw.note || "",
    time: raw.time || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    total: raw.summary?.total || raw.total || 0,
    payment: (raw.paymentMethod || raw.payment || "UPI").toUpperCase(),
    urgent: Boolean(raw.urgent),
    timer: raw.timer || 0,
  };
}

/* ── Timer display ── */
function TimerDisplay({ startMinutes }: { startMinutes: number }) {
  const [mins, setMins] = useState(startMinutes);
  useEffect(() => {
    const interval = setInterval(() => setMins((m) => m + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  const isLate = mins >= 10;
  return (
    <span className={`timer-badge ${isLate ? "late" : ""}`}>
      <Clock size={11} /> {mins} min {isLate && <AlertTriangle size={11} />}
    </span>
  );
}

/* ── Order Card ── */
function OrderCard({
  order,
  col,
  index,
  onMove,
}: {
  order: Order;
  col: Column;
  index: number;
  onMove: (id: string, from: Column, to: Column) => void;
}) {
  return (
    <Draggable draggableId={order.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={[
            styles.orderCard,
            order.urgent ? styles.urgent : "",
            snapshot.isDragging ? styles.dragging : "",
            "fade-in",
          ].join(" ")}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
          }}
        >
          {/* Drag Handle */}
          <div {...provided.dragHandleProps} className={styles.dragHandle} title="Drag to move">
            <GripVertical size={14} />
          </div>

          {/* Header */}
          <div className={styles.cardHeader}>
            <span className={styles.orderId}>{order.id}</span>
            <div className={styles.orderTimestamp}>
              {order.urgent && (
                <span className="badge badge-red" style={{ fontSize: 10 }}>
                  🔴 URGENT
                </span>
              )}
              {order.time}
            </div>
          </div>

          {/* Customer */}
          <div className={styles.customerLine}>
            👤 {order.customer}
            <span className={styles.customerPhone}>{order.phone}</span>
          </div>

          {/* Items */}
          <ul className={styles.itemList}>
            {order.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {/* Note */}
          {order.note && <div className="order-note">📝 {order.note}</div>}

          {/* Footer */}
          <div className={styles.cardFooter}>
            <div className={styles.footerLeft}>
              {col === "preparing" && <TimerDisplay startMinutes={order.timer || 0} />}
              <span
                className={`badge ${order.payment === "UPI" ? "badge-purple" : "badge-amber"}`}
                style={{ fontSize: 10 }}
              >
                {order.payment === "UPI" ? "📱 UPI" : "💵 Cash"}
              </span>
            </div>
            <span className={styles.cardTotal}>₹{order.total}</span>
          </div>

          {/* Actions */}
          <div className={styles.cardActions}>
            {col === "incoming" && (
              <button
                className={`${styles.actionBtn} ${styles.btnStart}`}
                onClick={() => onMove(order.id, "incoming", "preparing")}
              >
                🍳 Start Preparing
              </button>
            )}
            {col === "preparing" && (
              <button
                className={`${styles.actionBtn} ${styles.btnReady}`}
                onClick={() => onMove(order.id, "preparing", "ready")}
              >
                ✓ Mark Ready
              </button>
            )}
            {col === "ready" && (
              <button
                className={`${styles.actionBtn} ${styles.btnServed}`}
                onClick={() => onMove(order.id, "ready", "ready")}
              >
                🛎️ Served
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

/* ── Main Page ── */
export default function KitchenPage() {
  const { showInfo, showSuccess } = useToast();

  const [orders, setOrders] = useState<Record<Column, Order[]>>({
    incoming: [],
    preparing: [],
    ready: [],
  });
  const [announcement, setAnnouncement] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [activeZone, setActiveZone] = useState<"all" | "waffle" | "dessert">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Sync with Backend via Socket.io & REST
  useEffect(() => {
    let socket: any;

    const setupSocket = () => {
      socket = getSocket();

      socket.on("connect", () => {
        setIsConnected(true);
        socket.emit("join-room", { role: "kitchen" });
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      // Receive initial order list from server
      socket.on("initial-orders", (backendOrders: any[]) => {
        if (Array.isArray(backendOrders) && backendOrders.length > 0) {
          const categorized: Record<Column, Order[]> = {
            incoming: [],
            preparing: [],
            ready: [],
          };

          backendOrders.forEach((raw) => {
            const formatted = formatBackendOrder(raw);
            const status = (raw.status as Column) || "incoming";
            if (categorized[status]) {
              categorized[status].push(formatted);
            }
          });

          setOrders(categorized);
        }
      });

      // Listen for REALTIME new orders arriving from Counter
      socket.on("order-created", (newRawOrder: any) => {
        const formatted = formatBackendOrder(newRawOrder);

        setOrders((prev) => ({
          ...prev,
          incoming: [formatted, ...prev.incoming.filter((o) => o.id !== formatted.id)],
        }));

        if (soundEnabled) {
          playChime(formatted.urgent);
        }

        showInfo(
          `🔔 New Order #${formatted.id} for ${formatted.customer} arrived!`,
          formatted.urgent ? "URGENT ORDER" : "New Order"
        );
      });

      // Listen for status updates
      socket.on("order-updated", (updatedOrder: any) => {
        const formatted = formatBackendOrder(updatedOrder);
        const newCol = updatedOrder.status as Column;

        setOrders((prev) => {
          const nextState: Record<Column, Order[]> = {
            incoming: prev.incoming.filter((o) => o.id !== formatted.id),
            preparing: prev.preparing.filter((o) => o.id !== formatted.id),
            ready: prev.ready.filter((o) => o.id !== formatted.id),
          };

          if (nextState[newCol]) {
            nextState[newCol].push(formatted);
          }
          return nextState;
        });
      });

      // Listen for announcements
      socket.on("kitchen-announcement", (data: any) => {
        setAnnouncementText(data.message);
        if (soundEnabled) {
          playChime(true);
        }
      });
    };

    setupSocket();

    // Also fetch initial orders via REST as backup
    api.getOrders()
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) {
          const categorized: Record<Column, Order[]> = {
            incoming: [],
            preparing: [],
            ready: [],
          };
          data.orders.forEach((raw: any) => {
            const formatted = formatBackendOrder(raw);
            const status = (raw.status as Column) || "incoming";
            if (categorized[status]) {
              categorized[status].push(formatted);
            }
          });
          setOrders(categorized);
        }
      })
      .catch((err) => {
        console.warn("REST fetch fallback notice:", err.message);
      });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("initial-orders");
        socket.off("order-created");
        socket.off("order-updated");
        socket.off("kitchen-announcement");
      }
    };
  }, [soundEnabled, showInfo]);

  // Handle Drag & Drop
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const from = source.droppableId as Column;
    const to = destination.droppableId as Column;

    let movedOrderId = "";

    setOrders((prev) => {
      const fromList = Array.from(prev[from]);
      const toList = from === to ? fromList : Array.from(prev[to]);
      const [moved] = fromList.splice(source.index, 1);
      movedOrderId = moved.id;
      toList.splice(destination.index, 0, moved);
      return { ...prev, [from]: fromList, [to]: toList };
    });

    if (movedOrderId && from !== to) {
      // Notify backend & counter
      try {
        const socket = getSocket();
        socket.emit("update-status", { orderId: movedOrderId, status: to });
      } catch (e) {}

      fetch(`http://localhost:4000/api/orders/${movedOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to }),
      }).catch(() => {});
    }
  };

  // Handle Button Moves
  const moveOrder = (id: string, from: Column, to: Column) => {
    if (from === to && to === "ready") {
      // Mark as Served
      setOrders((prev) => ({ ...prev, ready: prev.ready.filter((o) => o.id !== id) }));
      showSuccess(`Order #${id} marked as served!`);

      try {
        getSocket().emit("update-status", { orderId: id, status: "completed" });
      } catch (e) {}
      fetch(`http://localhost:4000/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      }).catch(() => {});
      return;
    }

    setOrders((prev) => {
      const order = prev[from].find((o) => o.id === id);
      if (!order) return prev;
      return {
        ...prev,
        [from]: prev[from].filter((o) => o.id !== id),
        [to]: [...prev[to], order],
      };
    });

    try {
      getSocket().emit("update-status", { orderId: id, status: to });
    } catch (e) {}

    fetch(`http://localhost:4000/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    }).catch(() => {});
  };

  const handleSendAnnouncement = () => {
    if (!announcement.trim()) return;

    setAnnouncementText(announcement);
    try {
      getSocket().emit("kitchen-announcement", { message: announcement });
    } catch (e) {}

    fetch("http://localhost:4000/api/orders/announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: announcement }),
    }).catch(() => {});

    setAnnouncement("");
  };

  const totalOrders = Object.values(orders).flat().length;

  const STATS = [
    { key: "incoming", label: "Incoming", count: orders.incoming.length },
    { key: "preparing", label: "Preparing", count: orders.preparing.length },
    { key: "ready", label: "Ready to Serve", count: orders.ready.length },
    { key: "total", label: "Total Active", count: totalOrders },
  ] as const;

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/cart" className={styles.backBtn} title="Switch to Billing Counter Screen">
            <ArrowLeft size={14} /> Counter POS
          </Link>

          <div className={styles.logoBox}>
            <ChefHat size={22} color="var(--accent-orange)" />
          </div>

          <div>
            <div className={styles.title} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              MOKKO Kitchen Display (KDS)
              <span
                style={{
                  fontSize: 11,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: isConnected ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: isConnected ? "#4ade80" : "#f87171",
                  border: isConnected ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <Radio size={12} className={isConnected ? "pulse" : ""} />
                {isConnected ? "Socket.io Live" : "Connecting..."}
              </span>
            </div>
            <div className={styles.subtitle}>
              Live Real-Time Order Stream · {totalOrders} active orders · Auto-syncs with Counter
            </div>
          </div>
        </div>

        <div className={styles.headerControls}>
          <button
            className={`btn ${soundEnabled ? "btn-secondary" : "btn-secondary"}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle audio alert chime for incoming orders"
            style={{ fontSize: 12, padding: "6px 12px", opacity: soundEnabled ? 1 : 0.6 }}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            Sound: {soundEnabled ? "On" : "Off"}
          </button>

          <Link
            href="/login"
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: "6px 12px" }}
            title="Switch User / Terminal"
          >
            <LogOut size={13} /> Switch Terminal
          </Link>
        </div>
      </div>

      {/* ── Announcement Bar ── */}
      {announcementText && (
        <div className="announcement-bar" style={{ marginBottom: 16 }}>
          📢 {announcementText}
          <button
            onClick={() => setAnnouncementText("")}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Announcement Input ── */}
      <div className={styles.announcementRow} style={{ marginBottom: 16 }}>
        <input
          className="input-field"
          placeholder="📢 Send announcement / message to kitchen staff (e.g. Rush hour — prioritize waffles)..."
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendAnnouncement();
          }}
        />
        <button className="btn btn-secondary" onClick={handleSendAnnouncement}>
          Broadcast
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div className={styles.statsBar}>
        {STATS.map((s) => (
          <div key={s.key} className={`${styles.statItem} ${styles[s.key as keyof typeof styles]}`}>
            <span className={`${styles.statLabel} ${styles[s.key as keyof typeof styles]}`}>{s.label}</span>
            <span className={`${styles.statValue} ${styles[s.key as keyof typeof styles]}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* ── Kanban Board ── */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.board}>
          {COLS.map((col) => (
            <div className={styles.col} key={col.key}>
              {/* Column Header */}
              <div className={`${styles.colHeader} ${styles[col.key]}`}>
                <div className={`${styles.colTitleGroup} ${styles[col.key]}`}>
                  {col.icon}
                  <span>{col.label}</span>
                </div>
                <div className={`${styles.colCount} ${styles[col.key]}`}>{orders[col.key].length}</div>
              </div>

              {/* Droppable */}
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={[
                      styles.droppable,
                      snapshot.isDraggingOver ? styles.draggingOver : "",
                      snapshot.isDraggingOver ? styles[col.key] : "",
                    ].join(" ")}
                  >
                    {orders[col.key].length === 0 && !snapshot.isDraggingOver && (
                      <div className={styles.emptySlot}>
                        <div className={styles.emptyIcon}>{col.emptyIcon}</div>
                        No orders in this column
                      </div>
                    )}

                    {orders[col.key].map((order, index) => (
                      <OrderCard key={order.id} order={order} col={col.key} index={index} onMove={moveOrder} />
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
