export interface Question {
    id: string;
    questionText: string;
    correctAnswer: string;
    descriptionText?: string;
    collectionId: string;
}

export interface QuestionInput {
    questionText: string;
    correctAnswer: string;
    descriptionText?: string;
}
