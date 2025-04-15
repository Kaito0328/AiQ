package com.example.myapp.dto;

public record ChangePasswordRequest(String oldPassword, String newPassword) {
}
