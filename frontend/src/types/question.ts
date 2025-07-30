export interface Question {
    id: number;
    questionText: string;
    correctAnswer: string;
    descriptionText?: string;
    collectionId: number;
}

export interface QuestionInput {
    questionText?: string;
    correctAnswer?: string;
    descriptionText?: string;
}