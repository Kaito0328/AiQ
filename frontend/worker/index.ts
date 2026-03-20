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

        // クエリ差分を無視して同一パスのキャッシュを探す
        const cachedIgnoringSearch = await caches.match(request, {
          ignoreSearch: true,
        });
        if (cachedIgnoringSearch) {
          return cachedIgnoringSearch;
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

        // キャッシュにもない場合、ハングを防ぐために空のレスポンスを返す
        if (isNavigation) {
          // ナビゲーションの場合は専用のオフラインページを返す
          // （/home を返すと「ホームへ飛んだ」ように見えるため避ける）
          return new Response(
            "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>オフライン</title><style>body{font-family:sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px}main{max-width:560px;margin:8vh auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px}h1{font-size:20px;margin:0 0 12px}p{line-height:1.6;margin:8px 0}button{margin-top:12px;padding:10px 14px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer}</style></head><body><main><h1>オフラインのため表示できません</h1><p>このページはまだオフライン用に準備されていません。</p><p>オンライン時に一度ページを開くと、次回からオフラインで表示できる場合があります。</p><button onclick='location.reload()'>再試行</button></main></body></html>",
            {
              status: 503,
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
