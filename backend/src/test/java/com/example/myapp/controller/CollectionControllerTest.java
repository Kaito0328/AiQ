package com.example.myapp.controller;

import com.example.myapp.dto.Item.Collection.CollectionInput;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.CollectionStats;
import com.example.myapp.repository.CollectionRepository;
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
class CollectionControllerTest extends BaseControllerTest {

    @Autowired
    private CollectionSetRepository collectionSetRepository;

    @Autowired
    private CollectionRepository collectionRepository;

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
    void testGetCollection_Success() throws Exception {
        mockMvc.perform(get("/api/collection/" + testCollection.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Collection"))
                .andExpect(jsonPath("$.open").value(true));
    }

    @Test
    void testGetCollection_NotFound() throws Exception {
        mockMvc.perform(get("/api/collection/99999")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetCollectionsByUserId_Success() throws Exception {
        mockMvc.perform(get("/api/collections/user/" + testUser.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetCollectionsByCollectionSetId_Success() throws Exception {
        mockMvc.perform(get("/api/collections/collection-set/" + testCollectionSet.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Collection"));
    }

    @Test
    void testCreateCollection_Success() throws Exception {
        CollectionInput input = new CollectionInput("New Collection", true);

        mockMvc.perform(post("/api/collection/collection-set/" + testCollectionSet.getId())
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Collection"))
                .andExpect(jsonPath("$.open").value(true));
    }

    @Test
    void testCreateCollection_Unauthorized() throws Exception {
        CollectionInput input = new CollectionInput("New Collection", true);

        mockMvc.perform(post("/api/collection/collection-set/" + testCollectionSet.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUpdateCollection_Success() throws Exception {
        CollectionInput input = new CollectionInput("Updated Collection", false);

        mockMvc.perform(patch("/api/collection/" + testCollection.getId())
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Collection"))
                .andExpect(jsonPath("$.open").value(false));
    }

    @Test
    void testDeleteCollection_Success() throws Exception {
        mockMvc.perform(delete("/api/collection/" + testCollection.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());
    }

    @Test
    void testGetFavorites_Success() throws Exception {
        mockMvc.perform(get("/api/collections/user/" + testUser.getId() + "/favorites")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
