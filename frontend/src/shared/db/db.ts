import Dexie, { Table } from "dexie";
import { Collection } from "@/src/entities/collection";
import { Question } from "@/src/entities/question";
import { UserProfile } from "@/src/entities/user";

export interface OfflineCollection extends Collection {
  savedAt: number;
  isExplicitlySaved: boolean; // ユーザーが明示的に保存ボタンを押したか
}

export interface OfflineQuestion extends Question {
  savedAt: number;
}

export interface OfflineUserProfile extends UserProfile {
  savedAt: number;
}

export type PendingActionType =
  | "CREATE_COLLECTION"
  | "UPDATE_COLLECTION"
  | "DELETE_COLLECTION"
  | "CREATE_SET"
  | "UPDATE_SET"
  | "DELETE_SET"
  | "CREATE_QUESTION"
  | "UPDATE_QUESTION"
  | "DELETE_QUESTION"
  | "BATCH_QUESTIONS"
  | "FOLLOW_USER"
  | "UNFOLLOW_USER"
  | "FAVORITE_COLLECTION"
  | "UNFAVORITE_COLLECTION"
  | "SUBMIT_QUIZ_RESULT"
  | "CREATE_EDIT_REQUEST";

export interface PendingAction {
  id?: number;
  type: PendingActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: "pending" | "error";
  errorMessage?: string;
}

export interface VisitedPage {
  path: string;
  lastVisitedAt: number;
}

export class AiQDatabase extends Dexie {
  collections!: Table<OfflineCollection>;
  questions!: Table<OfflineQuestion>;
  profiles!: Table<OfflineUserProfile>;
  pendingActions!: Table<PendingAction>;
  visitedPages!: Table<VisitedPage>;

  constructor() {
    super("AiQDatabase");
    this.version(5).stores({
      collections: "id, userId, name, savedAt, isExplicitlySaved",
      questions: "id, collectionId, questionText, savedAt",
      profiles: "id, username, savedAt",
      pendingActions: "++id, type, timestamp, status",
      visitedPages: "path, lastVisitedAt",
    });
  }

  async markPageVisited(path: string) {
    if (!path) return;
    await this.visitedPages.put({
      path,
      lastVisitedAt: Date.now(),
    });
  }

  async hasVisitedPath(path: string) {
    if (!path) return false;
    const item = await this.visitedPages.get(path);
    return !!item;
  }

  async hasVisitedPrefix(prefix: string) {
    if (!prefix) return false;
    const item = await this.visitedPages.where("path").startsWith(prefix).first();
    return !!item;
  }

  /**
   * プロフィールを保存/更新します
   */
  async saveProfile(profile: UserProfile) {
    await this.profiles.put({
      ...profile,
      savedAt: Date.now(),
    });
  }

  /**
   * 特定のコレクションに関連する全ての問題を削除します
   */
  async deleteCollectionContent(collectionId: string) {
    await this.transaction(
      "rw",
      [this.collections, this.questions],
      async () => {
        await this.questions
          .where("collectionId")
          .equals(collectionId)
          .delete();
        await this.collections.delete(collectionId);
      },
    );
  }

  /**
   * コレクションとその問題を保存/更新します
   */
  async saveCollection(
    collection: Collection,
    questions: Question[],
    isExplicit: boolean = false,
  ) {
    const savedAt = Date.now();

    await this.transaction(
      "rw",
      [this.collections, this.questions],
      async () => {
        await this.collections.put({
          ...collection,
          savedAt,
          isExplicitlySaved: isExplicit,
        });

        const offlineQuestions: OfflineQuestion[] = questions.map((q) => ({
          ...q,
          savedAt,
        }));

        await this.questions.bulkPut(offlineQuestions);
      },
    );
  }
}

export const db = new AiQDatabase();
