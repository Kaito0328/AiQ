package com.example.myapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import com.example.myapp.dto.Item.Question.QuestionInput;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "questions")
public class Question extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false)
    private String correctAnswer;

    @Column
    private String descriptionText;

    @ManyToOne
    @JoinColumn(name = "collectionId", nullable = false)
    private Collection collection;

    public Question(String questionText, String correctAnswer, String descriptionText,
            Collection collection) {
        this.questionText = questionText;
        this.correctAnswer = correctAnswer;
        this.descriptionText = descriptionText;
        this.collection = collection;
    }

    public Question(QuestionInput questionInput, Collection collection) {
        this.questionText = questionInput.questionText();
        this.correctAnswer = questionInput.correctAnswer();
        this.descriptionText = questionInput.descriptionText();
        this.collection = collection;
    }

    public Question() {}

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;

        Question that = (Question) obj;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id == null ? 0 : id.hashCode();
    }
}
