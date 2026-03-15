import { QuizRequest, QuizStartResponse, CasualQuiz } from '@/src/entities/quiz';
import { db } from '@/src/shared/db/db';
import { Question } from '@/src/entities/question';
import { v4 as uuidv4 } from 'uuid';

/**
 * オフライン環境でクイズを開始するためのモックデータを生成します
 */
export async function startOfflineQuiz(data: QuizRequest): Promise<QuizStartResponse> {
    // IndexedDB から対象のコレクションの問題を全て取得
    let allQuestions: Question[] = [];
    
    for (const collectionId of data.collectionIds) {
        const questions = await db.questions.where('collectionId').equals(collectionId).toArray();
        allQuestions = [...allQuestions, ...questions];
    }

    if (allQuestions.length === 0) {
        throw new Error('オフラインで利用可能な問題が見つかりません。事前にダウンロードしてください。');
    }

    // シャッフル（簡易版）
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    
    // リミット適用
    const selectedQuestions = shuffled.slice(0, data.limit || 30);

    const quiz: CasualQuiz = {
        id: `offline-${uuidv4()}`,
        collectionNames: ['Offline Mode'], // 本来はDBから取得
        totalQuestions: selectedQuestions.length,
        questionIds: selectedQuestions.map(q => q.id),
        answeredQuestionIds: [],
        correctCount: 0,
        elapsedTimeMillis: 0,
        preferredMode: data.preferredMode || 'fourChoice',
        dummyCharCount: data.dummyCharCount || 6,
        isActive: true,
        createdAt: new Date().toISOString()
    };

    return {
        quiz,
        questions: selectedQuestions
    };
}
