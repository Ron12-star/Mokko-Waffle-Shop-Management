"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem("mokko_session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.role === "kitchen") {
          router.push("/kitchen");
          return;
        } else if (session.role === "counter") {
          router.push("/cart");
          return;
        }
      }
    } catch (e) {
      // fallback
    }
    router.push("/login");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 60 }}>🧇</div>
      <div
        style={{
          fontFamily: "Space Grotesk",
          fontSize: 32,
          fontWeight: 800,
          background: "linear-gradient(135deg,#ff6b35,#f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MOKKO
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
        Connecting to terminal...
      </div>
    </div>
  );
}
