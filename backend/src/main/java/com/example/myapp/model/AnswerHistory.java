package com.example.myapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "answer_history")
public class AnswerHistory extends BaseCreatedTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answerId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // ユーザーとのリレーション

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz; // クイズとのリレーション

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question; // 問題とのリレーション

    @Column(name = "user_answer")
    private String userAnswer; // ユーザーの回答

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect; // 正誤判定

    // 🔹 コンストラクタ
    public AnswerHistory() {}

    public AnswerHistory(User user, Question question, Quiz quiz, String userAnswer, boolean isCorrect) {
        this.user = user;
        this.question = question;
        this.quiz = quiz;
        this.userAnswer = userAnswer;
        this.isCorrect = isCorrect;
    }
}

