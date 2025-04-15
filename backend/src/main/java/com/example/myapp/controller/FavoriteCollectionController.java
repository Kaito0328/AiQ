package com.example.myapp.controller;
import com.example.myapp.JWT.CustomUserDetails;
// UserRelationController.java
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionStats;
import com.example.myapp.model.FavoriteCollection;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.FavoriteCollectionService;
import com.example.myapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FavoriteCollectionController {

    private final FavoriteCollectionService favoriteService;
    private final CollectionService collectionService;
    private final UserService userService;

    @GetMapping("/user/{userId}/favorites")
    public List<FavoriteCollection> getFavorites(@PathVariable Long userId) {
        User user = userService.findById(userId);
        return favoriteService.getFavoriteCollections(user);
    }

    @PostMapping("/user/favorites/{collectionId}")
    public void addFavorite(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Long collectionId) {
        User user = UserService.getLoginUser(customUserDetails, true);

        Collection collection = collectionService.findById(collectionId);
        CollectionStats collectionStats = collectionService.getCollectionStats(collection);
        favoriteService.addFavorite(user, collectionStats,collection);
    }

    @DeleteMapping("/user/favorites/{collectionId}")
    public void removeFavorite(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Long collectionId) {
        User user = UserService.getLoginUser(customUserDetails, true);

        Collection collection = collectionService.findById(collectionId);
        CollectionStats collectionStats = collectionService.getCollectionStats(collection);
        favoriteService.removeFavorite(user, collectionStats, collection);
    }
}
