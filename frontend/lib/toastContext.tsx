"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message, title }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const showError = useCallback(
    (msg: string, title = "Validation Error") => showToast(msg, "error", title),
    [showToast]
  );

  const showSuccess = useCallback(
    (msg: string, title = "Success") => showToast(msg, "success", title),
    [showToast]
  );

  const showWarning = useCallback(
    (msg: string, title = "Attention") => showToast(msg, "warning", title),
    [showToast]
  );

  const showInfo = useCallback(
    (msg: string, title = "Info") => showToast(msg, "info", title),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showError, showSuccess, showWarning, showInfo }}
    >
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
          maxWidth: 380,
          width: "90%",
        }}
      >
        {toasts.map((toast) => {
          const bgMap = {
            success: "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(16, 185, 129, 0.95))",
            error: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
            warning: "linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))",
            info: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))",
          };

          const iconMap = {
            success: <CheckCircle size={20} color="#ffffff" />,
            error: <AlertCircle size={20} color="#ffffff" />,
            warning: <AlertTriangle size={20} color="#ffffff" />,
            info: <Info size={20} color="#ffffff" />,
          };

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: "auto",
                background: bgMap[toast.type],
                color: "#ffffff",
                padding: "14px 16px",
                borderRadius: 12,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div style={{ flexShrink: 0, marginTop: 2 }}>{iconMap[toast.type]}</div>
              <div style={{ flex: 1 }}>
                {toast.title && (
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: "0.3px",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}>
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.8)",
                  cursor: "pointer",
                  padding: 2,
                  marginTop: 2,
                  display: "flex",
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
