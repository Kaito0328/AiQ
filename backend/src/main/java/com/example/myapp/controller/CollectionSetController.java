package com.example.myapp.controller;

import java.util.List;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.User;
import com.example.myapp.service.CollectionSetService;
import com.example.myapp.service.UserService;
import com.example.myapp.util.ListTransformUtil;
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
		CollectionSet collectionSet = collectionSetService.getViewCollectionSet(id, user);

		return ResponseEntity.ok(new CollectionSetOutput(collectionSet));
	}

	@GetMapping("/collection-sets/user/{userId}")
	public ResponseEntity<List<CollectionSetOutput>> getCollectionSetsByUserId(
			@PathVariable Long userId,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User viewer = UserService.getLoginUser(customUserDetails, false);
		User owner = userService.getUserById(userId);

		List<CollectionSet> collectionSets =
				collectionSetService.getViewCollectionSetsByUser(owner, viewer);
		return ResponseEntity.ok(ListTransformUtil.toCollectionSetOutputs(collectionSets));
	}

	@PostMapping("/collection-set")
	public ResponseEntity<CollectionSetOutput> createCollectionSet(
			@RequestBody CollectionSetInput collectionSetInput,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, true);

		CollectionSet collectionSet =
				collectionSetService.createCollectionSet(collectionSetInput, user);
		return ResponseEntity.ok(new CollectionSetOutput(collectionSet)); // 更新後のCollectionSetを返す
	}

	@PatchMapping("/collection-set/{id}")
	public ResponseEntity<CollectionSetOutput> updateCollectionSet(@PathVariable Long id,
			@RequestBody CollectionSetInput collectionSetInput,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, true);

		CollectionSet updatedCollectionSet =
				collectionSetService.updateCollectionSet(id, collectionSetInput, user);
		return ResponseEntity.ok(new CollectionSetOutput(updatedCollectionSet)); // 更新後のCollectionSetを返す
	}

	@PostMapping("/collection-sets")
	public ResponseEntity<BatchUpsertResponse<CollectionSetOutput>> upSertCollectionSets(
			@RequestBody BatchUpsertRequest<CollectionSetInput> request,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User loginUser = UserService.getLoginUser(customUserDetails, true);

		BatchUpsertResponse<CollectionSet> upSertResponse =
				collectionSetService.batchUpsertCollection(loginUser, request.updatesRequest(),
						request.createsRequest(), loginUser);
		
		List<CollectionSetOutput> collectionSetOutputs = ListTransformUtil.toCollectionSetOutputs(upSertResponse.successItems());

		return ResponseEntity.ok(new BatchUpsertResponse<CollectionSetOutput>(collectionSetOutputs, upSertResponse.failedCreateItems(), upSertResponse.failedUpdateItems()));
	}

	@DeleteMapping("/collection-set/{id}")
	public ResponseEntity<CollectionSetOutput> deleteCollectionSet(@PathVariable Long id,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, true);

		CollectionSet collectionSet = collectionSetService.deleteCollectionSet(id, user);
		return ResponseEntity.ok(new CollectionSetOutput(collectionSet));
	}

	@DeleteMapping("/collection-sets")
	public ResponseEntity<BatchDeleteResponse<CollectionSetOutput>> deleteCollectionSets(
			@RequestBody List<Long> ids,
			@AuthenticationPrincipal CustomUserDetails customUserDetails) {
		User user = UserService.getLoginUser(customUserDetails, true);

		BatchDeleteResponse<CollectionSet> deleteResponse =
				collectionSetService.deleteCollectionSets(ids, user);
		
		List<CollectionSetOutput> collectionSetOutputs = ListTransformUtil.toCollectionSetOutputs(deleteResponse.successItems());
		return ResponseEntity.ok(new BatchDeleteResponse<CollectionSetOutput>(collectionSetOutputs, deleteResponse.failedItems()));
	}
}
