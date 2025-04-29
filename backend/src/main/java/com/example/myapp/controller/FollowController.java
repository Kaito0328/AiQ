package com.example.myapp.controller;

import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.dto.UserOutput;
import com.example.myapp.model.User;
import com.example.myapp.service.FollowService;
import com.example.myapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final UserService userService; // 任意のユーザー取得に使うと仮定

    @GetMapping("user/{userId}/followers")
    public List<UserOutput> getFollowers(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return followService.getFollowers(user);
    }

    @GetMapping("user/{userId}/followees")
    public List<UserOutput> getFollowees(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return followService.getFollowees(user);
    }

    @PostMapping("user/follow/{targetId}")
    public ResponseEntity<Void> follow(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Long targetId) {
        User follower = UserService.getLoginUser(customUserDetails, true);
        User followee = userService.getUserById(targetId);
        followService.follow(follower, followee);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("user/unfollow/{targetId}")
    public ResponseEntity<Void> unfollow(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Long targetId) {
        User follower = UserService.getLoginUser(customUserDetails, true);
        User followee = userService.getUserById(targetId);
        followService.unfollow(follower, followee);
        return ResponseEntity.ok().build();
    }
}
