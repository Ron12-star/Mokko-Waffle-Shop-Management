"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { Save, RefreshCw, CheckCircle, Store, Clock, Target, Receipt } from "lucide-react";

interface ShopSettings {
  name: string;
  tagline: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  upi: string;
  gstin: string;
  gstRate: number;
  monthlyTarget: number;
  openTime: string;
  closeTime: string;
  receiptFooterMessage: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>({
    name: "MOKKO",
    tagline: "Authentic Belgian Waffles & Sweet Delights",
    fullName: "MOKKO Waffles & Sweet Bites LLP",
    addressLine1: "Shop #4, Ground Floor, Heritage Square",
    addressLine2: "Opp. City Mall, SV Road, Ahmedabad - 380015",
    phone: "919876543210",
    upi: "mokko@icici",
    gstin: "24AABCU9603R1ZM",
    gstRate: 5,
    monthlyTarget: 150000,
    openTime: "09:00",
    closeTime: "23:00",
    receiptFooterMessage: "Thank you for visiting MOKKO! 🧇 Come back soon!",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res?.success && res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res?.success) {
        setSuccessMsg("✓ Settings saved successfully to backend!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
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
              <div className="page-title">Shop Settings & Configuration</div>
              <div className="page-subtitle">
                Configure your shop identity, billing information, tax rates, and receipt footer
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" onClick={loadSettings} disabled={loading}>
                <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {successMsg && (
            <div
              style={{
                background: "var(--accent-green-glow)",
                border: "1px solid var(--accent-green)",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 20,
                color: "var(--accent-green)",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              className="fade-in"
            >
              <CheckCircle size={16} />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Profile Card */}
              <div className="card fade-in">
                <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Store size={18} color="var(--accent-orange)" /> Shop Profile & Brand
                </div>

                <div className="input-group">
                  <label className="input-label">Shop Brand Name</label>
                  <input
                    className="input-field"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Legal Entity Name</label>
                  <input
                    className="input-field"
                    value={settings.fullName}
                    onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Tagline</label>
                  <input
                    className="input-field"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Address Line 1</label>
                  <input
                    className="input-field"
                    value={settings.addressLine1}
                    onChange={(e) => setSettings({ ...settings, addressLine1: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Address Line 2 / City</label>
                  <input
                    className="input-field"
                    value={settings.addressLine2}
                    onChange={(e) => setSettings({ ...settings, addressLine2: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Shop Phone / WhatsApp</label>
                    <input
                      className="input-field"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">UPI ID (QR Billing)</label>
                    <input
                      className="input-field"
                      value={settings.upi}
                      onChange={(e) => setSettings({ ...settings, upi: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">GSTIN</label>
                    <input
                      className="input-field"
                      value={settings.gstin}
                      onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">GST Rate (%)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={settings.gstRate}
                      onChange={(e) => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Targets & Operational Hours */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="card fade-in fade-in-delay-1">
                  <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Target size={18} color="var(--accent-orange)" /> Revenue Target & Performance
                  </div>
                  <div className="input-group">
                    <label className="input-label">Monthly Sales Target (₹)</label>
                    <input
                      className="input-field"
                      value={settings.monthlyTarget}
                      type="number"
                      onChange={(e) => setSettings({ ...settings, monthlyTarget: Number(e.target.value) })}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Used to render real-time progress bars across the Executive Dashboard
                    </div>
                  </div>
                </div>

                <div className="card fade-in fade-in-delay-2">
                  <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={18} color="var(--accent-blue)" /> Store Operating Hours
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label">Store Opens At</label>
                      <input
                        type="time"
                        className="input-field"
                        value={settings.openTime}
                        onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                      />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label">Store Closes At</label>
                      <input
                        type="time"
                        className="input-field"
                        value={settings.closeTime}
                        onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="card fade-in fade-in-delay-3">
                  <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Receipt size={18} color="var(--accent-green)" /> WhatsApp Receipt Custom Footer
                  </div>
                  <div className="input-group">
                    <label className="input-label">Custom Footer Greeting</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={settings.receiptFooterMessage}
                      onChange={(e) => setSettings({ ...settings, receiptFooterMessage: e.target.value })}
                      style={{ resize: "vertical" }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Appears at the very bottom of every WhatsApp receipt sent to patrons
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? "Saving Changes..." : "Save All Shop Settings"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
