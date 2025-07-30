package com.example.myapp.controller;

import com.example.myapp.model.User;
import com.example.myapp.model.UserStats;
import com.example.myapp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FollowControllerTest extends BaseControllerTest {

    @Autowired
    private UserRepository userRepository;

    private User targetUser;

    @Override
    protected void createTestUser() {
        super.createTestUser();
        createTargetUser();
    }

    private void createTargetUser() {
        targetUser = new User();
        targetUser.setUsername("targetuser");
        targetUser.setEmail("target@example.com");
        targetUser.setPassword(passwordEncoder.encode("password"));
        
        UserStats userStats = new UserStats();
        targetUser.setUserStats(userStats);
        userStats.setUser(targetUser);
        
        targetUser = userRepository.save(targetUser);
    }

    @Test
    void testGetFollowers_Success() throws Exception {
        mockMvc.perform(get("/api/user/" + testUser.getId() + "/followers")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetFollowees_Success() throws Exception {
        mockMvc.perform(get("/api/user/" + testUser.getId() + "/followees")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testFollow_Success() throws Exception {
        mockMvc.perform(post("/api/user/follow/" + targetUser.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());
    }

    @Test
    void testFollow_Unauthorized() throws Exception {
        mockMvc.perform(post("/api/user/follow/" + targetUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testFollow_SelfFollow() throws Exception {
        // 自分自身をフォローしようとする（現在の実装では許可されている）
        mockMvc.perform(post("/api/user/follow/" + testUser.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());
    }

    @Test
    void testFollow_NonExistentUser() throws Exception {
        mockMvc.perform(post("/api/user/follow/99999")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUnfollow_Success() throws Exception {
        // まずフォローしてからアンフォロー
        mockMvc.perform(post("/api/user/follow/" + targetUser.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/user/unfollow/" + targetUser.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());
    }

    @Test
    void testUnfollow_Unauthorized() throws Exception {
        mockMvc.perform(delete("/api/user/unfollow/" + targetUser.getId()))
                .andExpect(status().isUnauthorized());
    }
}