"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MokkoLogo from "@/components/MokkoLogo";

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
        background: "radial-gradient(ellipse at top, #2b160b 0%, #150a05 70%, #0a0402 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <MokkoLogo size="xl" />
      <div style={{ color: "var(--text-secondary)", fontSize: 14, letterSpacing: "1px" }}>
        Connecting to MOKKO Terminal...
      </div>
    </div>
  );
}
