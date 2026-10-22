"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Users,
  Package, UserCog, BarChart3, Settings, ChefHat,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "New Order", href: "/cart", icon: ShoppingCart },
  { label: "Kitchen", href: "/kitchen", icon: ChefHat },
];

const manageItems = [
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Staff", href: "/staff", icon: UserCog },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

import MokkoLogo from "./MokkoLogo";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <MokkoLogo size="md" />
      </div>

      <nav>
        <div className="nav-section-title">Counter</div>
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname === href ? "active" : ""}`}
          >
            <Icon size={16} className="nav-icon" />
            {label}
          </Link>
        ))}

        <div className="nav-section-title" style={{ marginTop: 20 }}>Manage</div>
        {manageItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname === href ? "active" : ""}`}
          >
            <Icon size={16} className="nav-icon" />
            {label}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: "20px 20px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Terminal Active</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--accent-orange-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "var(--accent-orange)",
            }}>C</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Counter POS</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Billing Station</div>
            </div>
          </div>
          <Link href="/login" title="Switch Terminal / Change Role" style={{ color: "var(--text-muted)", fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.05)" }}>
            Switch
          </Link>
        </div>
      </div>
    </aside>
  );
}
