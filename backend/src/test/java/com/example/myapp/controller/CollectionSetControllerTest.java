package com.example.myapp.controller;

import com.example.myapp.dto.Item.CollectionSet.CollectionSetInput;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.repository.CollectionSetRepository;
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
class CollectionSetControllerTest extends BaseControllerTest {

    @Autowired
    private CollectionSetRepository collectionSetRepository;

    private CollectionSet testCollectionSet;

    @Override
    protected void createTestUser() {
        super.createTestUser();
        createTestCollectionSet();
    }

    private void createTestCollectionSet() {
        testCollectionSet = new CollectionSet();
        testCollectionSet.setName("Test Collection Set");
        testCollectionSet.setOpen(true);
        testCollectionSet.setUser(testUser);
        testCollectionSet = collectionSetRepository.save(testCollectionSet);
    }

    @Test
    void testGetCollectionSet_Success() throws Exception {
        mockMvc.perform(get("/api/collection-set/" + testCollectionSet.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Collection Set"))
                .andExpect(jsonPath("$.id").value(testCollectionSet.getId()));
    }

    @Test
    void testGetCollectionSet_NotFound() throws Exception {
        mockMvc.perform(get("/api/collection-set/99999")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetCollectionSetsByUserId_Success() throws Exception {
        mockMvc.perform(get("/api/collection-sets/user/" + testUser.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Collection Set"));
    }

    @Test
    void testCreateCollectionSet_Success() throws Exception {
        CollectionSetInput input = new CollectionSetInput("New Collection Set");

        mockMvc.perform(post("/api/collection-set")
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Collection Set"));
    }

    @Test
    void testCreateCollectionSet_Unauthorized() throws Exception {
        CollectionSetInput input = new CollectionSetInput("New Collection Set");

        mockMvc.perform(post("/api/collection-set")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUpdateCollectionSet_Success() throws Exception {
        CollectionSetInput input = new CollectionSetInput("Updated Collection Set");

        mockMvc.perform(patch("/api/collection-set/" + testCollectionSet.getId())
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Collection Set"));
    }

    @Test
    void testDeleteCollectionSet_Success() throws Exception {
        mockMvc.perform(delete("/api/collection-set/" + testCollectionSet.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteCollectionSet_Unauthorized() throws Exception {
        // 他のユーザーのコレクションセットを削除しようとする
        // まず別のユーザーを作成
        String anotherToken = createTestUser("anotheruser", "password"); // 別のユーザーでテストToken更新
        
        mockMvc.perform(delete("/api/collection-set/" + testCollectionSet.getId())
                .header("Authorization", "Bearer " + anotherToken))
                .andExpect(status().isForbidden());
    }
}
