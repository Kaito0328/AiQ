import { PreferredQuestionMode, RecommendedMode } from './quiz';

export interface Question {
    id: string;
    questionText: string;
    correctAnswers: string[];
    answerRubis?: string[];
    distractors?: string[];
    descriptionText?: string;
    collectionId: string;
    preferredMode: PreferredQuestionMode;
    recommendedMode: RecommendedMode;
}

export interface QuestionInput {
    questionText: string;
    correctAnswers: string[];
    answerRubis?: string[];
    distractors?: string[];
    descriptionText?: string;
    preferredMode?: PreferredQuestionMode;
}
