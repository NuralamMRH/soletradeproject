import React, { createContext, useContext, useEffect, useState } from "react";
import MainApi from "@/api/MainApi";

const AppContentContext = createContext<any>(null);

export function AppContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appContent, setAppContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppContent = async () => {
    setLoading(true);
    try {
      const res = await MainApi.get("/api/v1/app-content");
      setAppContent(res.data.data);
    } catch (err) {
      setAppContent(null);
      console.error("AppContent fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppContent();
  }, []);

  return (
    <AppContentContext.Provider
      value={{ appContent, loading, fetchAppContent, setAppContent }}
    >
      {children}
    </AppContentContext.Provider>
  );
}

export function useAppContent() {
  const ctx = useContext(AppContentContext);
  if (!ctx)
    throw new Error("useAppContent must be used within AppContentProvider");
  return ctx;
}
