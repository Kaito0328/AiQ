package com.example.myapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.example.myapp.dto.Item.BatchResponse.BatchDeleteResponse;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.BatchResponse.FailedCreateItem;
import com.example.myapp.dto.Item.BatchResponse.FailedItem;
import com.example.myapp.dto.Item.Collection.CollectionInput;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import com.example.myapp.exception.ErrorDetail;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.CollectionStats;
import com.example.myapp.model.User;
import com.example.myapp.repository.CollectionRepository;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.util.PermissionCheck;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.dto.Item.Request.UpdateRequest;


@Service
public class CollectionService {

  private final CollectionRepository collectionRepository;

  @Autowired
  public CollectionService(CollectionRepository collectionRepository,
      CollectionSetService collectionSetService) {
    this.collectionRepository = collectionRepository;
  }


  public boolean alreadyExists(CollectionSet collectionSet, String collectionName) {
    return collectionRepository.existsByCollectionSetAndName(collectionSet, collectionName);
  }

  public Collection getViewCollection(Long id, User user) {
    Collection collection = getCollectionById(id);
    PermissionCheck.checkViewPermission(user, collection);
    return collection;
  }

  public Collection getManageCollection(Long id, User user) {
    Collection collection = getCollectionById(id);
    PermissionCheck.checkManagePermission(user, collection);
    return collection;
  }

  public List<Collection> getViewCollections(List<Long> ids, User user) {
    List<Collection> collections = collectionRepository.findAllByIdIn(ids);
    collections = PermissionCheck.filterCollectionsByViewPermission(user, collections);
    return collections;
  }

  public List<Collection> getCollectionsByCollectionSet(CollectionSet collectionSet, User user) {
    List<Collection> collections =
        collectionRepository.findAllByCollectionSetIdOrderByNameAsc(collectionSet.getId());

    return collections;
  }

  public List<Collection> getCollectionsByCollectionSets(List<CollectionSet> collectionSets,
      User user) {
    List<Long> collectionSetIds = collectionSets.stream().map(CollectionSet::getId).toList();

    List<Collection> collections =
        collectionRepository.findAllByCollectionSetIdInOrderByNameAsc(collectionSetIds);

    return collections;
  }

  // 引き数のCollectionSetの権限は確認済みを保証する
  public Collection createCollection(CollectionInput collectionInput, CollectionSet collectionSet,
      User user) {
    Collection collection = new Collection(collectionInput, collectionSet);
    checkValidation(collection);

    collection = collectionRepository.save(initCollection(collection));
    return collection;
  }

  public Collection updateCollection(Long id, CollectionInput collectionInput, User user) {
    Collection collection = getManageCollection(id, user);

    collection = applyUpdates(collection, collectionInput);
    checkValidation(collection);

    collectionRepository.save(collection);
    return collection;
  }

  // 引き数のCollectionSetは権限を確認済みを保証
  public BatchUpsertResponse<Collection> batchUpsertCollection(CollectionSet collectionSet,
      List<UpdateRequest<CollectionInput>> updateRequests,
      List<CreateRequest<CollectionInput>> createRequests, User user) {
    List<FailedCreateItem> failedCreates = new ArrayList<>();
    List<FailedItem> failedUpdates = new ArrayList<>();
    List<Collection> upsertCollections = new ArrayList<>();

    if (createRequests != null) {
      for (CreateRequest<CollectionInput> createRequest : createRequests) {
        Collection collection = new Collection(createRequest.input(), collectionSet);
        List<ErrorDetail> errorCodes = getValidationErrors(collection);
        if (!errorCodes.isEmpty()) {
          failedCreates.add(new FailedCreateItem(createRequest.index(), errorCodes));
          continue;
        }

        upsertCollections.add(initCollection(collection));
      }
    }

    if (updateRequests != null) {
      for (UpdateRequest<CollectionInput> updateRequest : updateRequests) {
        Long id = updateRequest.id();

        Optional<Collection> optCollection = collectionRepository.findById(id);
        if (!optCollection.isPresent()) {
          failedUpdates.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION));
          continue;
        }

        Collection collection = optCollection.get();
        if (!collection.getCollectionSet().equals(collectionSet)) {
          failedUpdates.add(new FailedItem(id, ErrorCode.INVALID_PARENT));
          continue;
        }

        collection = applyUpdates(collection, updateRequest.input());
        List<ErrorDetail> errorCodes = getValidationErrors(collection);
        if (!errorCodes.isEmpty()) {
          failedUpdates.add(new FailedItem(id, errorCodes));
          continue;
        }

        upsertCollections.add(collection);
      }
    }
    upsertCollections = collectionRepository.saveAll(upsertCollections);

    return new BatchUpsertResponse<Collection>(upsertCollections, failedCreates, failedUpdates);
  }

  public Collection deleteCollection(Long id, User user) {
    Collection collection = getManageCollection(id, user);

    collectionRepository.delete(collection);
    return collection;
  }

  public BatchDeleteResponse<Collection> deleteCollections(CollectionSet collectionSet,
      List<Long> ids, User user) {
    List<Collection> deleteCollections = new ArrayList<>();
    List<FailedItem> failedItems = new ArrayList<>();

    if (ids != null) {
      for (Long id : ids) {
        Optional<Collection> optCollection = collectionRepository.findById(id);
        if (!optCollection.isPresent()) {
          failedItems.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION));
          continue;
        }

        Collection collection = optCollection.get();

        if (!collection.getCollectionSet().equals(collectionSet)) {
          failedItems.add(new FailedItem(id, ErrorCode.INVALID_PARENT));
          continue;
        }
        deleteCollections.add(collection);
      }
    }
    collectionRepository.deleteAll(deleteCollections);

    return new BatchDeleteResponse<Collection>(deleteCollections, failedItems);
  }

  // これより下はprivate関数

  private Optional<Collection> findCollectionById(Long collectionId) {
    return collectionRepository.findById(collectionId);
  }

  private Collection getCollectionById(Long collectionId) {
    return findCollectionById(collectionId)
        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_COLLECTION));
  }

  private Collection initCollection(Collection collection) {
    CollectionStats collectionStats = new CollectionStats();
    collectionStats.setCollection(collection);
    collectionStats.setFavoriteCount(0);

    collection.setCollectionStats(collectionStats);
    return collection;
  }

  private Collection applyUpdates(Collection collection, CollectionInput collectionInput) {
    if (collectionInput.name() != null)
      collection.setName(collectionInput.name());
    if (collectionInput.open() != null)
      collection.setOpen(collectionInput.open());
    if (collectionInput.descriptionText() != null)
      collection.setDescriptionText(collectionInput.descriptionText());
    return collection;
  }

  private boolean isDuplicate(Collection collection) {
    return collectionRepository
        .findByCollectionSetAndName(collection.getCollectionSet(), collection.getName())
        .map(existing -> {
          // 引数の collection に id があり、かつそれが一致しているなら重複ではない
          if (collection.getId() != null && collection.getId().equals(existing.getId())) {
            return false;
          }
          return true; // IDが一致しない場合は別物なので重複扱い
        }).orElse(false); // 存在しなければ重複ではない
  }

  private void duplicateCheck(Collection collection) {
    if (isDuplicate(collection))
      throw new CustomException(ErrorCode.DUPLICATE_COLLECTION);
  }

  private List<ErrorDetail> getValidationErrors(Collection collection) {
    List<ErrorCode> errorCodes = new ArrayList<>();
    if (isDuplicate(collection))
      errorCodes.add(ErrorCode.DUPLICATE_COLLECTION);

    if (collection.getName() == "" || collection.getName() == null)
      errorCodes.add(ErrorCode.COLLECTION_NAME_EMPTY);

    return ListTransformUtil.toErrorDetails(errorCodes);
  }

  private void checkValidation(Collection collection) {
    duplicateCheck(collection);

    if (collection.getName() == "" || collection.getName() == null)
      throw new CustomException(ErrorCode.COLLECTION_NAME_EMPTY);
  }
}
