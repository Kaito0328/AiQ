package com.example.myapp.controller;

import com.example.myapp.dto.AiQuestionRequest;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.CollectionStats;
import com.example.myapp.repository.CollectionRepository;
import com.example.myapp.repository.CollectionSetRepository;
import com.example.myapp.service.GeminiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class QuestionGenerationControllerTest extends BaseControllerTest {

    @Autowired
    private CollectionSetRepository collectionSetRepository;

    @Autowired
    private CollectionRepository collectionRepository;

    @MockBean
    private GeminiService geminiService;

    private CollectionSet testCollectionSet;
    private Collection testCollection;

    @Override
    protected void createTestUser() {
        super.createTestUser();
        createTestCollectionSet();
        createTestCollection();
    }

    private void createTestCollectionSet() {
        testCollectionSet = new CollectionSet();
        testCollectionSet.setName("Test Collection Set");
        testCollectionSet.setOpen(true);
        testCollectionSet.setUser(testUser);
        testCollectionSet = collectionSetRepository.save(testCollectionSet);
    }

    private void createTestCollection() {
        testCollection = new Collection();
        testCollection.setName("Test Collection");
        testCollection.setOpen(true);
        testCollection.setCollectionSet(testCollectionSet);
        
        CollectionStats stats = new CollectionStats();
        testCollection.setCollectionStats(stats);
        stats.setCollection(testCollection);
        
        testCollection = collectionRepository.save(testCollection);
    }

    @Test
    void testGenerateQuestionsFromText_Success() throws Exception {
        // GeminiServiceのモック設定
        when(geminiService.generateQuestions(anyString(), anyString(), anyString(), anyString(), anyString(), anyInt()))
                .thenReturn(CompletableFuture.completedFuture(Collections.emptyList()));

        AiQuestionRequest request = new AiQuestionRequest(
            "Science",                      // theme
            "Multiple choice question",     // question_format
            "Single letter (A, B, C, D)",  // answer_format
            "What is the chemical symbol for water?", // question_example
            "H2O",                         // answer_example
            "Test Collection Set",          // collectionSetName
            5,                             // question_number
            true                           // isPublic
        );

        // 実際のエンドポイントに合わせて修正
        mockMvc.perform(post("/api/generate/collection/" + testCollection.getId() + "/ai")
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isAccepted());
    }

    @Test
    void testGenerateQuestionsFromText_Unauthorized() throws Exception {
        AiQuestionRequest request = new AiQuestionRequest(
            "Science",                      // theme
            "Multiple choice question",     // question_format
            "Single letter (A, B, C, D)",  // answer_format
            "What is the chemical symbol for water?", // question_example
            "H2O",                         // answer_example
            "Test Collection Set",          // collectionSetName
            5,                             // question_number
            true                           // isPublic
        );

        // 実際のエンドポイントに合わせて修正
        mockMvc.perform(post("/api/generate/collection/" + testCollection.getId() + "/ai")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGenerateQuestionsFromPdf_Success() throws Exception {
        // GeminiServiceのモック設定
        when(geminiService.generateQuestions(anyString(), anyString(), anyString(), anyString(), anyString(), anyInt()))
                .thenReturn(CompletableFuture.completedFuture(Collections.emptyList()));

        MockMultipartFile pdfFile = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            "test pdf content".getBytes()
        );

        // 実際のエンドポイントに合わせて修正
        mockMvc.perform(multipart("/api/generate/collection/" + testCollection.getId() + "/pdf")
                .file(pdfFile)
                .param("theme", "Math")
                .param("numQuestions", "3")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isAccepted());
    }

    @Test
    void testGenerateQuestionsFromPdf_Unauthorized() throws Exception {
        MockMultipartFile pdfFile = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            "test pdf content".getBytes()
        );

        // 実際のエンドポイントに合わせて修正
        mockMvc.perform(multipart("/api/generate/collection/" + testCollection.getId() + "/pdf")
                .file(pdfFile)
                .param("theme", "Math")
                .param("numQuestions", "3"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUploadCsv_Success() throws Exception {
        MockMultipartFile csvFile = new MockMultipartFile(
            "file",
            "test.csv",
            "text/csv",
            "question,answer,description\nWhat is 2+2?,4,Basic math".getBytes()
        );

        // 実際のエンドポイントに合わせて修正
        mockMvc.perform(multipart("/api/generate/collection/" + testCollection.getId() + "/csv")
                .file(csvFile)
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());
    }

    @Test
    void testUploadCsv_Unauthorized() throws Exception {
        MockMultipartFile csvFile = new MockMultipartFile(
            "file",
            "test.csv",
            "text/csv",
            "question,answer,description\nWhat is 2+2?,4,Basic math".getBytes()
        );

        // 実際のエンドポイントに合わせて修正
        mockMvc.perform(multipart("/api/generate/collection/" + testCollection.getId() + "/csv")
                .file(csvFile))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUploadCsv_InvalidFile() throws Exception {
        MockMultipartFile invalidFile = new MockMultipartFile(
            "file",
            "test.txt",
            "text/plain",
            "invalid content".getBytes()
        );

        // 実際のエンドポイントに合わせて修正 - CSVパーサーは無効なファイルでも処理を試み、空の結果を返す
        mockMvc.perform(multipart("/api/generate/collection/" + testCollection.getId() + "/csv")
                .file(invalidFile)
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successItems").isEmpty());
    }
}
