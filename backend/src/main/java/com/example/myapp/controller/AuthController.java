package com.example.myapp.controller;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import com.example.myapp.JWT.JwtUtil;
import com.example.myapp.dto.AuthRequest;
import com.example.myapp.dto.AuthResponse;
import com.example.myapp.model.User;
import com.example.myapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {
        userService.registerUser(request.username(), request.password());
        return ResponseEntity.ok("ユーザー登録成功");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        User user = userService.authenticate(request.username(), request.password());
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
