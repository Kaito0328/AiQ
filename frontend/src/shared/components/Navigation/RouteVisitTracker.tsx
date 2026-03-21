"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markCurrentPathVisited } from "@/src/shared/api/routeVisit";

export function RouteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    void markCurrentPathVisited(pathname);
  }, [pathname]);

  return null;
}
