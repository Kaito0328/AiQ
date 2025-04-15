package com.example.myapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.myapp.model.Collection;
import com.example.myapp.model.Question;
import com.example.myapp.model.User;
import com.example.myapp.repository.QuestionRepository;
import com.example.myapp.repository.QuizRepository;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.util.PermissionCheck;
import java.util.stream.Collectors;
import com.example.myapp.dto.AnswerResponse;
import com.example.myapp.dto.Quiz.Quiz;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


@Service
public class QuizService {
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    @Autowired
    public QuizService(QuestionRepository questionRepository, QuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    private boolean isCorrect(Question question, String userAnswer) {
        // 正解の選択肢を "/" で分割する
        String[] correctAnswers = question.getCorrectAnswer().split("/");

        // 各正解選択肢とユーザーの回答を比較する
        for (String correctAnswer : correctAnswers) {
            if (correctAnswer.trim().equalsIgnoreCase(userAnswer.trim())) {
                return true; // 一致したら正解
            }
        }

        // 一致しなければ不正解
        return false;
    }

    public AnswerResponse checkAnswer(Question question, String userAnswer, User user) {
        System.out.println("ユーザーの回答: " + userAnswer);
        PermissionCheck.checkViewPermission(user, question);
        return new AnswerResponse(isCorrect(question, userAnswer), question.getCorrectAnswer(),
                question.getDescriptionText());
    }

    public List<Quiz> getQuestions(List<Collection> collections, String order, int limit,
            User user) {
        Pageable pageable = PageRequest.of(0, limit); // ページ番号0、limit件数

        collections = PermissionCheck.filterCollectionsByViewPermission(user, collections);
        List<Long> collectionIds =
                collections.stream().map(Collection::getId).collect(Collectors.toList());

        List<Question> questions;

        // 並び順に応じてクエリを分ける
        switch (order.toLowerCase()) {
            case "asc":
                questions = questionRepository
                        .findByCollectionIdInOrderByIdAscWithLimit(collectionIds, pageable);
                break;
            case "desc":
                questions = questionRepository
                        .findByCollectionIdInOrderByIdDescWithLimit(collectionIds, pageable);
                break;
            case "random":
                questions = questionRepository
                        .findByCollectionIdInOrderByRandomWithLimit(collectionIds, pageable);
                break;
            default:
                throw new IllegalArgumentException("Invalid order type");
        }

        return ListTransformUtil.toQuizs(questions);
    }

    public String getNextHintChar(Question question, int index, User user) {

        PermissionCheck.checkViewPermission(user, question);
        String answer = question.getCorrectAnswer();

        if (index >= answer.length()) {
            return ""; // すべてのヒントを表示し終えたら空文字を返す
        }

        return String.valueOf(answer.charAt(index));
    }
}
