package com.example.myapp.dto.Item.Collection;

import com.example.myapp.model.Collection;

public record CollectionOutput(Long id, String name, Boolean open, Long collectionSetId) {
    public CollectionOutput(Collection collection) {
        this(collection.getId(), collection.getName(), collection.isOpen(),
                collection.getCollectionSet().getId());
    }
}
