"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, ShoppingBag, ShieldCheck, Lock, User, Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "@/lib/toastContext";
import MokkoLogo from "@/components/MokkoLogo";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [selectedRole, setSelectedRole] = useState<"counter" | "kitchen" | "admin">("counter");
  const [staffName, setStaffName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      showError("Please enter your station password or PIN", "Password Required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.loginWithPassword(
        selectedRole,
        password.trim(),
        staffName.trim() || undefined
      );

      const sessionData = {
        role: selectedRole,
        token: res.token,
        name: res.user?.name || (selectedRole === "counter" ? "Counter Cashier" : selectedRole === "kitchen" ? "Kitchen Chef" : "Store Admin"),
        phone: res.user?.phone || "Store Terminal",
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("mokko_session", JSON.stringify(sessionData));
      showSuccess(`Authenticated! Opening ${selectedRole === "kitchen" ? "Kitchen Station" : selectedRole === "counter" ? "Billing Counter" : "Admin Dashboard"}...`);

      setTimeout(() => {
        if (selectedRole === "kitchen") {
          router.push("/kitchen");
        } else if (selectedRole === "counter") {
          router.push("/cart");
        } else {
          router.push("/");
        }
      }, 400);
    } catch (err: any) {
      showError(err.message || "Incorrect password or PIN", "Authentication Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #2b160b 0%, #150a05 70%, #0a0402 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(39, 22, 13, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(212, 122, 42, 0.35)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 122, 42, 0.15)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <MokkoLogo size="lg" />
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 8 }}>
            Station Authentication &amp; Terminal Access
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Workstation Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Select Workstation / Terminal
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedRole("counter")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 8px",
                  borderRadius: 14,
                  border: `1.5px solid ${selectedRole === "counter" ? "var(--accent-orange)" : "var(--border)"}`,
                  background: selectedRole === "counter" ? "rgba(212, 122, 42, 0.18)" : "rgba(255,255,255,0.03)",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ShoppingBag size={20} color={selectedRole === "counter" ? "var(--accent-orange)" : "var(--text-muted)"} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Billing</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Counter POS</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("kitchen")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 8px",
                  borderRadius: 14,
                  border: `1.5px solid ${selectedRole === "kitchen" ? "var(--accent-orange)" : "var(--border)"}`,
                  background: selectedRole === "kitchen" ? "rgba(212, 122, 42, 0.18)" : "rgba(255,255,255,0.03)",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <ChefHat size={20} color={selectedRole === "kitchen" ? "var(--accent-orange)" : "var(--text-muted)"} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Kitchen</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Live KDS</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 8px",
                  borderRadius: 14,
                  border: `1.5px solid ${selectedRole === "admin" ? "var(--accent-orange)" : "var(--border)"}`,
                  background: selectedRole === "admin" ? "rgba(212, 122, 42, 0.18)" : "rgba(255,255,255,0.03)",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Shield size={20} color={selectedRole === "admin" ? "var(--accent-orange)" : "var(--text-muted)"} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Admin</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Manager</span>
              </button>
            </div>
          </div>

          {/* Staff Name (Optional) */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Staff Name / Cashier (Optional)
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="input-field"
                placeholder={selectedRole === "counter" ? "e.g. Priya (Counter Staff)" : selectedRole === "kitchen" ? "e.g. Vikram (Chef)" : "Store Admin"}
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                style={{ paddingLeft: 40, fontSize: 14 }}
              />
            </div>
          </div>

          {/* Station Password / PIN */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                Station Password / Security PIN
              </label>
              <span style={{ fontSize: 11, color: "var(--accent-orange)", fontWeight: 600 }}>
                Default: 1234 or mokko123
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Enter password or PIN..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 40, paddingRight: 42, fontSize: 14 }}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 14 }}
          >
            {isLoading ? "Authenticating..." : `Unlock ${selectedRole === "counter" ? "Counter" : selectedRole === "kitchen" ? "Kitchen" : "Admin"} Station →`}
          </button>
        </form>

        {/* Security badge at bottom */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          <ShieldCheck size={14} color="var(--accent-orange)" />
          <span>Local Station Security · MOKKO Enterprise POS</span>
        </div>
      </div>
    </div>
  );
}
