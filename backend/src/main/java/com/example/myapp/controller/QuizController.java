package com.example.myapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import com.example.myapp.model.Collection;
import com.example.myapp.model.Question;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.QuestionService;
import com.example.myapp.service.QuizService;
import com.example.myapp.service.UserService;
import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.dto.AnswerRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import com.example.myapp.dto.AnswerResponse;
import com.example.myapp.dto.Quiz.Quiz;


@RestController
@RequestMapping("/api")
public class QuizController {
    private final QuizService quizService;
    private final QuestionService questionService;
    private final CollectionService collectionService;

    @Autowired
    public QuizController(QuizService quizService, QuestionService questionService,
            CollectionService collectionService) {
        this.quizService = quizService;
        this.questionService = questionService;
        this.collectionService = collectionService;
    }

    @PostMapping("/quiz/{id}/check")
    public ResponseEntity<AnswerResponse> checkAnswer(@PathVariable Long id,
            @RequestBody AnswerRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);
        Question question = questionService.findQuestionById(id);

        AnswerResponse answer = quizService.checkAnswer(question, request.userAnswer(), user);
        return ResponseEntity.ok(answer);
    }

    @GetMapping("/quiz/{id}/hint")
    public ResponseEntity<String> getNextHint(@PathVariable Long id, @RequestParam int index,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);
        Question question = questionService.findQuestionById(id);

        String nextHintChar = quizService.getNextHintChar(question, index, user);
        return ResponseEntity.ok(nextHintChar);
    }

    @GetMapping("/quizs/questions")
    public ResponseEntity<List<Quiz>> getQuestions(@RequestParam List<Long> collectionIds,
            @RequestParam String order, @RequestParam int limit,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);

        List<Collection> collections = collectionService.findByIds(collectionIds);

        List<Quiz> questions = quizService.getQuestions(collections, order, limit, user);
        return ResponseEntity.ok(questions);
    }
}
