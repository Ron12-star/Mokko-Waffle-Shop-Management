"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, ShoppingBag, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/lib/toastContext";

export default function LoginPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [selectedRole, setSelectedRole] = useState<"counter" | "kitchen">("counter");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!pin) {
      showError("Please enter your 4-digit PIN", "Authentication Required");
      return;
    }

    // Default demo PINs: 1234 for Counter, 5678 for Kitchen
    const validPins: Record<string, string> = {
      counter: "1234",
      kitchen: "5678",
    };

    if (pin !== validPins[selectedRole] && pin !== "0000") {
      showError(
        `Invalid PIN for ${selectedRole === "counter" ? "Counter Screen (Default: 1234)" : "Kitchen Screen (Default: 5678)"}`,
        "Access Denied"
      );
      setPin("");
      return;
    }

    setIsLoading(true);

    const sessionData = {
      role: selectedRole,
      name: selectedRole === "counter" ? "Cashier / Counter Staff" : "Head Chef / Kitchen Staff",
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("mokko_session", JSON.stringify(sessionData));
    showSuccess(`Welcome! Redirecting to ${selectedRole === "counter" ? "Billing Counter" : "Kitchen KDS"}...`);

    setTimeout(() => {
      if (selectedRole === "counter") {
        router.push("/cart");
      } else {
        router.push("/kitchen");
      }
    }, 600);
  };

  const handleQuickLogin = (role: "counter" | "kitchen") => {
    const quickPin = role === "counter" ? "1234" : "5678";
    setSelectedRole(role);
    setPin(quickPin);

    const sessionData = {
      role,
      name: role === "counter" ? "Cashier / Counter Staff" : "Head Chef / Kitchen Staff",
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem("mokko_session", JSON.stringify(sessionData));
    showSuccess(`Quick Logged in as ${role === "counter" ? "Billing Counter" : "Kitchen KDS"}!`);

    setTimeout(() => {
      router.push(role === "counter" ? "/cart" : "/kitchen");
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #1e130c 0%, #0d0d0f 70%, #050507 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Inter', sans-serif",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(22, 22, 26, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 140, 50, 0.2)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(232, 120, 58, 0.1)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontSize: 48,
              marginBottom: 8,
              filter: "drop-shadow(0 4px 12px rgba(232, 120, 58, 0.4))",
            }}
          >
            🧇
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #ffffff 40%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 6,
            }}
          >
            MOKKO SHOP
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.55)", fontSize: 13, letterSpacing: "1px" }}>
            SELECT YOUR SCREEN TERMINAL
          </p>
        </div>

        {/* Screen Selection Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {/* Counter Screen Option */}
          <div
            onClick={() => {
              setSelectedRole("counter");
              setPin("");
            }}
            style={{
              cursor: "pointer",
              padding: "16px 14px",
              borderRadius: 16,
              border:
                selectedRole === "counter"
                  ? "2px solid #e8783a"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              background:
                selectedRole === "counter"
                  ? "rgba(232, 120, 58, 0.15)"
                  : "rgba(255, 255, 255, 0.03)",
              transition: "all 0.2s ease",
              textAlign: "center",
            }}
          >
            <div style={{ display: "inline-flex", padding: 10, borderRadius: 12, background: "rgba(232, 120, 58, 0.2)", marginBottom: 8 }}>
              <ShoppingBag size={22} color="#e8783a" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Counter Screen</div>
            <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)" }}>Billing & POS</div>
          </div>

          {/* Kitchen Screen Option */}
          <div
            onClick={() => {
              setSelectedRole("kitchen");
              setPin("");
            }}
            style={{
              cursor: "pointer",
              padding: "16px 14px",
              borderRadius: 16,
              border:
                selectedRole === "kitchen"
                  ? "2px solid #f59e0b"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              background:
                selectedRole === "kitchen"
                  ? "rgba(245, 158, 11, 0.15)"
                  : "rgba(255, 255, 255, 0.03)",
              transition: "all 0.2s ease",
              textAlign: "center",
            }}
          >
            <div style={{ display: "inline-flex", padding: 10, borderRadius: 12, background: "rgba(245, 158, 11, 0.2)", marginBottom: 8 }}>
              <ChefHat size={22} color="#f59e0b" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Kitchen Screen</div>
            <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)" }}>Live Kanban KDS</div>
          </div>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: 8,
              }}
            >
              Enter Terminal PIN (Demo: {selectedRole === "counter" ? "1234" : "5678"})
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Lock
                size={16}
                color="rgba(255, 255, 255, 0.4)"
                style={{ position: "absolute", left: 14 }}
              />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 14,
                  padding: "14px 14px 14px 42px",
                  fontSize: 20,
                  letterSpacing: "8px",
                  color: "#ffffff",
                  textAlign: "center",
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              background:
                selectedRole === "counter"
                  ? "linear-gradient(135deg, #e8783a, #ea580c)"
                  : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 8px 20px rgba(232, 120, 58, 0.3)",
              transition: "transform 0.1s, opacity 0.2s",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Authenticating..." : `Access ${selectedRole === "counter" ? "Counter" : "Kitchen"} Terminal`}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255, 255, 255, 0.4)",
              textAlign: "center",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            ⚡ 1-Click Shop Screen Launch
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={() => handleQuickLogin("counter")}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffaa77",
                padding: "8px 12px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Launch Counter (1234)
            </button>
            <button
              onClick={() => handleQuickLogin("kitchen")}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fbbf24",
                padding: "8px 12px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Launch Kitchen (5678)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
