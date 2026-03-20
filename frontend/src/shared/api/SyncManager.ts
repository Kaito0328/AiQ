import { db, PendingAction, PendingActionType } from '../db/db';
import { logger } from '../utils/logger';
import { 
    createCollection, 
    updateCollection, 
    deleteCollection 
} from '@/src/features/collections/api';
import { 
    createQuestion, 
    updateQuestion, 
    deleteQuestion,
    batchQuestions,
    createEditRequest
} from '@/src/features/questions/api';
import { submitAnswer } from '@/src/features/quiz/api';

class SyncManager {
    private isProcessing = false;

    /**
     * 送信待ちアクションを同期します
     */
    async sync() {
        if (this.isProcessing) return;
        
        // ネットワーク状態の確認
        if (typeof window !== 'undefined') {
            const isManualOffline = localStorage.getItem('aiq_manual_offline') === 'true';
            if (isManualOffline || !navigator.onLine) {
                return;
            }
        }

        // status が 'pending' のものだけを対象にする
        const actions = await db.pendingActions
            .where('status').equals('pending')
            .sortBy('timestamp');

        if (actions.length === 0) return;

        this.isProcessing = true;
        logger.info(`Starting sync for ${actions.length} pending actions`);

        try {
            for (const action of actions) {
                try {
                    await this.processAction(action);
                    await db.pendingActions.delete(action.id!);
                    logger.info(`Successfully synced action: ${action.type}`, action.payload);
                } catch (err: any) {
                    logger.error(`Failed to sync action: ${action.type}`, err);
                    
                    // 400系のエラー（認証エラー以外）は「修復が必要なエラー」としてマークし、自動リトライを停止する
                    if (err.status >= 400 && err.status < 500 && ![401, 403, 429].includes(err.status)) {
                        await db.pendingActions.update(action.id!, {
                            status: 'error',
                            errorMessage: err.message || 'Validation error on server'
                        });
                        // 次のアクションに進む（このアクションは pending ではなくなったため）
                        continue; 
                    }

                    // それ以外（500系やネットワークエラー）はリトライ回数を増やして中断
                    await db.pendingActions.update(action.id!, {
                        retryCount: (action.retryCount || 0) + 1
                    });

                    break; 
                }
            }
            // 最後に個別のクイズ結果送信をバッチ送信するように統合・最適化する余地があるが、
            // 現状の submitAnswer は単一送信。ここではそのままループで回す。
        } finally {
            this.isProcessing = false;
        }
        
        // pending が残っている場合は少し待って再試行
        const remainingPending = await db.pendingActions.where('status').equals('pending').count();
        if (remainingPending > 0) {
            setTimeout(() => this.sync(), 5000);
        }
    }

    private async processAction(action: PendingAction) {
        const { type, payload } = action;

        switch (type) {
            case 'CREATE_COLLECTION':
                return await createCollection(payload);
            case 'UPDATE_COLLECTION':
                return await updateCollection(payload.id, payload.data);
            case 'DELETE_COLLECTION':
                return await deleteCollection(payload);
            case 'CREATE_SET':
                const { createSet } = require('@/src/features/collectionSets/api');
                return await createSet(payload.data);
            case 'UPDATE_SET':
                const { updateSet } = require('@/src/features/collectionSets/api');
                return await updateSet(payload.id, payload.data);
            case 'DELETE_SET':
                const { deleteSet } = require('@/src/features/collectionSets/api');
                return await deleteSet(payload.setId || payload);
            case 'CREATE_QUESTION':
                return await createQuestion(payload.collectionId, payload.data);
            case 'UPDATE_QUESTION':
                return await updateQuestion(payload.questionId, payload.data);
            case 'DELETE_QUESTION':
                return await deleteQuestion(payload);
            case 'BATCH_QUESTIONS':
                return await batchQuestions(payload.collectionId, payload.data);
            case 'FOLLOW_USER':
                const { followUser } = require('@/src/features/follow/api');
                return await followUser(payload.userId || payload);
            case 'UNFOLLOW_USER':
                const { unfollowUser } = require('@/src/features/follow/api');
                return await unfollowUser(payload.userId || payload);
            case 'FAVORITE_COLLECTION':
                const { addFavorite } = require('@/src/features/favorites/api');
                return await addFavorite(payload.collectionId || payload);
            case 'UNFAVORITE_COLLECTION':
                const { removeFavorite } = require('@/src/features/favorites/api');
                return await removeFavorite(payload.collectionId || payload);
            case 'SUBMIT_QUIZ_RESULT':
                if (payload.quizId.startsWith('offline-')) {
                    return; // Ignore offline-only quiz results
                }
                if (payload.answers && Array.isArray(payload.answers)) {
                    // Send each answer in the batch
                    for (const answerData of payload.answers) {
                        await submitAnswer(payload.quizId, answerData);
                    }
                    return;
                }
                return await submitAnswer(payload.quizId, payload.data);
            case 'CREATE_EDIT_REQUEST':
                return await createEditRequest(payload);
            default:
                throw new Error(`Unknown action type: ${type}`);
        }
    }

    /**
     * アクションを Outbox に追加し、オンラインなら即座に同期を試みます
     * アクション内容に基づいて相殺（Squash）ロジックを適用します
     */
    async addAction(type: PendingActionType, payload: any) {
        // status が 'pending' の既存アクションを取得
        const existing = await db.pendingActions
            .where('status').equals('pending')
            .toArray();

        // 1. Follow/Unfollow 相殺
        if (type === 'FOLLOW_USER' || type === 'UNFOLLOW_USER') {
            const userId = payload.userId || payload;
            const oppositeType = type === 'FOLLOW_USER' ? 'UNFOLLOW_USER' : 'FOLLOW_USER';
            const oppositeIndex = existing.findIndex(a => a.type === oppositeType && (a.payload.userId === userId || a.payload === userId));
            if (oppositeIndex !== -1) {
                await db.pendingActions.delete(existing[oppositeIndex].id!);
                return;
            }
        }

        // 2. Favorite 相殺
        if (type === 'FAVORITE_COLLECTION' || type === 'UNFAVORITE_COLLECTION') {
            const collectionId = payload.collectionId || payload;
            const oppositeType = type === 'FAVORITE_COLLECTION' ? 'UNFAVORITE_COLLECTION' : 'FAVORITE_COLLECTION';
            const oppositeIndex = existing.findIndex(a => a.type === oppositeType && (a.payload.collectionId === collectionId || a.payload === collectionId));
            if (oppositeIndex !== -1) {
                await db.pendingActions.delete(existing[oppositeIndex].id!);
                return;
            }
        }

        // 3. Create -> Delete 相殺
        if (type === 'DELETE_COLLECTION') {
            const collectionId = payload.collectionId || payload;
            const createIndex = existing.findIndex(a => a.type === 'CREATE_COLLECTION' && (a.payload.id === collectionId || a.payload === collectionId));
            if (createIndex !== -1) {
                await db.pendingActions.delete(existing[createIndex].id!);
                return;
            }
        }

        // 3.5. Set Create -> Delete 相殺
        if (type === 'DELETE_SET') {
            const setId = payload.setId || payload;
            const createIndex = existing.findIndex(
                a => a.type === 'CREATE_SET' && (a.payload.tempSet?.id === setId || a.payload.id === setId)
            );
            if (createIndex !== -1) {
                await db.pendingActions.delete(existing[createIndex].id!);
                return;
            }
        }

        // 4. 重複する UPDATE の統合 (簡易版: 最新で上書き)
        if (type === 'UPDATE_COLLECTION' || type === 'UPDATE_QUESTION') {
            const idKey = type === 'UPDATE_COLLECTION' ? 'id' : 'questionId';
            const entityId = payload[idKey];
            const duplicateIndex = existing.findIndex(a => a.type === type && a.payload[idKey] === entityId);
            if (duplicateIndex !== -1) {
                await db.pendingActions.delete(existing[duplicateIndex].id!);
            }
        }

        // 4.4. 仮セット(local-set-*)の更新は CREATE_SET にマージして整合性を保つ
        if (type === 'UPDATE_SET') {
            const setId = payload.id as string | undefined;
            if (setId && setId.startsWith('local-set-')) {
                const createAction = existing.find(
                    (a) => a.type === 'CREATE_SET' && a.payload?.tempSet?.id === setId,
                );

                if (createAction?.id) {
                    const tempSet = createAction.payload.tempSet;
                    const mergedTempSet = {
                        ...tempSet,
                        ...payload.data,
                        updatedAt: new Date().toISOString(),
                    };

                    await db.pendingActions.update(createAction.id, {
                        payload: {
                            ...createAction.payload,
                            data: {
                                ...createAction.payload.data,
                                ...payload.data,
                            },
                            tempSet: mergedTempSet,
                        },
                    });
                    return;
                }
            }
        }

        // 4.5. セット UPDATE の統合
        if (type === 'UPDATE_SET') {
            const setId = payload.id;
            const duplicateIndex = existing.findIndex(a => a.type === 'UPDATE_SET' && a.payload.id === setId);
            if (duplicateIndex !== -1) {
                await db.pendingActions.delete(existing[duplicateIndex].id!);
            }
        }

        // 5. クイズ結果の統合
        if (type === 'SUBMIT_QUIZ_RESULT') {
            const { quizId, data } = payload;
            const duplicateIndex = existing.findIndex(a => a.type === 'SUBMIT_QUIZ_RESULT' && a.payload.quizId === quizId);
            if (duplicateIndex !== -1) {
                const existingAction = existing[duplicateIndex];
                const answers = existingAction.payload.answers || [existingAction.payload.data];
                answers.push(data);
                await db.pendingActions.update(existingAction.id!, {
                    payload: { quizId, answers }
                });
                return; // 新規追加せずに戻る
            }
        }

        await db.pendingActions.add({
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0,
            status: 'pending'
        });

        // オンラインなら即座に同期を試みる
        if (typeof window !== 'undefined' && localStorage.getItem('aiq_manual_offline') !== 'true' && navigator.onLine) {
            this.sync();
        }
    }

    /**
     * 指定したアクションをリトライします
     */
    async retryAction(id: number) {
        await db.pendingActions.update(id, {
            status: 'pending',
            retryCount: 0
        });
        this.sync();
    }

    /**
     * 指定したアクションを破棄します
     */
    async discardAction(id: number) {
        await db.pendingActions.delete(id);
    }

    /**
     * イベントリスナーを登録します
     */
    init() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.sync());
            if (navigator.onLine) {
                this.sync();
            }
        }
    }
}

export const syncManager = new SyncManager();
syncManager.init();
