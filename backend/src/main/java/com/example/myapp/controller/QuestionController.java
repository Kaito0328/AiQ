package com.example.myapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.example.myapp.model.User;
import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.dto.Item.BatchResponse.BatchDeleteResponse;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.dto.Item.Question.QuestionOutput;
import com.example.myapp.dto.Item.Request.BatchUpsertRequest;
import com.example.myapp.model.Collection;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.QuestionService;
import com.example.myapp.service.UserService;
import java.util.List;



@RestController
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;
    private final CollectionService collectionService;

    @Autowired
    public QuestionController(QuestionService questionService,
            CollectionService collectionService) {
        this.questionService = questionService;
        this.collectionService = collectionService;
    }

    // id で問題を取得
    @GetMapping("/question/{id}")
    public ResponseEntity<QuestionOutput> getQuestion(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User viewer = UserService.getLoginUser(customUserDetails, false);

        QuestionOutput questionDTO = questionService.getQuestion(id, viewer);

        return ResponseEntity.ok(questionDTO);
    }

    @GetMapping("/questions/")
    public ResponseEntity<List<QuestionOutput>> getQuestions(@RequestBody List<Long> ids,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User viewer = UserService.getLoginUser(customUserDetails, false);

        List<QuestionOutput> questionDTOs = questionService.getQuestions(ids, viewer);

        return ResponseEntity.ok(questionDTOs);
    }

    @GetMapping("/questions/collection/{collectionId}")
    public ResponseEntity<List<QuestionOutput>> getQuestionsByCollectionId(
            @PathVariable Long collectionId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);
        Collection collection = collectionService.findById(collectionId);

        List<QuestionOutput> questionDTOs =
                questionService.getQuestionsByCollection(collection, user);
        return ResponseEntity.ok(questionDTOs);
    }

    @PostMapping("/question/collection/{collectionId}")
    public ResponseEntity<QuestionOutput> createQuestion(@PathVariable("id") Long id,
            @PathVariable("collectionId") Long collectionId,
            @RequestBody QuestionInput questionInput,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);
        Collection collection = collectionService.findById(collectionId);

        QuestionOutput questionDTO =
                questionService.createQuestion(questionInput, collection, user);
        return ResponseEntity.ok(questionDTO);
    }

    // @PostMapping("/questions/collection/{collectionId}")
    // public ResponseEntity<List<QuestionOutput>> createQuestions(@PathVariable Long collectionId,
    // @RequestBody List<QuestionInput> questionInputs,
    // @AuthenticationPrincipal CustomUserDetails customUserDetails) {
    // User user = UserService.getLoginUser(customUserDetails, true);
    // Collection collection = collectionService.findById(collectionId);

    // List<QuestionOutput> questionDTOs =
    // questionService.createQuestions(questionInputs, collection, user);
    // return ResponseEntity.ok(questionDTOs);
    // }

    @PatchMapping("/question/{id}")
    public ResponseEntity<QuestionOutput> updateQuestion(@PathVariable Long id,
            @RequestBody QuestionInput questionInput,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);

        QuestionOutput questionDTO = questionService.updateQuestion(id, questionInput, user);
        return ResponseEntity.ok(questionDTO);
    }

    @PostMapping("/questions/collection/{collectionId}")
    public ResponseEntity<BatchUpsertResponse<QuestionOutput>> upSertQuestions(
            @RequestBody BatchUpsertRequest<QuestionInput> request, @PathVariable Long collectionId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);

        Collection collection = collectionService.findById(collectionId);

        BatchUpsertResponse<QuestionOutput> updatedCollectionSets =
                questionService.batchUpsertQuestion(collection, request.updatesRequest(),
                        request.createsRequest(), user);

        return ResponseEntity.ok(updatedCollectionSets);
    }

    // @PatchMapping("/questions")
    // public ResponseEntity<List<QuestionOutput>> updateQuestions(
    // @RequestBody List<QuestionInputWithId> questionInputWithIds,
    // @AuthenticationPrincipal CustomUserDetails customUserDetails) {
    // User user = UserService.getLoginUser(customUserDetails, true);

    // List<QuestionOutput> questionDTOs =
    // questionService.updateQuestions(questionInputWithIds, user);
    // return ResponseEntity.ok(questionDTOs);
    // }

    @DeleteMapping("/question/{id}")
    public ResponseEntity<QuestionOutput> deleteQuestion(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);

        QuestionOutput questionDTO = questionService.deleteQuestion(id, user);
        return ResponseEntity.ok(questionDTO);
    }

    @DeleteMapping("/questions")
    public ResponseEntity<BatchDeleteResponse<QuestionOutput>> deleteQuestions(
            @RequestBody List<Long> questionIds,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);

        BatchDeleteResponse<QuestionOutput> batchDeleteResponse =
                questionService.deleteQuestions(questionIds, user);
        return ResponseEntity.ok(batchDeleteResponse);
    }
}
