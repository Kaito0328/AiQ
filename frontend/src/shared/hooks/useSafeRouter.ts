"use client";
import { useRouter } from "next/navigation";
import { useNetworkStatus } from "@/src/shared/contexts/NetworkStatusContext";
import { useToast } from "@/src/shared/contexts/ToastContext";

/**
 * Next.js の useRouter をラップし、オフライン時の遷移トラブル（フリーズ等）を防ぐためのフック。
 *
 * 【設計】
 * カスタム Service Worker (worker/index.ts) が、オフライン時の RSC データ取得失敗を
 * キャッシュレスポンスまたは空レスポンスで即座に返すため、router.push() を安全に使用できる。
 * このフックはキャッシュされていない可能性が高いルートへの遷移のみをブロックする。
 */
export function useSafeRouter() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const { showToast } = useToast();
  type RouterPushOptions = Parameters<typeof router.push>[1];

  const hasOfflineCacheForRoute = async (href: string): Promise<boolean> => {
    if (typeof window === "undefined" || !("caches" in window)) {
      return false;
    }

    try {
      const targetUrl = new URL(href, window.location.origin);
      const targetPath = targetUrl.pathname;
      const targetPathWithoutSlash = targetPath.replace(/^\//, "");
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const req of requests) {
          const reqUrl = new URL(req.url);

          if (reqUrl.pathname === targetPath) {
            return true;
          }

          const full = req.url;
          if (full.includes(targetPath)) {
            return true;
          }

          if (
            reqUrl.pathname.includes("/_next/data/") &&
            reqUrl.pathname.endsWith(".json") &&
            reqUrl.pathname.includes(targetPathWithoutSlash)
          ) {
            return true;
          }
        }
      }
    } catch {
      return false;
    }

    return false;
  };

  const safePush = async (href: string, options?: RouterPushOptions) => {
    if (!isOnline) {
      // オフライン時にキャッシュされている可能性が高いルートの判定
      const isLikelyCached =
        href === "/" ||
        href === "/home" ||
        href.startsWith("/home?") ||
        href.startsWith("/users/") ||
        href.startsWith("/collections/") ||
        href.startsWith("/collection-sets/") ||
        href.includes("/quiz") ||
        href === "/users/official" ||
        href === "/users" ||
        href === "/settings/cache" ||
        href === "/settings" ||
        href === "/settings/sync" ||
        href === "/credits";

      if (!isLikelyCached) {
        const hasCache = await hasOfflineCacheForRoute(href);
        if (hasCache) {
          router.push(href, options);
          return;
        }

        showToast({
          message: "オフラインのため、このページへは移動できません",
          variant: "danger",
        });
        return;
      }
    }

    router.push(href, options);
  };

  const safeBack = () => {
    router.back();
  };

  const safeReplace = (href: string, options?: RouterPushOptions) => {
    if (!isOnline && !href.startsWith("/home") && href !== "/") {
      showToast({
        message: "オフラインのため、遷移を制限しています",
        variant: "danger",
      });
      return;
    }
    router.replace(href, options);
  };

  return {
    ...router,
    push: safePush,
    replace: safeReplace,
    back: safeBack,
  };
}
