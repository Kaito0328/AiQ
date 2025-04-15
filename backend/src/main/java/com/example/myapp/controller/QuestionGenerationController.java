package com.example.myapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.myapp.service.GeminiService;
import com.example.myapp.util.PermissionCheck;
import com.example.myapp.service.QuestionService;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.CsvUploadService;
import com.example.myapp.service.UserService;
import com.example.myapp.model.User;
import com.example.myapp.model.Collection;
import com.example.myapp.dto.AiQuestionRequest;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.dto.Item.Question.QuestionOutput;
import com.example.myapp.dto.Item.Request.CreateRequest;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.config.WebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

@RestController
@RequestMapping("/api/generate")
public class QuestionGenerationController {

    private static final Logger log = LoggerFactory.getLogger(QuestionGenerationController.class);

    private final GeminiService geminiService;
    private final QuestionService questionService;
    private final CollectionService collectionService;
    private final WebSocketHandler webSocketHandler;
    private final Executor asyncExecutor;
    private final CsvUploadService csvUploadService;


    @Autowired
    public QuestionGenerationController(GeminiService geminiService,
            QuestionService questionService, CollectionService collectionService,
            WebSocketHandler webSocketHandler, Executor asyncExecutor,
            CsvUploadService csvUploadService) {
        this.geminiService = geminiService;
        this.questionService = questionService;
        this.collectionService = collectionService;
        this.webSocketHandler = webSocketHandler;
        this.asyncExecutor = asyncExecutor; // 非同期処理用の Executor を注入
        this.csvUploadService = csvUploadService;
    }


    @PostMapping(value = "/collection/{collectionId}/csv",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BatchUpsertResponse<QuestionOutput>> uploadCsv(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable("collectionId") Long collectionId,
            @RequestPart("file") MultipartFile file) {

        User user = UserService.getLoginUser(customUserDetails, true);
        Collection collection = collectionService.findById(collectionId);
        PermissionCheck.checkManagePermission(user, collection);

        List<CreateRequest<QuestionInput>> questionCreateRequests =
                csvUploadService.parseCsvFile(file);


        BatchUpsertResponse<QuestionOutput> questionOutputs =
                questionService.batchUpsertQuestion(collection, null, questionCreateRequests, user);
        return ResponseEntity.ok(questionOutputs);
    }

    @PostMapping("/collection/{collectionId}/ai")
    public ResponseEntity<Void> generateQuestions(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable("collectionId") Long collectionId,
            @RequestBody AiQuestionRequest request) {

        User user = UserService.getLoginUser(customUserDetails, true);
        Collection collection = collectionService.findById(collectionId);
        PermissionCheck.checkManagePermission(user, collection);

        // 非同期処理を実行
        CompletableFuture
                .supplyAsync(
                        () -> geminiService.generateQuestions(request.theme(),
                                request.question_format(), request.answer_format(),
                                request.question_example(), request.answer_example()),
                        asyncExecutor)
                .thenApply(CompletableFuture::join) // 非同期処理を適切に継続
                .thenAccept(questionCreateRequests -> {
                    BatchUpsertResponse<QuestionOutput> response = questionService
                            .batchUpsertQuestion(collection, null, questionCreateRequests, user);

                    try {
                        String jsonResponse = new ObjectMapper().writeValueAsString(response);
                        webSocketHandler.sendMessageToClients(jsonResponse);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException("JSON変換に失敗しました", e);
                    }
                }).exceptionally(ex -> {
                    log.error("AIによる問題生成中にエラー発生", ex);
                    return null;
                });

        // 即時に 202 Accepted を返す
        return ResponseEntity.accepted().build();
    }
}
