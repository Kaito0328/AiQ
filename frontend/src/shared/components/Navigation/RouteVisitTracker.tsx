"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markCurrentPathVisited } from "@/src/shared/api/routeVisit";

function toPathOnly(routeKey: string): string {
  const [withoutHash] = routeKey.split("#");
  const [withoutQuery] = withoutHash.split("?");
  return withoutQuery || "/";
}

export function RouteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || typeof window === "undefined") return;

    const updateNavStack = () => {
      try {
        const routeKey = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        const rawStack = sessionStorage.getItem("aiq_nav_stack");
        const stack = rawStack ? (JSON.parse(rawStack) as string[]) : [];

        if (stack.length >= 2 && stack[stack.length - 2] === routeKey) {
          // browser back/forward で1つ戻ったケース
          stack.pop();
        } else if (stack[stack.length - 1] !== routeKey) {
          // 通常の遷移
          stack.push(routeKey);
        }

        const current = stack[stack.length - 1] || routeKey;
        const previous = stack.length > 1 ? stack[stack.length - 2] : null;

        sessionStorage.setItem("aiq_nav_stack", JSON.stringify(stack));
        sessionStorage.setItem("aiq_current_path", toPathOnly(current));
        if (previous) {
          sessionStorage.setItem("aiq_previous_path", toPathOnly(previous));
        } else {
          sessionStorage.removeItem("aiq_previous_path");
        }

        const backTarget = stack.length > 1 ? stack[stack.length - 2] : null;
        if (backTarget) {
          sessionStorage.setItem("aiq_back_target_path", toPathOnly(backTarget));
        } else {
          sessionStorage.removeItem("aiq_back_target_path");
        }
      } catch {
        // ignore storage errors
      }
    };

    updateNavStack();
    window.addEventListener("hashchange", updateNavStack);
    window.addEventListener("popstate", updateNavStack);

    void markCurrentPathVisited(pathname);

    return () => {
      window.removeEventListener("hashchange", updateNavStack);
      window.removeEventListener("popstate", updateNavStack);
    };
  }, [pathname]);

  return null;
}
