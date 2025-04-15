package com.example.myapp.controller;

import java.util.List;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionSetService;
import com.example.myapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.dto.Item.BatchResponse.BatchDeleteResponse;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.CollectionSet.CollectionSetInput;
import com.example.myapp.dto.Item.CollectionSet.CollectionSetOutput;
import com.example.myapp.dto.Item.Request.BatchUpsertRequest;


@RestController
@RequestMapping("/api")
public class CollectionSetController {

	private final CollectionSetService collectionSetService;
	private final UserService userService;

	@Autowired
	public CollectionSetController(CollectionSetService collectionSetService,
			UserService userService) {
		this.collectionSetService = collectionSetService;
		this.userService = userService;
	}

	@GetMapping("/collection-set/{id}")
	public ResponseEntity<CollectionSetOutput> getCollectionSet(@PathVariable Long id,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, false);
		CollectionSetOutput collectionSetOutput = collectionSetService.getCollectionSet(id, user);

		return ResponseEntity.ok(collectionSetOutput);
	}

	@GetMapping("/collection-sets/user/{userId}")
	public ResponseEntity<List<CollectionSetOutput>> getCollectionSetsByUserId(
			@PathVariable Long userId,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User viewer = UserService.getLoginUser(customUserDetails, false);
		User owner = userService.getUserById(userId);

		List<CollectionSetOutput> collectionSetDTOs =
				collectionSetService.getCollectionSetsByUser(owner, viewer);
		return ResponseEntity.ok(collectionSetDTOs);
	}

	@PostMapping("/collection-set")
	public ResponseEntity<CollectionSetOutput> createCollectionSet(
			@RequestBody CollectionSetInput collectionSetInput,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, true);

		CollectionSetOutput collectionSetDTO =
				collectionSetService.createCollectionSet(collectionSetInput, user);
		return ResponseEntity.ok(collectionSetDTO); // 更新後のCollectionSetを返す
	}


	// @PostMapping("/collection-sets")
	// public ResponseEntity<List<CollectionSetOutput>> createCollectionSets(
	// @RequestBody List<CollectionSetInput> collectionSetInputs,
	// @AuthenticationPrincipal CustomUserDetails customUserDetails) {
	// User user = UserService.getLoginUser(customUserDetails, true);

	// List<CollectionSetOutput> collectionSetDTOs =
	// collectionSetService.createCollectionSets(collectionSetInputs, user);
	// return ResponseEntity.ok(collectionSetDTOs); // 更新後のCollectionSetを返す
	// }

	// コレクションセットの名前を変更
	@PatchMapping("/collection-set/{id}")
	public ResponseEntity<CollectionSetOutput> updateCollectionSet(@PathVariable Long id,
			@RequestBody CollectionSetInput collectionSetInput,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, true);

		CollectionSetOutput updatedCollectionSet =
				collectionSetService.updateCollectionSet(id, collectionSetInput, user);
		return ResponseEntity.ok(updatedCollectionSet); // 更新後のCollectionSetを返す
	}

	@PostMapping("/collection-sets")
	public ResponseEntity<BatchUpsertResponse<CollectionSetOutput>> upSertCollectionSets(
			@RequestBody BatchUpsertRequest<CollectionSetInput> request,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User loginUser = UserService.getLoginUser(customUserDetails, true);

		BatchUpsertResponse<CollectionSetOutput> updatedCollectionSets =
				collectionSetService.batchUpsertCollection(loginUser, request.updatesRequest(),
						request.createsRequest(), loginUser);

		return ResponseEntity.ok(updatedCollectionSets);
	}

	// @PatchMapping("/collection-sets")
	// public ResponseEntity<List<CollectionSetOutput>> updateCollectionSets(
	// @RequestBody List<CollectionSetInputWithId> collectionSetInputWithIds,
	// @AuthenticationPrincipal CustomUserDetails customUserDetails) {
	// User user = UserService.getLoginUser(customUserDetails, true);

	// List<CollectionSetOutput> updatedCollectionSets =
	// collectionSetService.updateCollectionSets(collectionSetInputWithIds, user);
	// return ResponseEntity.ok(updatedCollectionSets); // 更新後のCollectionSetを返す
	// }

	@DeleteMapping("/collection-set/{id}")
	public ResponseEntity<CollectionSetOutput> deleteCollectionSet(@PathVariable Long id,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, true);

		CollectionSetOutput collectionSetDTO = collectionSetService.deleteCollectionSet(id, user);
		return ResponseEntity.ok(collectionSetDTO);
	}

	@DeleteMapping("/collection-sets")
	public ResponseEntity<BatchDeleteResponse<CollectionSetOutput>> deleteCollectionSets(
			@RequestBody List<Long> ids,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, true);

		BatchDeleteResponse<CollectionSetOutput> collectionSetDTOs =
				collectionSetService.deleteCollectionSets(ids, user);
		return ResponseEntity.ok(collectionSetDTOs);
	}

	// @GetMapping("/user")
	// public ResponseEntity<List<CollectionSetDTO>> getUserCollectionSets(
	// @AuthenticationPrincipal CustomUserDetails customUserDetails) {
	// User user = customUserDetails.getUser();
	// List<CollectionSet> collectionSets =
	// collectionSetService.getCollectionSetsByUser(user, user);
	// List<CollectionSetDTO> collectionSetDTOs =
	// collectionSetService.convertCollectionDTOs(collectionSets);
	// return ResponseEntity.ok(collectionSetDTOs);
	// }

	// @GetMapping("/official")
	// public ResponseEntity<List<CollectionSetDTO>> getOfficialCollectionSets() {
	// User officialUser = UserService.getOfficialUser();
	// List<CollectionSet> collectionSets =
	// collectionSetService.getCollectionSetsByUser(null, officialUser);
	// List<CollectionSetDTO> collectionSetDTOs =
	// collectionSetService.convertCollectionDTOs(collectionSets);
	// return ResponseEntity.ok(collectionSetDTOs);
	// }


	// @PostMapping("/create")
	// public ResponseEntity<CollectionSet> createCollectionSet(
	// @AuthenticationPrincipal CustomUserDetails customUserDetails,
	// @RequestParam String name) {
	// User user = customUserDetails.getUser();
	// CollectionSet collectionSet = collectionSetService.createCollectionSet(user, name);
	// return ResponseEntity.ok(collectionSet);
	// }

	// @PostMapping("/addCollection")
	// public ResponseEntity<Collection> addCollectionToSet(
	// @AuthenticationPrincipal CustomUserDetails customUserDetails,
	// @RequestParam String collectionSetName, @RequestParam String collectionName) {

	// User user = customUserDetails.getUser();
	// Collection collection =
	// collectionService.getOrCreateCollection(user, collectionSetName, collectionName);
	// return ResponseEntity.ok(collection);
	// }
}
