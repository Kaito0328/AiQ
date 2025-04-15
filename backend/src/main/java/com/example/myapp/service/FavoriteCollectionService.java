package com.example.myapp.service;

import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionStats;
import com.example.myapp.model.FavoriteCollection;
import com.example.myapp.model.User;
import com.example.myapp.repository.FavoriteCollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteCollectionService {
    private final FavoriteCollectionRepository favoriteCollectionRepository;

    public List<FavoriteCollection> getFavoriteCollections(User user) {
        return favoriteCollectionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void addFavorite(User user, CollectionStats collectionStats, Collection collection) {
        if (!favoriteCollectionRepository.existsByUserAndCollection(user, collection)) {
            FavoriteCollection favorite = new FavoriteCollection();
            favorite.setUser(user);
            favorite.setCollection(collection);
            favoriteCollectionRepository.save(favorite);
            collectionStats.incrementFavoriteCount();
        }
    }

    public void removeFavorite(User user, CollectionStats collectionStats, Collection collection) {
        favoriteCollectionRepository.deleteByUserAndCollection(user, collection);
        collectionStats.decrementFavoriteCount();
    }
}
