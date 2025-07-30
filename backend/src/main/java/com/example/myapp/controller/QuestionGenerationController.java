package com.example.myapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.myapp.service.GeminiService;
import com.example.myapp.service.QuestionService;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.CsvUploadService;
import com.example.myapp.service.UserService;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.model.User;
import com.example.myapp.model.Collection;
import com.example.myapp.model.Question;
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
import java.io.IOException;

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
        this.asyncExecutor = asyncExecutor;
        this.csvUploadService = csvUploadService;
    }


    @PostMapping(value = "/collection/{collectionId}/csv",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BatchUpsertResponse<QuestionOutput>> uploadCsv(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable("collectionId") Long collectionId,
            @RequestPart("file") MultipartFile file) {
        // ここは変更なし
        User user = UserService.getLoginUser(customUserDetails, true);
        Collection collection = collectionService.getManageCollection(collectionId, user);

        List<CreateRequest<QuestionInput>> questionCreateRequests =
                csvUploadService.parseCsvFile(file);

        BatchUpsertResponse<Question> upSertResponse =
                questionService.batchUpsertQuestion(collection, null, questionCreateRequests, user);
        
        List<QuestionOutput> questionOutputs = ListTransformUtil.toQuestionOutputs(upSertResponse.successItems()); 
        return ResponseEntity.ok(new BatchUpsertResponse<QuestionOutput>(questionOutputs, upSertResponse.failedCreateItems(), upSertResponse.failedUpdateItems()));
    }

    @PostMapping(value = "/collection/{collectionId}/pdf",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> generateQuestionsFromPdf(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable("collectionId") Long collectionId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "theme", required = false, defaultValue = "PDFの内容") String theme,
            @RequestParam(value = "numQuestions", required = false, defaultValue = "10") int numQuestions) { // numQuestions を受け取る

        User user = UserService.getLoginUser(customUserDetails, true);
        Collection collection = collectionService.getManageCollection(collectionId, user);

        if (file.isEmpty() || !MediaType.APPLICATION_PDF_VALUE.equals(file.getContentType())) {
            log.error("無効なファイルタイプがアップロードされました: {}", file.getContentType());
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] pdfBytes = file.getBytes();

            CompletableFuture
                    .supplyAsync(
                            () -> geminiService.generateQuizFromPdf(pdfBytes, theme, numQuestions), // numQuestions をサービスに渡す
                            asyncExecutor)
                    .thenApply(CompletableFuture::join)
                    .thenAccept(questionCreateRequests -> {
                        BatchUpsertResponse<Question> upSertResponse = questionService
                                .batchUpsertQuestion(collection, null, questionCreateRequests, user);
                        
                        List<QuestionOutput> questionOutputs = ListTransformUtil.toQuestionOutputs(upSertResponse.successItems()); 
                        BatchUpsertResponse<QuestionOutput> response = new BatchUpsertResponse<QuestionOutput>(questionOutputs, upSertResponse.failedCreateItems(), upSertResponse.failedUpdateItems());

                        try {
                            String jsonResponse = new ObjectMapper().writeValueAsString(response);
                            webSocketHandler.sendMessageToClients(jsonResponse);
                        } catch (JsonProcessingException e) {
                            throw new RuntimeException("JSON変換に失敗しました", e);
                        }
                    }).exceptionally(ex -> {
                        log.error("AIによるPDFからの問題生成中にエラー発生", ex);
                        return null;
                    });

            return ResponseEntity.accepted().build();

        } catch (IOException e) {
            log.error("PDFファイルの読み込み中にエラーが発生しました", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/collection/{collectionId}/ai")
    public ResponseEntity<Void> generateQuestions(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable("collectionId") Long collectionId,
            @RequestBody AiQuestionRequest request) {
        // ここは変更なし
        User user = UserService.getLoginUser(customUserDetails, true);
        Collection collection = collectionService.getManageCollection(collectionId, user);

        CompletableFuture
                .supplyAsync(
                        () -> geminiService.generateQuestions(request.theme(),
                                request.question_format(), request.answer_format(),
                                request.question_example(), request.answer_example(), request.question_number()),
                        asyncExecutor)
                .thenApply(CompletableFuture::join)
                .thenAccept(questionCreateRequests -> {
                        BatchUpsertResponse<Question> upSertResponse = questionService
                            .batchUpsertQuestion(collection, null, questionCreateRequests, user);
                        
                        List<QuestionOutput> questionOutputs = ListTransformUtil.toQuestionOutputs(upSertResponse.successItems()); 
                        BatchUpsertResponse<QuestionOutput> response = new BatchUpsertResponse<QuestionOutput>(questionOutputs, upSertResponse.failedCreateItems(), upSertResponse.failedUpdateItems());

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

        return ResponseEntity.accepted().build();
    }
}