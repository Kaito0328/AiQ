"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markCurrentPathVisited } from "@/src/shared/api/routeVisit";

export function RouteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    try {
      const current = sessionStorage.getItem("aiq_current_path");
      if (current && current !== pathname) {
        sessionStorage.setItem("aiq_previous_path", current);
      }
      sessionStorage.setItem("aiq_current_path", pathname);
    } catch {
      // ignore storage errors
    }

    void markCurrentPathVisited(pathname);
  }, [pathname]);

  return null;
}
