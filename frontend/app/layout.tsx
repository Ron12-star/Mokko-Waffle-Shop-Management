import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/lib/toastContext";

export const metadata: Metadata = {
  title: "MOKKO — Shop Management",
  description: "MOKKO Waffles & Desserts — Shop Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
