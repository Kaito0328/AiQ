"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markCurrentPathVisited } from "@/src/shared/api/routeVisit";

export function RouteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    try {
      const rawStack = sessionStorage.getItem("aiq_nav_stack");
      const stack = rawStack ? (JSON.parse(rawStack) as string[]) : [];

      if (stack.length >= 2 && stack[stack.length - 2] === pathname) {
        // browser back/forward で1つ戻ったケース
        stack.pop();
      } else if (stack[stack.length - 1] !== pathname) {
        // 通常の遷移
        stack.push(pathname);
      }

      const current = stack[stack.length - 1] || pathname;
      const previous = stack.length > 1 ? stack[stack.length - 2] : null;

      sessionStorage.setItem("aiq_nav_stack", JSON.stringify(stack));
      sessionStorage.setItem("aiq_current_path", current);
      if (previous) {
        sessionStorage.setItem("aiq_previous_path", previous);
      } else {
        sessionStorage.removeItem("aiq_previous_path");
      }

      const backTarget = stack.length > 1 ? stack[stack.length - 2] : null;
      if (backTarget) {
        sessionStorage.setItem("aiq_back_target_path", backTarget);
      } else {
        sessionStorage.removeItem("aiq_back_target_path");
      }
    } catch {
      // ignore storage errors
    }

    void markCurrentPathVisited(pathname);
  }, [pathname]);

  return null;
}
