package com.example.myapp.controller;

import java.util.List;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionService;
import com.example.myapp.service.CollectionSetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
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


@RestController
@RequestMapping("/api")
public class CollectionController {
        private final CollectionService collectionService;
        private final CollectionSetService collectionSetService;
        private final UserService userService;

        @Autowired
        public CollectionController(CollectionService collectionService,
                        CollectionSetService collectionSetService, UserService userService) {
                this.collectionService = collectionService;
                this.collectionSetService = collectionSetService;
                this.userService = userService;
        }

        @GetMapping("/collection/{id}")
        public ResponseEntity<CollectionOutput> getCollection(@PathVariable Long id,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, false);
                CollectionOutput collectionOutput = collectionService.getCollection(id, user);

                return ResponseEntity.ok(collectionOutput);
        }


        @GetMapping("/collections/user/{userId}")
        public ResponseEntity<List<CollectionOutput>> getCollectionSetsByUserId(
                        @PathVariable Long userId,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User viewer = UserService.getLoginUser(customUserDetails, false);
                User owner = userService.getUserById(userId);

                List<CollectionSet> collectionSets =
                                collectionSetService.findCollectionSetsByUser(owner);

                List<CollectionOutput> collectionDTOs = collectionService
                                .getCollectionsByCollectionSetIds(collectionSets, viewer);

                return ResponseEntity.ok(collectionDTOs);
        }

        @GetMapping("/collections/collection-set/{collectionSetId}")
        public ResponseEntity<List<CollectionOutput>> getCollectionsByCollectionSetId(
                        @PathVariable Long collectionSetId,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User viewer = UserService.getLoginUser(customUserDetails, false);

                CollectionSet collectionSet =
                                collectionSetService.findCollectionSetById(collectionSetId);

                List<CollectionOutput> collectionDTOs = collectionService
                                .getCollectionsByCollectionSetId(collectionSet, viewer);

                return ResponseEntity.ok(collectionDTOs);
        }

        @PostMapping("/collection/collection-set/{collectionSetId}")
        public ResponseEntity<CollectionOutput> createCollection(@PathVariable Long collectionSetId,
                        @RequestBody CollectionInput collectionInput,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                CollectionSet collectionSet =
                                collectionSetService.findCollectionSetById(collectionSetId);

                CollectionOutput collectionDTO = collectionService.createCollection(collectionInput,
                                collectionSet, user);
                return ResponseEntity.ok(collectionDTO);
        }

        // @PostMapping("/collections/collection-set/{collectionSetId}")
        // public ResponseEntity<List<CollectionOutput>> createCollections(
        // @PathVariable Long collectionSetId,
        // @RequestBody List<CollectionInput> collectionInputs,
        // @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        // User user = UserService.getLoginUser(customUserDetails, true);

        // CollectionSet collectionSet =
        // collectionSetService.findCollectionSetById(collectionSetId);

        // List<CollectionOutput> collectionDTOs = collectionService
        // .createCollections(collectionInputs, collectionSet, user);
        // return ResponseEntity.ok(collectionDTOs);
        // }

        @PatchMapping("/collection/{id}")
        public ResponseEntity<CollectionOutput> updateCollection(@PathVariable Long id,
                        @RequestBody CollectionInput collectionInput,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                CollectionOutput updatedCollection =
                                collectionService.updateCollection(id, collectionInput, user);

                return ResponseEntity.ok(updatedCollection);
        }

        @PostMapping("/collections/collection-set/{collectionSetId}")
        public ResponseEntity<BatchUpsertResponse<CollectionOutput>> upSertCollections(
                        @RequestBody BatchUpsertRequest<CollectionInput> request,
                        @PathVariable Long collectionSetId,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                CollectionSet collectionSet =
                                collectionSetService.findCollectionSetById(collectionSetId);

                BatchUpsertResponse<CollectionOutput> updatedCollections = collectionService
                                .batchUpsertCollection(collectionSet, request.updatesRequest(),
                                                request.createsRequest(), user);

                return ResponseEntity.ok(updatedCollections);
        }

        // @PatchMapping("/collections")
        // public ResponseEntity<List<CollectionOutput>> updateCollections(
        // @RequestBody List<CollectionInputWithId> collectionInputWithIds,
        // @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        // User user = UserService.getLoginUser(customUserDetails, true);

        // List<CollectionOutput> updatedCollections =
        // collectionService.updateCollections(collectionInputWithIds, user);

        // return ResponseEntity.ok(updatedCollections);
        // }

        @DeleteMapping("/collection/{id}")
        public ResponseEntity<CollectionOutput> deleteCollection(@PathVariable Long id,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                CollectionOutput collectionOutput = collectionService.deleteCollection(id, user);
                return ResponseEntity.ok(collectionOutput);
        }



        @DeleteMapping("/collections")
        public ResponseEntity<BatchDeleteResponse<CollectionOutput>> deleteCollections(
                        @RequestBody List<Long> ids,
                        @AuthenticationPrincipal CustomUserDetails customUserDetails) {
                User user = UserService.getLoginUser(customUserDetails, true);

                BatchDeleteResponse<CollectionOutput> collectionOutputs =
                                collectionService.deleteCollections(ids, user);
                return ResponseEntity.ok(collectionOutputs);
        }

        // @GetMapping("/user")
        // public ResponseEntity<List<CollectionDTO>> getUserCollections(
        // @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        // User user = customUserDetails.getUser();
        // List<Collection> collections = collectionSetService.getCollectionsByUser(user, user);
        // List<CollectionDTO> collectionDTOs =
        // collectionService.convertCollectionDTOs(collections);
        // return ResponseEntity.ok(collectionDTOs);
        // }
}
