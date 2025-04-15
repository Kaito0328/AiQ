package com.example.myapp.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.myapp.model.User;
import com.example.myapp.service.UserService;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.dto.ChangePasswordRequest;
import com.example.myapp.dto.UserOutput;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<UserOutput> getLoginUser(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);
        return ResponseEntity.ok(new UserOutput(user, user));
    }

    @PutMapping
    public ResponseEntity<UserOutput> updateUser(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody UserOutput userDTO) {

        User user = UserService.getLoginUser(customUserDetails, true);

        // ユーザー情報の更新
        user = userService.updateUser(user, userDTO);

        return ResponseEntity.ok(new UserOutput(user));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody ChangePasswordRequest request) {

        User user = UserService.getLoginUser(customUserDetails, true);

        userService.changePassword(user, request.oldPassword(), request.newPassword());

        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, true);
        userService.deleteUser(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/official")
    public ResponseEntity<UserOutput> getOfficialUser() {
        return ResponseEntity.ok(new UserOutput(UserService.getOfficialUser()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserOutput>> getAllUsers(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        List<User> users = userService.findAll();
        User loginUser = UserService.getLoginUser(customUserDetails, false);
        List<UserOutput> userDTOs = ListTransformUtil.toUserOutputs(users, loginUser);

        userDTOs = userDTOs.stream().filter(userDTO -> !userDTO.official() && !userDTO.self())
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/id/{userId}")
    public ResponseEntity<UserOutput> getUserById(@PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        User user = userService.getUserById(userId);
        if (user == null) {
            throw new CustomException(ErrorCode.NOT_FOUND_USER);
        }

        User loginUser = UserService.getLoginUser(customUserDetails, false);
        UserOutput userDTO = new UserOutput(user, loginUser);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/id-only")
    public ResponseEntity<Long> getLoginUserId(
            @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        User user = UserService.getLoginUser(customUserDetails, false);
        return ResponseEntity.ok(user.getId());
    }

    @GetMapping("/id-only/official")
    public ResponseEntity<Long> getOfficialUserId() {
        return ResponseEntity.ok(UserService.getOfficialUser().getId());
    }

}
