export interface Question {
    id: string;
    questionText: string;
    correctAnswers: string[];
    descriptionText?: string;
    collectionId: string;
}

export interface QuestionInput {
    questionText: string;
    correctAnswers: string[];
    descriptionText?: string;
}
