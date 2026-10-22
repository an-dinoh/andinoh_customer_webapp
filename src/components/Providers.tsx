"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LiveProvider } from "@/contexts/LiveContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LiveProvider>
          <Toaster position="top-right" containerStyle={{ top: 76 }} toastOptions={{
            duration: 4500,
            // Theme variables, so toasts follow light and dark mode.
            style: { borderRadius: "14px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: "14px", padding: "10px 14px" },
            success: { iconTheme: { primary: "var(--success)", secondary: "var(--surface)" } },
            error: { iconTheme: { primary: "var(--danger)", secondary: "var(--surface)" }, duration: 6000 },
          }} />
          {children}
        </LiveProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
