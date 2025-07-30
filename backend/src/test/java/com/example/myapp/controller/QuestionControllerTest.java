package com.example.myapp.controller;

import com.example.myapp.dto.Item.Question.QuestionInput;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.CollectionStats;
import com.example.myapp.model.Question;
import com.example.myapp.repository.CollectionRepository;
import com.example.myapp.repository.CollectionSetRepository;
import com.example.myapp.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class QuestionControllerTest extends BaseControllerTest {

    @Autowired
    private CollectionSetRepository collectionSetRepository;

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private QuestionRepository questionRepository;

    private CollectionSet testCollectionSet;
    private Collection testCollection;
    private Question testQuestion;

    @Override
    protected void createTestUser() {
        super.createTestUser();
        createTestCollectionSet();
        createTestCollection();
        createTestQuestion();
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

    private void createTestQuestion() {
        testQuestion = new Question();
        testQuestion.setQuestionText("What is the capital of Japan?");
        testQuestion.setCorrectAnswer("Tokyo");
        testQuestion.setDescriptionText("Tokyo is the capital and largest city of Japan.");
        testQuestion.setCollection(testCollection);
        testQuestion = questionRepository.save(testQuestion);
    }

    @Test
    void testGetQuestion_Success() throws Exception {
        mockMvc.perform(get("/api/question/" + testQuestion.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionText").value("What is the capital of Japan?"))
                .andExpect(jsonPath("$.correctAnswer").value("Tokyo"));
    }

    @Test
    void testGetQuestion_NotFound() throws Exception {
        mockMvc.perform(get("/api/question/99999")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetQuestionsByCollectionId_Success() throws Exception {
        mockMvc.perform(get("/api/questions/collection/" + testCollection.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].questionText").value("What is the capital of Japan?"));
    }

    @Test
    void testCreateQuestion_Success() throws Exception {
        QuestionInput input = new QuestionInput(
            "What is the capital of France?", 
            "Paris", 
            "Paris is the capital of France."
        );

        mockMvc.perform(post("/api/question/collection/" + testCollection.getId())
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionText").value("What is the capital of France?"))
                .andExpect(jsonPath("$.correctAnswer").value("Paris"));
    }

    @Test
    void testCreateQuestion_Unauthorized() throws Exception {
        QuestionInput input = new QuestionInput(
            "What is the capital of France?", 
            "Paris", 
            "Paris is the capital of France."
        );

        mockMvc.perform(post("/api/question/collection/" + testCollection.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUpdateQuestion_Success() throws Exception {
        QuestionInput input = new QuestionInput(
            "What is the largest city in Japan?", 
            "Tokyo", 
            "Tokyo is both the capital and largest city of Japan."
        );

        mockMvc.perform(patch("/api/question/" + testQuestion.getId())
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionText").value("What is the largest city in Japan?"));
    }

    @Test
    void testDeleteQuestion_Success() throws Exception {
        mockMvc.perform(delete("/api/question/" + testQuestion.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());
    }
}
