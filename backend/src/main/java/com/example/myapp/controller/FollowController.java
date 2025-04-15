package com.example.myapp.controller;

import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.model.Follow;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStats;
import com.example.myapp.service.FollowService;
import com.example.myapp.service.UserService;
import lombok.RequiredArgsConstructor;
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
    public List<Follow> getFollowers(@PathVariable Long userId) {
        User user = userService.findById(userId);
        return followService.getFollowers(user);
    }

    @GetMapping("user/{userId}/followees")
    public List<Follow> getFollowees(@PathVariable Long userId) {
        User user = userService.findById(userId);
        return followService.getFollowees(user);
    }

    @PostMapping("user/follow/{targetId}")
    public void follow(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Long targetId) {
        User follower = UserService.getLoginUser(customUserDetails, true);
        UserStats followerStats = userService.getUserStats(follower);
        User followee = userService.findById(targetId);
        UserStats followeeStats = userService.getUserStats(followee);
        followService.follow(follower, followerStats, followee, followeeStats);
    }

    @DeleteMapping("user/unfollow/{targetId}")
    public void unfollow(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Long targetId) {
        User follower = UserService.getLoginUser(customUserDetails, true);
        UserStats followerStats = userService.getUserStats(follower);
        User followee = userService.findById(targetId);
        UserStats followeeStats = userService.getUserStats(followee);
        followService.unfollow(follower, followerStats, followee, followeeStats);
    }
}
