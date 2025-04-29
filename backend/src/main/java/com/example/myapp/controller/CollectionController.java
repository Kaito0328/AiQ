package com.example.myapp.controller;

import java.util.List;
import java.util.stream.Collectors;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.CollectionSetService;
import com.example.myapp.service.FavoriteCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.dto.Item.BatchResponse.BatchDeleteResponse;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.Collection.CollectionInput;
import com.example.myapp.dto.Item.Collection.CollectionOutput;
import com.example.myapp.dto.Item.Request.BatchUpsertRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.myapp.service.UserService;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.model.Collection;

@RestController
@RequestMapping("/api")
public class CollectionController {
        private final CollectionService collectionService;
        private final CollectionSetService collectionSetService;
        private final FavoriteCollectionService favoriteCollectionService;
        private final UserService userService;

        @Autowired
        public CollectionController(CollectionService collectionService,
                        CollectionSetService collectionSetService, FavoriteCollectionService favoriteCollectionService, UserService userService) {
                this.collectionService = collectionService;
                this.collectionSetService = collectionSetService;
                this.favoriteCollectionService = favoriteCollectionService;
                this.userService = userService;
        }

        private List<CollectionOutput> convertCollectionOutputs(User loginUser, List<Collection> collections) {
                return collections.stream().map(
                        collection -> new CollectionOutput(collection, favoriteCollectionService.favorite(loginUser, collection))
                ).collect(Collectors.toList());
        }

        @GetMapping("/collection/{id}")
        public ResponseEntity<CollectionOutput> getCollection(@PathVariable Long id,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, false);
                Collection collection = collectionService.getViewCollection(id, user);
                boolean favorite = favoriteCollectionService.favorite(user, collection);
                
                CollectionOutput collectionOutput = new CollectionOutput(collection, favorite);
                return ResponseEntity.ok(collectionOutput);
        }

        @GetMapping("/collections/user/{userId}")
        public ResponseEntity<List<CollectionOutput>> getCollectionSetsByUserId(
                        @PathVariable Long userId,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User viewer = UserService.getLoginUser(customUserDetails, false);
                User owner = userService.getUserById(userId);

                List<CollectionSet> collectionSets =
                                collectionSetService.getViewCollectionSetsByUser(owner, viewer);

                List<Collection> collections = collectionService
                                .getCollectionsByCollectionSets(collectionSets, viewer);

                List<CollectionOutput> collectionOutputs = convertCollectionOutputs(viewer, collections);
                return ResponseEntity.ok(collectionOutputs);
        }

        @GetMapping("/collections/collection-set/{collectionSetId}")
        public ResponseEntity<List<CollectionOutput>> getCollectionsByCollectionSetId(
                        @PathVariable Long collectionSetId,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User viewer = UserService.getLoginUser(customUserDetails, false);

                CollectionSet collectionSet =
                                collectionSetService.getViewCollectionSet(collectionSetId, viewer);

                List<Collection> collections = collectionService
                                .getCollectionsByCollectionSet(collectionSet, viewer);
                
                List<CollectionOutput> collectionOutputs = convertCollectionOutputs(viewer, collections);
                return ResponseEntity.ok(collectionOutputs);
        }

        
        @GetMapping("/collections/user/{userId}/favorites")
        public List<CollectionOutput> getFavorites(@PathVariable Long userId, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User loginUser = UserService.getLoginUser(customUserDetails, false);
                User user = userService.getUserById(userId);

                List<Collection> collections = favoriteCollectionService.getFavoriteCollections(user, loginUser);

                return ListTransformUtil.toCollectionOutputs(collections);
        }

        @PostMapping("/collection/collection-set/{collectionSetId}")
        public ResponseEntity<CollectionOutput> createCollection(@PathVariable Long collectionSetId,
                        @RequestBody CollectionInput collectionInput,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                CollectionSet collectionSet =
                                collectionSetService.getManageCollectionSet(collectionSetId, user);

                Collection collection = collectionService.createCollection(collectionInput,
                                collectionSet, user);
                                
                collectionSetService.changeVisibility(collection);
                return ResponseEntity.ok(new CollectionOutput(collection));
        }

        @PatchMapping("/collection/{id}")
        public ResponseEntity<CollectionOutput> updateCollection(@PathVariable Long id,
                        @RequestBody CollectionInput collectionInput,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                Collection collection =
                                collectionService.updateCollection(id, collectionInput, user);
                
                collectionSetService.changeVisibility(collection);
                boolean favorite = favoriteCollectionService.favorite(user, collection);

                return ResponseEntity.ok(new CollectionOutput(collection, favorite));
        }

        @PostMapping("/collections/collection-set/{collectionSetId}")
        public ResponseEntity<BatchUpsertResponse<CollectionOutput>> upSertCollections(
                        @RequestBody BatchUpsertRequest<CollectionInput> request,
                        @PathVariable Long collectionSetId,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                CollectionSet collectionSet =
                                collectionSetService.getManageCollectionSet(collectionSetId, user);

                BatchUpsertResponse<Collection> upsertedCollections = collectionService
                                .batchUpsertCollection(collectionSet, request.updatesRequest(),
                                                request.createsRequest(), user);

                collectionSetService.changeVisibility(collectionSet, upsertedCollections.successItems());

                List<CollectionOutput> collectionOutputs = convertCollectionOutputs(user, upsertedCollections.successItems());
                

                return ResponseEntity.ok(new BatchUpsertResponse<CollectionOutput>(collectionOutputs, upsertedCollections.failedCreateItems(), upsertedCollections.failedUpdateItems()));
        }

        @DeleteMapping("/collection/{id}")
        public ResponseEntity<CollectionOutput> deleteCollection(@PathVariable Long id,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                Collection collection = collectionService.deleteCollection(id, user);
                return ResponseEntity.ok(new CollectionOutput(collection));
        }

        @DeleteMapping("/collections/collection-set/{collectionSetId}")
        public ResponseEntity<BatchDeleteResponse<CollectionOutput>> deleteCollections(
                        @RequestBody List<Long> ids,
                        @PathVariable Long collectionSetId,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                
                CollectionSet collectionSet =
                                collectionSetService.getManageCollectionSet(collectionSetId, user);

                BatchDeleteResponse<Collection> deleteResponse =
                                collectionService.deleteCollections(collectionSet, ids, user);

                List<CollectionOutput> collectionOutputs = ListTransformUtil.toCollectionOutputs(deleteResponse.successItems()); 
                                
                return ResponseEntity.ok(new BatchDeleteResponse<CollectionOutput>(collectionOutputs, deleteResponse.failedItems()));
        }
}
