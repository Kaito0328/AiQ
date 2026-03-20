/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

/**
 * カスタム Service Worker スクリプト。
 * @ducanh2912/next-pwa の customWorkerSrc により、自動生成される SW に追加される。
 *
 * 目的: Next.js App Router のクライアントサイドナビゲーション時に発行される
 * RSC (React Server Components) データ取得リクエストが、オフライン時に
 * ハング・フリーズするのを防止する。
 *
 * 仕組み:
 * 1. 全ての fetch イベントをリッスン
 * 2. 通常のフェッチが失敗した場合（オフライン等）、キャッシュから応答を探す
 * 3. キャッシュにもない場合は、空のレスポンスを返してハングを防ぐ
 */

// オフライン時にフェッチ失敗したリクエストをキャッシュから返す
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;

  // ナビゲーションリクエスト（ページ遷移）と RSC データリクエストを対象にする
  const isNavigation = request.mode === "navigate";
  const isRSCRequest =
    request.headers.get("RSC") === "1" ||
    request.url.includes("_rsc=") ||
    request.headers.get("Next-Router-State-Tree") !== null;
  const isNextData =
    request.url.includes("/_next/data/") && request.url.endsWith(".json");

  if (!isNavigation && !isRSCRequest && !isNextData) {
    // 通常のリクエスト（JS、CSS、画像、API等）はデフォルトの SW ハンドラに任せる
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // まずネットワークを試す（短いタイムアウト付き）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const response = await fetch(request, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch {
        // ネットワーク失敗 → キャッシュを探す
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // URL のクエリパラメータを除去してキャッシュを再検索
        // (RSC のキャッシュバスターパラメータが異なる場合への対応)
        const urlWithoutQuery = request.url.split("?")[0];
        const allCaches = await caches.keys();
        for (const cacheName of allCaches) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          for (const key of keys) {
            if (key.url.split("?")[0] === urlWithoutQuery) {
              const match = await cache.match(key);
              if (match) return match;
            }
          }
        }

        // 動的ルート（/users/:id, /collections/:id）は、別IDのキャッシュを流用して
        // App Router の起動を優先し、ページ内のIndexedDBフォールバックへつなぐ。
        const targetPath = new URL(request.url).pathname;
        const userDynamic = /^\/users\/[0-9a-fA-F-]{36}(\/favorites)?$/;
        const collectionDynamic =
          /^\/collections\/[0-9a-fA-F-]{36}(\/ranking)?$/;

        if (
          userDynamic.test(targetPath) ||
          collectionDynamic.test(targetPath)
        ) {
          for (const cacheName of allCaches) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();

            for (const key of keys) {
              const keyPath = new URL(key.url).pathname;
              if (
                (userDynamic.test(targetPath) && userDynamic.test(keyPath)) ||
                (collectionDynamic.test(targetPath) &&
                  collectionDynamic.test(keyPath))
              ) {
                const match = await cache.match(key);
                if (match) {
                  return match;
                }
              }
            }
          }
        }

        // キャッシュにもない場合、ハングを防ぐために空のレスポンスを返す
        if (isNavigation) {
          // ナビゲーションの場合はオフラインフォールバックページを返す
          // (app shell が precache されていればそれを返す)
          const fallback = await caches.match("/home");
          if (fallback) return fallback;

          return new Response(
            "<!DOCTYPE html><html><head><meta charset='utf-8'><title>オフライン</title></head><body><h1>オフラインです</h1><p>このページはキャッシュされていません。</p><script>setTimeout(()=>history.back(),2000)</script></body></html>",
            {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            },
          );
        }

        // RSC/データリクエストの場合は空のレスポンスを返す（Next.js がエラーハンドリングする）
        return new Response("", {
          status: 504,
          statusText: "Offline - no cache available",
        });
      }
    })(),
  );
});

export {};
