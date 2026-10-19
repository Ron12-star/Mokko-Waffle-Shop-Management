"use client";
import Sidebar from "@/components/Sidebar";
import { shopInfo } from "@/lib/mockData";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">
          <div className="page-header fade-in">
            <div>
              <div className="page-title">Settings</div>
              <div className="page-subtitle">Configure your shop profile and preferences</div>
            </div>
            <button className="btn btn-primary"><Save size={15} /> Save Changes</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card fade-in">
              <div className="card-title">🏪 Shop Profile</div>
              <div className="input-group"><label className="input-label">Shop Name</label>
                <input className="input-field" defaultValue={shopInfo.name} /></div>
              <div className="input-group"><label className="input-label">Tagline</label>
                <input className="input-field" defaultValue={shopInfo.tagline} /></div>
              <div className="input-group"><label className="input-label">Address</label>
                <input className="input-field" defaultValue={shopInfo.address} /></div>
              <div className="input-group"><label className="input-label">Phone</label>
                <input className="input-field" defaultValue={shopInfo.phone} /></div>
              <div className="input-group"><label className="input-label">UPI ID</label>
                <input className="input-field" defaultValue={shopInfo.upi} /></div>
              <div className="input-group"><label className="input-label">GSTIN</label>
                <input className="input-field" defaultValue={shopInfo.gstin} /></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card fade-in fade-in-delay-1">
                <div className="card-title">🎯 Revenue Target</div>
                <div className="input-group"><label className="input-label">Monthly Target (₹)</label>
                  <input className="input-field" defaultValue={shopInfo.monthlyTarget} type="number" /></div>
              </div>

              <div className="card fade-in fade-in-delay-2">
                <div className="card-title">🕐 Working Hours</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="input-group" style={{ margin: 0 }}><label className="input-label">Opens At</label>
                    <input type="time" className="input-field" defaultValue="09:00" /></div>
                  <div className="input-group" style={{ margin: 0 }}><label className="input-label">Closes At</label>
                    <input type="time" className="input-field" defaultValue="22:00" /></div>
                </div>
              </div>

              <div className="card fade-in fade-in-delay-3">
                <div className="card-title">🧾 Receipt Footer Message</div>
                <div className="input-group"><label className="input-label">Custom Message</label>
                  <input className="input-field" defaultValue="Thank you for visiting MOKKO! 🧇 Come back soon!" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
