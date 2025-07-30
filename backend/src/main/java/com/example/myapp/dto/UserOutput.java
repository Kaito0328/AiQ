package com.example.myapp.dto;

import com.example.myapp.model.User;
public record UserOutput(Long id, String username, boolean official, boolean self, long followerCount, long followingCount, boolean following, boolean followed) {

    public UserOutput(User user) {
        this(user.getId(), user.getUsername(), user.isOfficial(), false, user.getUserStats().getFollowerCount(), user.getUserStats().getFollowingCount(), false, false);
    }

    public UserOutput(User user, User loginUser, boolean following, boolean followed) {
        this(user.getId(), user.getUsername(), user.isOfficial(),
                loginUser != null && user.getId().equals(loginUser.getId()), user.getUserStats().getFollowerCount(), user.getUserStats().getFollowingCount(), following, followed);
    }
}
