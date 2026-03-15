import { db } from '../db/db';
import { Collection } from '@/src/entities/collection';
import { Question } from '@/src/entities/question';
import { UserProfile } from '@/src/entities/user';

/**
 * コレクションと問題を一括でローカルに保存します（オフライン対応用）
 * isExplicit が true の場合は、ユーザーが意図的に保存したことを意味します
 */
export async function syncCollectionToOffline(collection: Collection, questions: Question[], isExplicit: boolean = true) {
    await db.saveCollection(collection, questions, isExplicit);
}

/**
 * コレクションのメタデータのみを同期します
 */
export async function syncCollectionMetadata(collection: Collection) {
    const existing = await db.collections.get(collection.id);
    await db.collections.put({
        ...collection,
        savedAt: Date.now(),
        isExplicitlySaved: existing?.isExplicitlySaved || false
    });
}

/**
 * 単体の問題を同期します
 */
export async function syncQuestionToOffline(question: Question) {
    await db.questions.put({
        ...question,
        savedAt: Date.now()
    });
}

/**
 * プロフィールを保存します
 */
export async function saveOfflineProfile(profile: UserProfile) {
    await db.saveProfile(profile);
}

/**
 * オフライン時にプロフィールを取得します
 */
export async function getOfflineProfile(userId: string): Promise<UserProfile | undefined> {
    return await db.profiles.get(userId);
}

/**
 * オフラインまたはネットワークエラー時にローカルからコレクションを取得します
 */
export async function getOfflineCollection(id: string): Promise<Collection | undefined> {
    return await db.collections.get(id);
}

/**
 * オフラインまたはネットワークエラー時にローカルから問題一覧を取得します
 */
export async function getOfflineQuestions(collectionId: string): Promise<Question[]> {
    return await db.questions.where('collectionId').equals(collectionId).toArray();
}

/**
 * 全てのオフライン保存済みコレクションを取得します
 * isExplicitOnly が false の場合は、自動キャッシュされたものも含めます
 */
export async function getAllOfflineCollections(isExplicitOnly: boolean = true): Promise<Collection[]> {
    if (isExplicitOnly) {
        return await db.collections.where('isExplicitlySaved').equals(1).toArray();
    }
    return await db.collections.toArray();
}
