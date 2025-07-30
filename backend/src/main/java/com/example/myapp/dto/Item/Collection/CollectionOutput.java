package com.example.myapp.dto.Item.Collection;

import com.example.myapp.model.Collection;

public record CollectionOutput(Long id, String name, Boolean open, Long collectionSetId, long favoriteCount, boolean favorite, long userId) {
    public CollectionOutput(Collection collection) {
        this(collection.getId(), collection.getName(), collection.isOpen(),
                collection.getCollectionSet().getId(), collection.getCollectionStats().getFavoriteCount(), false, collection.getCollectionSet().getUser().getId());
    }

    public CollectionOutput(Collection collection, boolean favorite) {
        this(collection.getId(), collection.getName(), collection.isOpen(),
                collection.getCollectionSet().getId(), collection.getCollectionStats().getFavoriteCount(), favorite, collection.getCollectionSet().getUser().getId());
    }
}
