import { db } from "@/src/shared/db/db";

function normalizePath(path: string): string {
  if (!path) return "/";
  const noHash = path.split("#")[0];
  const noQuery = noHash.split("?")[0] || "/";
  return noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
}

export async function markCurrentPathVisited(pathname: string) {
  const normalized = normalizePath(pathname);
  await db.markPageVisited(normalized);
}

export async function hasVisitedPath(path: string) {
  return db.hasVisitedPath(normalizePath(path));
}

export async function hasVisitedAnyCollectionDetail() {
  return db.hasVisitedPrefix("/collections/");
}

export async function hasVisitedUserFavorites(userId: string) {
  return db.hasVisitedPath(`/users/${userId}/favorites`);
}
