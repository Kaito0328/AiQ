package com.example.myapp.dto;

import com.example.myapp.model.User;

public record UserOutput(Long id, String username, boolean official, boolean self) {

    public UserOutput(User user) {
        this(user.getId(), user.getUsername(), user.isOfficial(), false);
    }

    public UserOutput(User user, User loginUser) {
        this(user.getId(), user.getUsername(), user.isOfficial(),
                loginUser != null && user.getId().equals(loginUser.getId()));
    }
}
