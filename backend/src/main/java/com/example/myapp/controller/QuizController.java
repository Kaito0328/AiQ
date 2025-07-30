package com.example.myapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import com.example.myapp.model.Question;
import com.example.myapp.model.CasualQuiz;
import com.example.myapp.model.User;
import com.example.myapp.service.AnswerHistoryService;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.QuestionService;
import com.example.myapp.service.QuizService;
import com.example.myapp.service.UserService;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.dto.AnswerHistoryOutput;
import com.example.myapp.dto.AnswerRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.myapp.model.Collection;
import java.util.List;
import java.util.stream.Collectors;
import com.example.myapp.dto.Item.Question.QuestionOutput;
import com.example.myapp.dto.Quiz.CasualQuizOutput;
import com.example.myapp.dto.Quiz.QuizRequest;
import com.example.myapp.dto.Quiz.QuizResumeResponse;
import com.example.myapp.dto.Quiz.QuizStartResponse;


@RestController
@RequestMapping("/api")
public class QuizController {
    private final QuizService quizService;
    private final QuestionService questionService;
    private final CollectionService collectionService;
    private final AnswerHistoryService answerHistoryService;

    @Autowired
    public QuizController(QuizService quizService, QuestionService questionService, CollectionService collectionService, AnswerHistoryService answerHistoryService) {
        this.quizService = quizService;
        this.questionService = questionService;
        this.collectionService = collectionService;
        this.answerHistoryService = answerHistoryService;
    }

    @PostMapping("/quiz/{id}/submit")
    public ResponseEntity<Void> submitAnswer(@PathVariable Long id,
            @RequestBody AnswerRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);
        Question question = questionService.getViewQuestion(request.questionId(), user);

        CasualQuiz quiz = quizService.handleUpdate(id, question, user);

        answerHistoryService.submitAnswer(user, quiz, question, request.userAnswer(), request.correct());
        return ResponseEntity.ok().build();
    }


    @PostMapping("/quiz/start")
    public ResponseEntity<QuizStartResponse> startCasualQuiz(@RequestBody QuizRequest quizRequest,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);

        List<String> collectionNames = collectionService.getViewCollections(quizRequest.collectionIds(), user).stream()
        .map(Collection::getName)
        .collect(Collectors.toList());

                
        QuizStartResponse response = quizService.startQuiz(quizRequest, user, collectionNames);
        return ResponseEntity.ok(response);

    }

    @DeleteMapping("/quiz/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);
        quizService.handleDelete(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/quiz/resumes")
    public ResponseEntity<List<CasualQuizOutput>> getResumes(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);
        List<CasualQuizOutput> resumes = quizService.getResumes(user);
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/quiz/{id}/resume")
    public ResponseEntity<QuizResumeResponse> resumeQuiz(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);

        CasualQuiz quiz = quizService.getCasualQuizById(id, user);
        List<QuestionOutput> questions = ListTransformUtil.toQuestionOutputs(quiz.getQuestions());

        List<AnswerHistoryOutput> answers = answerHistoryService.getByQuiz(quiz);

        return ResponseEntity.ok(new QuizResumeResponse(questions, answers));
    }
}
