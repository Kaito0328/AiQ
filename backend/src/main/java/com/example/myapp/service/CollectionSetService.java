package com.example.myapp.service;

import com.example.myapp.dto.Item.BatchResponse.BatchDeleteResponse;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.BatchResponse.FailedCreateItem;
import com.example.myapp.dto.Item.BatchResponse.FailedItem;
import com.example.myapp.dto.Item.CollectionSet.CollectionSetInput;
import com.example.myapp.dto.Item.CollectionSet.CollectionSetOutput;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.dto.Item.Request.UpdateRequest;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import com.example.myapp.exception.ErrorDetail;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.User;
import com.example.myapp.repository.CollectionSetRepository;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.util.PermissionCheck;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
public class CollectionSetService {
    private final CollectionSetRepository collectionSetRepository;

    @Autowired
    public CollectionSetService(CollectionSetRepository collectionSetRepository) {
        this.collectionSetRepository = collectionSetRepository;
    }

    private List<ErrorDetail> getValidationErrors(CollectionSet collectionSet) {
        List<ErrorCode> errorCodes = new ArrayList<>();
        if (isDuplicate(collectionSet))
            errorCodes.add(ErrorCode.DUPLICATE_COLLECTIONSET);
        if (collectionSet.getName() == null || collectionSet.getName() == "")
            errorCodes.add(ErrorCode.COLLECTIONSET_NAME_EMPTY);

        return ListTransformUtil.toErrorDetails(errorCodes);
    }

    private void checkValidation(CollectionSet collectionSet) {
        checkDuplicate(collectionSet);

        if (collectionSet.getName() == null || collectionSet.getName() == "")
            throw new CustomException(ErrorCode.COLLECTIONSET_NAME_EMPTY);
    }
    
  public boolean isDuplicate(CollectionSet collectionSet) {
    return collectionSetRepository
    .findByUserAndName(collectionSet.getUser(), collectionSet.getName())
        .map(existing -> {
          // 引数の collection に id があり、かつそれが一致しているなら重複ではない
          if (collectionSet.getId() != null && collectionSet.getId().equals(existing.getId())) {
            return false;
          }
          return true; // IDが一致しない場合は別物なので重複扱い
        })
        .orElse(false); // 存在しなければ重複ではない
  }

    private void checkDuplicate(CollectionSet collectionSet) {
        if (isDuplicate(collectionSet))
            throw new CustomException(ErrorCode.DUPLICATE_COLLECTIONSET);
    }

    private CollectionSet applyUpdates(CollectionSet collectionSet,
            CollectionSetInput collectionSetInput) {

        if (collectionSetInput.name() != null)
            collectionSet.setName(collectionSetInput.name());

        return collectionSet;
    }

    public CollectionSet findCollectionSetById(Long id) {
        return collectionSetRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_COLLECTIONSET));
    }

    public CollectionSetOutput getCollectionSet(Long id, User user) {
        CollectionSet collectionSet = findCollectionSetById(id);
        PermissionCheck.checkViewPermission(user, collectionSet);
        return new CollectionSetOutput(collectionSet);
    }

    public List<CollectionSet> findCollectionSetsByUser(User owner) {
        return collectionSetRepository.findAllByUser(owner);
    }

    public List<CollectionSetOutput> getCollectionSetsByUser(User owner, User user) {

        List<CollectionSet> collectionSets = findCollectionSetsByUser(owner);
        System.out.println("collectionSets: " + collectionSets);
        collectionSets =
                PermissionCheck.filterCollectionSetsByViewPermission(user, collectionSets);
        System.out.println("collectionSets2: " + collectionSets);

        return ListTransformUtil.toCollectionSetOutputs(collectionSets);
    }

    public CollectionSetOutput createCollectionSet(CollectionSetInput collectionSetInput,
            User user) {
        CollectionSet collectionSet = new CollectionSet(collectionSetInput, user);

        checkValidation(collectionSet);
        collectionSet = collectionSetRepository.save(collectionSet);
        return new CollectionSetOutput(collectionSet);
    }

    public CollectionSetOutput updateCollectionSet(Long id, CollectionSetInput collectionSetInput,
            User user) {
        CollectionSet collectionSet = findCollectionSetById(id);
        PermissionCheck.checkManagePermission(user, collectionSet);

        collectionSet = applyUpdates(collectionSet, collectionSetInput);
        checkValidation(collectionSet);
        collectionSetRepository.save(collectionSet);

        return new CollectionSetOutput(collectionSet);
    }

    public BatchUpsertResponse<CollectionSetOutput> batchUpsertCollection(User user,
            List<UpdateRequest<CollectionSetInput>> updateRequests,
            List<CreateRequest<CollectionSetInput>> createRequests, User loginUser) {
        List<CollectionSet> upsertCollections = new ArrayList<>();
        List<FailedCreateItem> failedCreates = new ArrayList<>();
        List<FailedItem> failedUpdates = new ArrayList<>();

        PermissionCheck.checkManagePermission(loginUser, user);

        if (createRequests != null) {
            for (CreateRequest<CollectionSetInput> createRequest : createRequests) {
                CollectionSet collectionSet = new CollectionSet(createRequest.input(), user);

                List<ErrorDetail> errorCodes = getValidationErrors(collectionSet);
                if (!errorCodes.isEmpty()) {
                    failedCreates.add(new FailedCreateItem(createRequest.index(), errorCodes));
                    continue;
                }

                upsertCollections.add(collectionSet);
            }
        }

        if (updateRequests != null) {
            for (UpdateRequest<CollectionSetInput> updateRequest : updateRequests) {
                Long id = updateRequest.id();

                Optional<CollectionSet> optCollectionSet = collectionSetRepository.findById(id);
                if (!optCollectionSet.isPresent()) {
                    failedUpdates.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION));
                    continue;
                }
                CollectionSet collectionSet = optCollectionSet.get();

                if (!collectionSet.getUser().equals(user)) {
                    failedUpdates.add(new FailedItem(id, ErrorCode.INVALID_PARENT));
                    continue;
                }
                collectionSet = applyUpdates(collectionSet, updateRequest.input());

                List<ErrorDetail> errorCodes = getValidationErrors(collectionSet);
                if (!errorCodes.isEmpty()) {
                    failedUpdates.add(new FailedItem(id, errorCodes));
                    continue;
                }

                upsertCollections.add(collectionSet);
            }
        }

        upsertCollections = collectionSetRepository.saveAll(upsertCollections);
        List<CollectionSetOutput> collectionSetOutputs =
                ListTransformUtil.toCollectionSetOutputs(upsertCollections);

        return new BatchUpsertResponse<CollectionSetOutput>(collectionSetOutputs, failedCreates,
                failedUpdates);
    }

    public CollectionSetOutput deleteCollectionSet(Long id, User user) {
        CollectionSet collectionSet = findCollectionSetById(id);
        PermissionCheck.checkManagePermission(user, collectionSet);
        collectionSetRepository.delete(collectionSet);

        return new CollectionSetOutput(collectionSet);
    }

    public BatchDeleteResponse<CollectionSetOutput> deleteCollectionSets(List<Long> ids,
            User user) {
        List<CollectionSet> deleteCollectionSets = new ArrayList<>();
        List<FailedItem> failedItems = new ArrayList<>();

        if (ids != null) {
            for (Long id : ids) {
                Optional<CollectionSet> optCollection = collectionSetRepository.findById(id);
                if (!optCollection.isPresent()) {
                    failedItems.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION));
                    continue;
                }

                CollectionSet collection = optCollection.get();

                if (!PermissionCheck.hasManagePermission(user, collection)) {
                    failedItems.add(new FailedItem(id, ErrorCode.NOT_HAVE_MANAGE_PERMISSION));
                    continue;
                }
                deleteCollectionSets.add(collection);
            }
        }

        collectionSetRepository.deleteAll(deleteCollectionSets);
        List<CollectionSetOutput> collectionSetOutputs =
                ListTransformUtil.toCollectionSetOutputs(deleteCollectionSets);
        return new BatchDeleteResponse<CollectionSetOutput>(collectionSetOutputs, failedItems);
    }

    public CollectionSet getOrCreateCollectionSet(String name, User user) {
        return collectionSetRepository.findByUserAndName(user, name)
                .orElseGet(() -> collectionSetRepository.save(new CollectionSet(name, user)));
    }

    public void changeVisibility(CollectionSet collectionSet, boolean isPublic) {
        if (isPublic && !collectionSet.isOpen()) {
            collectionSet.setOpen(true);
        }
        collectionSetRepository.save(collectionSet);
    }

    public void changeVisibility(Collection collection) {
        CollectionSet collectionSet = collection.getCollectionSet();
        if (collection.isOpen() && !collectionSet.isOpen()) {
            collectionSet.setOpen(true);
        }

        collectionSetRepository.save(collectionSet);
    }

    // public List<CollectionSetOutput> createCollectionSets(
    // List<CollectionSetInput> collectionSetInputs, User user) {

    // List<CollectionSetOutput> collectionSetOutputs = new ArrayList<>();

    // for (CollectionSetInput collectionSetInput : collectionSetInputs) {
    // CollectionSet collectionSet = new CollectionSet(collectionSetInput, user);

    // List<ErrorCode> errorCodes = getValidationErrors(collectionSet);
    // if (!errorCodes.isEmpty()) {
    // collectionSetOutputs.add(new CollectionSetOutput(collectionSetInput, errorCodes));
    // continue;
    // }

    // collectionSet = collectionSetRepository.save(collectionSet);
    // collectionSetOutputs.add(new CollectionSetOutput(collectionSet, true));
    // }
    // return collectionSetOutputs;
    // }

    // public List<CollectionSetOutput> updateCollectionSets(
    // List<CollectionSetInputWithId> collectionSetInputWithIds, User user) {
    // List<CollectionSet> updateCollectionSets = new ArrayList<>();
    // List<CollectionSetOutput> collectionSetOutputs = new ArrayList<>();

    // for (CollectionSetInputWithId collectionSetInputWithId : collectionSetInputWithIds) {
    // Long id = collectionSetInputWithId.getId();
    // CollectionSetInput collectionSetInput =
    // collectionSetInputWithId.getCollectionSetInput();

    // Optional<CollectionSet> optCollectionSet = collectionSetRepository.findById(id);
    // if (!optCollectionSet.isPresent()) {
    // collectionSetOutputs
    // .add(new CollectionSetOutput(id, ErrorCode.NOT_FOUND_COLLECTIONSET));
    // continue;
    // }

    // CollectionSet collectionSet = optCollectionSet.get();

    // if (!PermissionCheck.hasManagePermission(user, collectionSet)) {
    // collectionSetOutputs
    // .add(new CollectionSetOutput(id, ErrorCode.NOT_HAVE_MANAGE_PERMISSION));
    // continue;
    // }

    // collectionSet = applyUpdates(collectionSet, collectionSetInput);

    // List<ErrorCode> errorCodes = getValidationErrors(collectionSet);
    // if (!errorCodes.isEmpty()) {
    // collectionSetOutputs.add(new CollectionSetOutput(collectionSetInput, errorCodes));
    // continue;
    // }

    // collectionSetOutputs.add(new CollectionSetOutput(collectionSet, true));
    // updateCollectionSets.add(collectionSet);
    // }

    // collectionSetRepository.saveAll(updateCollectionSets);return collectionSetOutputs;

    // }

    // public List<CollectionSet> filterCollectionSets(User viewer,
    // List<CollectionSet> collectionSets) {
    // return collectionSets.stream().filter(collectionSet -> {
    // return UserService.hasViewPermission(viewer, collectionSet);
    // }).collect(Collectors.toList());
    // }

    // public List<Collection> getCollectionsByUser(User viewer, User owner) {
    // List<CollectionSet> collectionSets = getCollectionSetsByUser(viewer, owner);

    // return collectionSets.stream()
    // .flatMap(collectionSet -> collectionSet.getCollections().stream())
    // .collect(Collectors.toList());
    // }

    // public List<CollectionSetResponse> getCollectionSets() {
    // List<CollectionSet> sets = collectionSetRepository.findAll();

    // return sets.stream().map(set -> {
    // List<Long> sortedCollectionIds =
    // collectionRepository.findByCollectionSetIdOrderByNameAsc(set.getId()).stream()
    // .map(Collection::getId).collect(Collectors.toList());
    // return new CollectionSetResponse(set.getId(), set.getName(), sortedCollectionIds);
    // }).collect(Collectors.toList());
    // }
}
