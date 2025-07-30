package com.example.myapp.dto.Item.Collection;

public record CollectionInput(String name, Boolean open, String descriptionText) {
    public CollectionInput(String name, Boolean open) {
        this(name, open, null);
    }
}
