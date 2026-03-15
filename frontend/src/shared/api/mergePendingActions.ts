import { db } from '../db/db';
import { Collection } from '@/src/entities/collection';
import { UserProfile } from '@/src/entities/user';

/**
 * コレクションのリストにペンディング中のアクションを適用します
 */
export async function mergePendingCollections(collections: Collection[]): Promise<Collection[]> {
    const pending = await db.pendingActions
        .where('type').anyOf(['UPDATE_COLLECTION', 'DELETE_COLLECTION', 'FAVORITE_COLLECTION', 'UNFAVORITE_COLLECTION'])
        .toArray();

    if (pending.length === 0) return collections;

    let result = [...collections];

    for (const action of pending) {
        const { type, payload } = action;
        
        if (type === 'DELETE_COLLECTION') {
            const id = payload.collectionId || payload;
            result = result.filter(c => c.id !== id);
        } else if (type === 'UPDATE_COLLECTION') {
            const index = result.findIndex(c => c.id === payload.id);
            if (index !== -1) {
                result[index] = { ...result[index], ...payload.data };
            }
        } else if (type === 'FAVORITE_COLLECTION' || type === 'UNFAVORITE_COLLECTION') {
            const id = payload.collectionId || payload;
            const index = result.findIndex(c => c.id === id);
            if (index !== -1) {
                result[index] = { ...result[index], isFavorited: type === 'FAVORITE_COLLECTION' };
            }
        }
    }

    return result;
}

/**
 * ユーザープロフィールにペンディング中のアクションを適用します
 */
export async function mergePendingProfile(profile: UserProfile | null): Promise<UserProfile | null> {
    if (!profile) return null;

    const pending = await db.pendingActions
        .where('type').anyOf(['FOLLOW_USER', 'UNFOLLOW_USER'])
        .toArray();

    if (pending.length === 0) return profile;

    let result = { ...profile };

    for (const action of pending) {
        const { type, payload } = action;
        const userId = payload.userId || payload;

        if (userId === profile.id) {
            if (type === 'FOLLOW_USER') {
                result.isFollowing = true;
                result.followerCount = (result.followerCount || 0) + 1;
            } else if (type === 'UNFOLLOW_USER') {
                result.isFollowing = false;
                result.followerCount = Math.max(0, (result.followerCount || 0) - 1);
            }
        }
    }

    return result;
}
