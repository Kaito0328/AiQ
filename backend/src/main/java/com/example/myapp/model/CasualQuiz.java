package com.example.myapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import com.example.myapp.model.filter.FilterType;
import com.example.myapp.model.sort.SortKey;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table
public class CasualQuiz extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private List<FilterType> filterTypes;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private List<SortKey> sortKeys;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "casual_quiz_collection_names",
        joinColumns = @JoinColumn(name = "quiz_id")
    )
    @Column(name = "collection_name")
    private List<String> collectionNames;

    private int totalQuestions;

    @ManyToMany(fetch = FetchType.EAGER, cascade = { CascadeType.MERGE })
    @JoinTable(
        name = "casual_quiz_questions",
        joinColumns = @JoinColumn(name = "quiz_id"),
        inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    private List<Question> questions = new ArrayList<>();
}