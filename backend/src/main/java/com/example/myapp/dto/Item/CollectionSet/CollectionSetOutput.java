package com.example.myapp.dto.Item.CollectionSet;

import com.example.myapp.model.CollectionSet;

public record CollectionSetOutput(Long id, String name) {
    public CollectionSetOutput(CollectionSet collectionSet) {
        this(collectionSet.getId(), collectionSet.getName());
    }
}
