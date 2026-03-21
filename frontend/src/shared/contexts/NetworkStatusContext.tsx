"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { syncManager } from "@/src/shared/api/SyncManager";

interface NetworkStatusContextType {
  isOnline: boolean;
  isNetworkOnline: boolean;
  isManualOffline: boolean;
  setManualOffline: (value: boolean) => void;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOnline: true,
  isNetworkOnline: true,
  isManualOffline: false,
  setManualOffline: () => {},
});

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // SSR とクライアント初回レンダーの差分を避けるため、初期値は固定にする
  const [navigatorOnline, setNavigatorOnline] = useState<boolean>(true);
  const [isManualOffline, setIsManualOfflineState] = useState<boolean>(false);

  // Load manual offline state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aiq_manual_offline");
    if (saved === "true") {
      setIsManualOfflineState(true);
    }
  }, []);

  const setManualOffline = (value: boolean) => {
    setIsManualOfflineState(value);
    localStorage.setItem("aiq_manual_offline", value ? "true" : "false");
    if (!value) {
      import("@/src/shared/api/SyncManager").then(({ syncManager }) => {
        syncManager.sync();
      });
    }
  };

  useEffect(() => {
    setNavigatorOnline(navigator.onLine);

    const handleOnline = () => {
      setNavigatorOnline(true);
      try {
        sessionStorage.removeItem("aiq_offline_auto_reload_ts");
      } catch {
        // ignore session storage error
      }
    };

    const handleOffline = () => {
      setNavigatorOnline(false);

      // ネットワーク断時に1回だけ自動リロードして、RSC状態をリセットする
      try {
        const now = Date.now();
        const lastReloadAt = Number(
          sessionStorage.getItem("aiq_offline_auto_reload_ts") || "0",
        );
        if (now - lastReloadAt > 5000) {
          sessionStorage.setItem("aiq_offline_auto_reload_ts", String(now));
          window.location.reload();
        }
      } catch {
        // ignore session storage error
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isOnline = navigatorOnline && !isManualOffline;

  return (
    <NetworkStatusContext.Provider
      value={{
        isOnline,
        isNetworkOnline: navigatorOnline,
        isManualOffline,
        setManualOffline,
      }}
    >
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = () => useContext(NetworkStatusContext);
