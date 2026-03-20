"use client";
import { useRouter } from "next/navigation";
import { useNetworkStatus } from "@/src/shared/contexts/NetworkStatusContext";
import { useToast } from "@/src/shared/contexts/ToastContext";
import { db } from "@/src/shared/db/db";

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
      const pathname =
        typeof window !== "undefined"
          ? new URL(href, window.location.origin).pathname
          : href;
      const uuidLike = "[0-9a-fA-F-]{36}";
      const isCollectionDetail = new RegExp(`^/collections/${uuidLike}$`).test(
        pathname,
      );
      const isCollectionRanking = new RegExp(
        `^/collections/${uuidLike}/ranking$`,
      ).test(pathname);
      const isUserDetail = new RegExp(`^/users/${uuidLike}$`).test(pathname);
      const isUserFavorites = new RegExp(`^/users/${uuidLike}/favorites$`).test(
        pathname,
      );

      let hasLocalDetailData = false;
      if (isCollectionDetail) {
        const collectionId = pathname.split("/")[2];
        if (collectionId) {
          const collection = await db.collections.get(collectionId);
          const questionCount = await db.questions
            .where("collectionId")
            .equals(collectionId)
            .count();
          hasLocalDetailData = !!collection && questionCount > 0;
        }
      } else if (isUserDetail || isUserFavorites) {
        const userId = pathname.split("/")[2];
        if (userId) {
          const profile = await db.profiles.get(userId);
          const collectionCount = await db.collections
            .where("userId")
            .equals(userId)
            .count();
          hasLocalDetailData = !!profile || collectionCount > 0;
        }
      }

      // オフライン時にキャッシュされている可能性が高いルートの判定
      const isLikelyCached =
        pathname === "/" ||
        pathname === "/home" ||
        pathname === "/users" ||
        pathname === "/collections/search" ||
        pathname.startsWith("/collection-sets/") ||
        pathname.includes("/quiz") ||
        pathname === "/settings/cache" ||
        pathname === "/settings" ||
        pathname === "/settings/sync" ||
        pathname === "/credits" ||
        isCollectionDetail ||
        isCollectionRanking ||
        isUserDetail ||
        isUserFavorites;

      const hasRouteCache = await hasOfflineCacheForRoute(href);

      if (!isLikelyCached && !hasLocalDetailData && !hasRouteCache) {
        showToast({
          message: "オフラインのため、このページへは移動できません",
          variant: "danger",
        });
        return;
      }

      if (
        (isCollectionDetail || isUserDetail || isUserFavorites) &&
        !hasLocalDetailData
      ) {
        showToast({
          message:
            "このページのオフラインデータが不足しています。オンラインで一度開いて保存してください",
          variant: "warning",
        });
        return;
      }

      // 動的詳細ページは、ローカルデータだけでなくルートキャッシュも必要。
      // （別IDのキャッシュ流用で誤ページへ遷移する事象を防ぐ）
      if (
        (isCollectionDetail || isCollectionRanking || isUserDetail || isUserFavorites) &&
        !hasRouteCache
      ) {
        showToast({
          message:
            "この詳細ページはまだオフライン準備できていません。オンラインで一度開いてください",
          variant: "warning",
        });
        return;
      }

      // 一覧系はキャッシュ未準備なら事前にブロックして、ブラウザの ERR_FAILED を避ける
      if (
        (pathname === "/collections/search" ||
          pathname === "/users" ||
          pathname.startsWith("/collection-sets/")) &&
        !hasRouteCache
      ) {
        showToast({
          message:
            "このページはまだオフライン準備できていません。オンラインで一度開いてください",
          variant: "warning",
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
