package com.example.myapp.dto.Item.CollectionSet;

public record CollectionSetInput(String name, String descriptionText) {
    public CollectionSetInput(String name) {
        this(name, null);
    }
}
