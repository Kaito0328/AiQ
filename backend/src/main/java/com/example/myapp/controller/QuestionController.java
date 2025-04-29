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
import com.example.myapp.model.Question;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.QuestionService;
import com.example.myapp.service.UserService;
import com.example.myapp.util.ListTransformUtil;
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

        Question question = questionService.getViewQuestion(id, viewer);

        return ResponseEntity.ok(new QuestionOutput(question));
    }

    @GetMapping("/questions/")
    public ResponseEntity<List<QuestionOutput>> getQuestions(@RequestBody List<Long> ids,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User viewer = UserService.getLoginUser(customUserDetails, false);

        List<Question> questions = questionService.getViewQuestions(ids, viewer);

        return ResponseEntity.ok(ListTransformUtil.toQuestionOutputs(questions));
    }

    @GetMapping("/questions/collection/{collectionId}")
    public ResponseEntity<List<QuestionOutput>> getQuestionsByCollectionId(
            @PathVariable Long collectionId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);
        Collection collection = collectionService.getViewCollection(collectionId, user);

        List<Question> questions =
                questionService.getQuestionsByCollection(collection, user);
        return ResponseEntity.ok(ListTransformUtil.toQuestionOutputs(questions));
    }

    @PostMapping("/question/collection/{collectionId}")
    public ResponseEntity<QuestionOutput> createQuestion(@PathVariable("id") Long id,
            @PathVariable("collectionId") Long collectionId,
            @RequestBody QuestionInput questionInput,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);
        Collection collection = collectionService.getManageCollection(collectionId, user);

        Question question =
                questionService.createQuestion(questionInput, collection, user);
        return ResponseEntity.ok(new QuestionOutput(question));
    }

    @PatchMapping("/question/{id}")
    public ResponseEntity<QuestionOutput> updateQuestion(@PathVariable Long id,
            @RequestBody QuestionInput questionInput,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);

        Question question = questionService.updateQuestion(id, questionInput, user);
        return ResponseEntity.ok(new QuestionOutput(question));
    }

    @PostMapping("/questions/collection/{collectionId}")
    public ResponseEntity<BatchUpsertResponse<QuestionOutput>> upSertQuestions(
            @RequestBody BatchUpsertRequest<QuestionInput> request, @PathVariable Long collectionId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);

        Collection collection = collectionService.getManageCollection(collectionId, user);

        BatchUpsertResponse<Question> upSertResponse =
                questionService.batchUpsertQuestion(collection, request.updatesRequest(),
                        request.createsRequest(), user);
        
        List<QuestionOutput> questionOutputs = ListTransformUtil.toQuestionOutputs(upSertResponse.successItems()); 

        return ResponseEntity.ok(new BatchUpsertResponse<QuestionOutput>(questionOutputs, upSertResponse.failedCreateItems(), upSertResponse.failedUpdateItems()));
    }

    @DeleteMapping("/question/{id}")
    public ResponseEntity<QuestionOutput> deleteQuestion(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);

        Question question = questionService.deleteQuestion(id, user);
        return ResponseEntity.ok(new QuestionOutput(question));
    }

    @DeleteMapping("/questions/collection/{collectionId}")
    public ResponseEntity<BatchDeleteResponse<QuestionOutput>> deleteQuestions(
            @RequestBody List<Long> questionIds,  @PathVariable Long collectionId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);
        
        Collection collection = collectionService.getManageCollection(collectionId, user);

        BatchDeleteResponse<Question> deleteResponse =
                questionService.deleteQuestions(collection, questionIds, user);

        List<QuestionOutput> questionOutputs = ListTransformUtil.toQuestionOutputs(deleteResponse.successItems()); 

        return ResponseEntity.ok(new BatchDeleteResponse<QuestionOutput>(questionOutputs, deleteResponse.failedItems()));
    }
}
