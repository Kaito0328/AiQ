package com.example.myapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;

@RestController
public class RootController {

    @Value("${jwt.secret.key}")
    private String jwtSecret;

    @GetMapping("/")
    public String root() {
        return "AiQ Backend API is running!";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
    
    @GetMapping("/debug/jwt")
    public String jwtDebug() {
        return "JWT Secret (first 10 chars): " + jwtSecret.substring(0, Math.min(10, jwtSecret.length())) + "...";
    }
}
