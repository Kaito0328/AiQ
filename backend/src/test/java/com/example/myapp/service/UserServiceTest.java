package com.example.myapp.service;

import com.example.myapp.dto.UserOutput;
import com.example.myapp.exception.CustomException;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStats;
import com.example.myapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=password",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.flyway.enabled=false"
})
@Transactional
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        createTestUser();
    }

    private void createTestUser() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        
        UserStats userStats = new UserStats();
        testUser.setUserStats(userStats);
        userStats.setUser(testUser);
        
        testUser = userRepository.save(testUser);
    }

    @Test
    void testRegisterUser_Success() {
        User newUser = userService.registerUser("newuser", "password123");
        
        assertNotNull(newUser);
        assertEquals("newuser", newUser.getUsername());
        assertNotNull(newUser.getUserStats());
        assertTrue(passwordEncoder.matches("password123", newUser.getPassword()));
    }

    @Test
    void testRegisterUser_DuplicateUsername() {
        assertThrows(CustomException.class, () -> {
            userService.registerUser("testuser", "password123");
        });
    }

    @Test
    void testAuthenticate_Success() {
        User authenticatedUser = userService.authenticate("testuser", "password");
        
        assertNotNull(authenticatedUser);
        assertEquals("testuser", authenticatedUser.getUsername());
    }

    @Test
    void testAuthenticate_WrongPassword() {
        assertThrows(CustomException.class, () -> {
            userService.authenticate("testuser", "wrongpassword");
        });
    }

    @Test
    void testAuthenticate_NonExistentUser() {
        assertThrows(CustomException.class, () -> {
            userService.authenticate("nonexistent", "password");
        });
    }

    @Test
    void testGetUserById_Success() {
        User foundUser = userService.getUserById(testUser.getId());
        
        assertNotNull(foundUser);
        assertEquals(testUser.getId(), foundUser.getId());
        assertEquals("testuser", foundUser.getUsername());
    }

    @Test
    void testGetUserById_NotFound() {
        assertThrows(CustomException.class, () -> {
            userService.getUserById(99999L);
        });
    }

    @Test
    void testUpdateUser_Success() {
        UserOutput updateData = new UserOutput(testUser);
        
        User updatedUser = userService.updateUser(testUser, updateData);
        
        assertNotNull(updatedUser);
        assertEquals(testUser.getId(), updatedUser.getId());
    }

    @Test
    void testChangePassword_Success() {
        userService.changePassword(testUser, "password", "newpassword");
        
        // パスワードが変更されたことを確認
        User updatedUser = userRepository.findById(testUser.getId()).orElse(null);
        assertNotNull(updatedUser);
        assertTrue(passwordEncoder.matches("newpassword", updatedUser.getPassword()));
    }

    @Test
    void testChangePassword_WrongOldPassword() {
        assertThrows(CustomException.class, () -> {
            userService.changePassword(testUser, "wrongpassword", "newpassword");
        });
    }

    @Test
    void testDeleteUser_Success() {
        Long userId = testUser.getId();
        
        userService.deleteUser(testUser);
        
        User deletedUser = userRepository.findById(userId).orElse(null);
        assertNull(deletedUser);
    }

    @Test
    void testGetAllUsers_Success() {
        var users = userService.getAllUsers();
        
        assertNotNull(users);
        assertFalse(users.isEmpty());
        assertTrue(users.contains(testUser));
    }
}
