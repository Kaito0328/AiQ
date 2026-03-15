

export interface Question {
    id: string;
    questionText: string;
    correctAnswers: string[];
    answerRubis?: string[];
    chipAnswer?: string;
    distractors?: string[];
    descriptionText?: string;
    collectionId: string;
    isSelectionOnly: boolean;
}

export interface QuestionInput {
    questionText: string;
    correctAnswers: string[];
    answerRubis?: string[];
    chipAnswer?: string;
    distractors?: string[];
    descriptionText?: string;
    isSelectionOnly?: boolean;
}
