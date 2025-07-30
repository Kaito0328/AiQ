package com.example.myapp.service;

import com.example.myapp.dto.Item.BatchResponse.BatchDeleteResponse;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.BatchResponse.FailedCreateItem;
import com.example.myapp.dto.Item.BatchResponse.FailedItem;
import com.example.myapp.dto.Item.CollectionSet.CollectionSetInput;
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

    public Optional<CollectionSet> findByUserAndName(User user, String collectionSetName) {
        return collectionSetRepository.findByUserAndName(user, collectionSetName);
    }

    public CollectionSet getViewCollectionSet(Long id, User user) {
        CollectionSet collectionSet = getCollectionSetById(id);
        PermissionCheck.checkViewPermission(user, collectionSet);
        return collectionSet;
    }

    public CollectionSet getManageCollectionSet(Long id, User user) {
        CollectionSet collectionSet = getCollectionSetById(id);
        PermissionCheck.checkManagePermission(user, collectionSet);
        return collectionSet;
    }

    public List<CollectionSet> getViewCollectionSetsByUser(User owner, User user) {

        List<CollectionSet> collectionSets = collectionSetRepository.findAllByUser(owner);
        collectionSets = PermissionCheck.filterCollectionSetsByViewPermission(user, collectionSets);

        return collectionSets;
    }

    // 引き数のUserは権限確認済みを保証
    public CollectionSet createCollectionSet(CollectionSetInput collectionSetInput, User user) {
        CollectionSet collectionSet = new CollectionSet(collectionSetInput, user);

        checkValidation(collectionSet);
        collectionSet = collectionSetRepository.save(collectionSet);
        return collectionSet;
    }

    public CollectionSet updateCollectionSet(Long id, CollectionSetInput collectionSetInput,
            User user) {
        CollectionSet collectionSet = getManageCollectionSet(id, user);

        collectionSet = applyUpdates(collectionSet, collectionSetInput);
        checkValidation(collectionSet);
        collectionSet = collectionSetRepository.save(collectionSet);

        return collectionSet;
    }

    // 引き数のUserは権限確認済み
    public BatchUpsertResponse<CollectionSet> batchUpsertCollection(User user,
            List<UpdateRequest<CollectionSetInput>> updateRequests,
            List<CreateRequest<CollectionSetInput>> createRequests, User loginUser) {
        List<CollectionSet> upsertCollections = new ArrayList<>();
        List<FailedCreateItem> failedCreates = new ArrayList<>();
        List<FailedItem> failedUpdates = new ArrayList<>();

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
                    failedUpdates.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION_SET));
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

        return new BatchUpsertResponse<CollectionSet>(upsertCollections, failedCreates,
                failedUpdates);
    }

    public CollectionSet deleteCollectionSet(Long id, User user) {
        CollectionSet collectionSet = getManageCollectionSet(id, user);

        collectionSetRepository.delete(collectionSet);

        return collectionSet;
    }

    public BatchDeleteResponse<CollectionSet> deleteCollectionSets(List<Long> ids, User user) {
        List<CollectionSet> deleteCollectionSets = new ArrayList<>();
        List<FailedItem> failedItems = new ArrayList<>();

        if (ids != null) {
            for (Long id : ids) {
                Optional<CollectionSet> optCollection = collectionSetRepository.findById(id);
                if (!optCollection.isPresent()) {
                    failedItems.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION_SET));
                    continue;
                }

                CollectionSet collectionSet = optCollection.get();
                if (!collectionSet.getUser().equals(user)) {
                    failedItems.add(new FailedItem(id, ErrorCode.INVALID_PARENT));
                    continue;
                }

                deleteCollectionSets.add(collectionSet);
            }
        }

        collectionSetRepository.deleteAll(deleteCollectionSets);

        return new BatchDeleteResponse<CollectionSet>(deleteCollectionSets, failedItems);
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

    // collectionsはすべてcollectionSet配下にあることが保証されているとする。
    public void changeVisibility(CollectionSet collectionSet, List<Collection> collections) {
        if (collectionSet.isOpen())
            return;

        boolean hasOpenCollection = collections.stream().anyMatch(Collection::isOpen);
        if (hasOpenCollection) {
            collectionSet.setOpen(true);
            collectionSetRepository.save(collectionSet);
        }

        collectionSetRepository.save(collectionSet);
    }


    // 以下private関数


    private Optional<CollectionSet> findCollectionSetById(Long id) {
        return collectionSetRepository.findById(id);
    }

    private CollectionSet getCollectionSetById(Long id) {
        return findCollectionSetById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_COLLECTION_SET));
    }

    private CollectionSet applyUpdates(CollectionSet collectionSet,
            CollectionSetInput collectionSetInput) {

        if (collectionSetInput.name() != null)
            collectionSet.setName(collectionSetInput.name());
        if (collectionSetInput.descriptionText() != null)
            collectionSet.setDescriptionText(collectionSetInput.descriptionText());

        return collectionSet;
    }

    private boolean isDuplicate(CollectionSet collectionSet) {
        return collectionSetRepository
                .findByUserAndName(collectionSet.getUser(), collectionSet.getName())
                .map(existing -> {
                    // 引数の collection に id があり、かつそれが一致しているなら重複ではない
                    if (collectionSet.getId() != null
                            && collectionSet.getId().equals(existing.getId())) {
                        return false;
                    }
                    return true; // IDが一致しない場合は別物なので重複扱い
                }).orElse(false); // 存在しなければ重複ではない
    }

    private void checkDuplicate(CollectionSet collectionSet) {
        if (isDuplicate(collectionSet))
            throw new CustomException(ErrorCode.DUPLICATE_COLLECTION_SET);
    }

    private List<ErrorDetail> getValidationErrors(CollectionSet collectionSet) {
        List<ErrorCode> errorCodes = new ArrayList<>();
        if (isDuplicate(collectionSet))
            errorCodes.add(ErrorCode.DUPLICATE_COLLECTION_SET);
        if (collectionSet.getName() == null || collectionSet.getName() == "")
            errorCodes.add(ErrorCode.COLLECTION_SET_NAME_EMPTY);

        return ListTransformUtil.toErrorDetails(errorCodes);
    }

    private void checkValidation(CollectionSet collectionSet) {
        checkDuplicate(collectionSet);

        if (collectionSet.getName() == null || collectionSet.getName() == "")
            throw new CustomException(ErrorCode.COLLECTION_SET_NAME_EMPTY);
    }
}
