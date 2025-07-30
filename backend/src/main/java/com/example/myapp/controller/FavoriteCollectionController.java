package com.example.myapp.controller;

import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.model.Collection;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.FavoriteCollectionService;
import com.example.myapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FavoriteCollectionController {

    private final FavoriteCollectionService favoriteService;
    private final CollectionService collectionService;

    @PostMapping("/user/favorites/{collectionId}")
    public void addFavorite(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Long collectionId) {
        User user = UserService.getLoginUser(customUserDetails, true);

        Collection collection = collectionService.getViewCollection(collectionId, user);
        favoriteService.addFavorite(user, collection);
    }

    @DeleteMapping("/user/favorites/{collectionId}")
    public void removeFavorite(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Long collectionId) {
        User user = UserService.getLoginUser(customUserDetails, true);

        Collection collection = collectionService.getViewCollection(collectionId, user);
        favoriteService.removeFavorite(user, collection);
    }
}
