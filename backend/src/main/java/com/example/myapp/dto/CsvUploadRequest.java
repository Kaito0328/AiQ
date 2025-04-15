package com.example.myapp.dto;

import org.springframework.web.multipart.MultipartFile;

public record CsvUploadRequest(MultipartFile file) {
}
