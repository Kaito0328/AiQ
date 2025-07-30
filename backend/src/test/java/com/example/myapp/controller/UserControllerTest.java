package com.example.myapp.controller;

import com.example.myapp.dto.ChangePasswordRequest;
import com.example.myapp.dto.UserOutput;
import org.junit.jupiter.api.Test;
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
class UserControllerTest extends BaseControllerTest {

    @Test
    void testGetLoginUser_Success() throws Exception {
        mockMvc.perform(get("/api/user")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.self").value(true))
                .andExpect(jsonPath("$.followerCount").value(0))
                .andExpect(jsonPath("$.followingCount").value(0));
    }

    @Test
    void testGetLoginUser_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/user"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUpdateUser_Success() throws Exception {
        UserOutput updateRequest = new UserOutput(testUser);

        mockMvc.perform(put("/api/user")
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void testChangePassword_Success() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest("password", "newpassword");

        mockMvc.perform(put("/api/user/password")
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void testChangePassword_WrongOldPassword() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest("wrongpassword", "newpassword");

        mockMvc.perform(put("/api/user/password")
                .header("Authorization", "Bearer " + testToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetUserById_Success() throws Exception {
        mockMvc.perform(get("/api/user/id/" + testUser.getId())
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void testGetUserById_NotFound() throws Exception {
        mockMvc.perform(get("/api/user/id/99999")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetLoginUserId_Success() throws Exception {
        mockMvc.perform(get("/api/user/id-only")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(testUser.getId()));
    }

    @Test
    void testGetAllUsers_Success() throws Exception {
        mockMvc.perform(get("/api/user/users")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testDeleteUser_Success() throws Exception {
        mockMvc.perform(delete("/api/user")
                .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk());
    }
}
