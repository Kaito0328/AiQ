package com.example.myapp.dto.Item.Request;

public record UpdateRequest<Input>(Long id, Input input) {
}
