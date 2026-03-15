import { useCallback } from 'react';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';
import { db } from '@/src/shared/db/db';
import { syncManager } from '@/src/shared/api/SyncManager';
import { createQuestion, updateQuestion, deleteQuestion, batchQuestions } from '../api';
import { Question, QuestionInput } from '@/src/entities/question';

export function useQuestionMutations() {
    const { isOnline } = useNetworkStatus();

    const doCreateQuestion = useCallback(async (collectionId: string, data: QuestionInput): Promise<Question> => {
        if (isOnline) {
            const created = await createQuestion(collectionId, data);
            await db.questions.put({
                ...created,
                savedAt: Date.now()
            });
            return created;
        } else {
            const tempId = `temp-q-${Date.now()}`;
            const tempQuestion: any = {
                id: tempId,
                collectionId,
                ...data,
                savedAt: Date.now()
            };
            await db.questions.put(tempQuestion);
            await syncManager.addAction('CREATE_QUESTION', { collectionId, data });
            return tempQuestion as Question;
        }
    }, [isOnline]);

    const doUpdateQuestion = useCallback(async (questionId: string, data: QuestionInput): Promise<Question> => {
        if (isOnline) {
            const updated = await updateQuestion(questionId, data);
            await db.questions.put({
                ...updated,
                savedAt: Date.now()
            });
            return updated;
        } else {
            const current = await db.questions.get(questionId);
            const updated = { ...(current || {}), ...data, id: questionId } as any;
            if (current) {
                await db.questions.put(updated);
            }
            await syncManager.addAction('UPDATE_QUESTION', { questionId, data });
            return updated as Question;
        }
    }, [isOnline]);

    const doDeleteQuestion = useCallback(async (questionId: string): Promise<void> => {
        if (isOnline) {
            await deleteQuestion(questionId);
            await db.questions.delete(questionId);
        } else {
            await db.questions.delete(questionId);
            await syncManager.addAction('DELETE_QUESTION', questionId);
        }
    }, [isOnline]);

    const doBatchQuestions = useCallback(async (collectionId: string, data: { upsertItems: any[], deleteIds: string[] }): Promise<void> => {
        if (isOnline) {
            await batchQuestions(collectionId, data);
            // ローカルDBの更新
            if (data.deleteIds.length > 0) {
                await db.questions.bulkDelete(data.deleteIds);
            }
            // サーバーから最新を取得するか、upsertデータを個別に反映する
            // ここでは簡易的に個別にputする（IDが確定している前提）
            if (data.upsertItems.length > 0) {
                // 通常 batchQuestions は新規作成も含むため、IDが未確定の場合があるが
                // ここではオンラインなので、成功後にページ全体をリロードするか、
                // 結果を待って個別に反映する必要がある。
                // QuestionList.tsx の onSuccess() が通常リロードを担当する。
            }
        } else {
            // オフライン時の楽観的更新
            if (data.deleteIds.length > 0) {
                await db.questions.bulkDelete(data.deleteIds);
            }
            
            // 新規作成や更新をローカルに反映
            for (const item of data.upsertItems) {
                if (item.id) {
                    const current = await db.questions.get(item.id);
                    await db.questions.put({ ...(current || {}), ...item, savedAt: Date.now() });
                } else {
                    const tempId = `temp-q-${Date.now()}-${Math.random()}`;
                    await db.questions.put({ ...item, id: tempId, collectionId, savedAt: Date.now() } as any);
                }
            }

            await syncManager.addAction('BATCH_QUESTIONS', { collectionId, data });
        }
    }, [isOnline]);

    return {
        createQuestion: doCreateQuestion,
        updateQuestion: doUpdateQuestion,
        deleteQuestion: doDeleteQuestion,
        batchQuestions: doBatchQuestions
    };
}
