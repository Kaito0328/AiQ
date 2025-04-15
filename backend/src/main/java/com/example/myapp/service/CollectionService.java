package com.example.myapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.example.myapp.dto.Item.BatchResponse.BatchDeleteResponse;
import com.example.myapp.dto.Item.BatchResponse.BatchUpsertResponse;
import com.example.myapp.dto.Item.BatchResponse.FailedCreateItem;
import com.example.myapp.dto.Item.BatchResponse.FailedItem;
import com.example.myapp.dto.Item.Collection.CollectionInput;
import com.example.myapp.dto.Item.Collection.CollectionOutput;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import com.example.myapp.exception.ErrorDetail;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.CollectionStats;
import com.example.myapp.model.User;
import com.example.myapp.repository.CollectionRepository;
import com.example.myapp.repository.CollectionStatsRepository;
import com.example.myapp.util.ListTransformUtil;
import com.example.myapp.util.PermissionCheck;
import com.example.myapp.dto.Item.Request.CreateRequest;
import com.example.myapp.dto.Item.Request.UpdateRequest;


@Service
public class CollectionService {

  private final CollectionRepository collectionRepository;
  private final CollectionSetService collectionSetService;
  private final CollectionStatsRepository collectionStatsRepository;

  @Autowired
  public CollectionService(CollectionRepository collectionRepository, CollectionSetService collectionSetService, CollectionStatsRepository collectionStatsRepository) {
    this.collectionSetService = collectionSetService;
    this.collectionRepository = collectionRepository;
    this.collectionStatsRepository = collectionStatsRepository; 
  }

  private Collection applyUpdates(Collection collection, CollectionInput collectionInput) {
    if (collectionInput.name() != null)
      collection.setName(collectionInput.name());
    if (collectionInput.open() != null)
      collection.setOpen(collectionInput.open());
    return collection;
  }

  public Optional<Collection> findByCollectionSetAndName(CollectionSet collectionSet,
      String collectionName) {
    return collectionRepository.findByCollectionSetAndName(collectionSet, collectionName);
  }

  public CollectionStats getCollectionStats(Collection collection) {
    return collectionStatsRepository.findByCollection(collection)
        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_COLLECTION));
  }

  public List<ErrorDetail> getValidationErrors(Collection collection) {
    List<ErrorCode> errorCodes = new ArrayList<>();
    if (isDuplicate(collection))
      errorCodes.add(ErrorCode.DUPLICATE_COLLECTION);

    if (collection.getName() == "" || collection.getName() == null)
      errorCodes.add(ErrorCode.COLLECTION_NAME_EMPTY);

    return ListTransformUtil.toErrorDetails(errorCodes);
  }

  public void checkValidation(Collection collection) {
    duplicateCheck(collection);

    if (collection.getName() == "" || collection.getName() == null)
      throw new CustomException(ErrorCode.COLLECTION_NAME_EMPTY);
  }

  public boolean isDuplicate(Collection collection) {
    return collectionRepository
        .findByCollectionSetAndName(collection.getCollectionSet(), collection.getName())
        .map(existing -> {
          // 引数の collection に id があり、かつそれが一致しているなら重複ではない
          if (collection.getId() != null && collection.getId().equals(existing.getId())) {
            return false;
          }
          return true; // IDが一致しない場合は別物なので重複扱い
        })
        .orElse(false); // 存在しなければ重複ではない
  }

  public void duplicateCheck(Collection collection) {
    if (isDuplicate(collection))
      throw new CustomException(ErrorCode.DUPLICATE_COLLECTION);
  }

  public Collection findById(Long collectionId) {
    return collectionRepository.findById(collectionId)
        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_COLLECTION));
  }

  public List<Collection> findByIds(List<Long> ids) {
    return collectionRepository.findAllByIdIn(ids);
  }

  public CollectionOutput getCollection(Long id, User user) {
    Collection collection = findById(id);
    PermissionCheck.checkViewPermission(user, collection);

    return new CollectionOutput(collection);
  }

  public List<CollectionOutput> getCollectionsByCollectionSetId(CollectionSet collectionSet,
      User user) {
    PermissionCheck.checkViewPermission(user, collectionSet);
    List<Collection> collections =
        collectionRepository.findAllByCollectionSetIdOrderByNameAsc(collectionSet.getId());

    return ListTransformUtil.toCollectionOutputs(collections);
  }

  public List<CollectionOutput> getCollectionsByCollectionSetIds(List<CollectionSet> collectionSets,
      User user) {
    collectionSets = PermissionCheck.filterCollectionSetsByViewPermission(user, collectionSets);
    List<Long> collectionSetIds =
        collectionSets.stream().map(CollectionSet::getId).collect(Collectors.toList());

    List<Collection> collections =
        collectionRepository.findAllByCollectionSetIdInOrderByNameAsc(collectionSetIds);

    return ListTransformUtil.toCollectionOutputs(collections);
  }

  public CollectionOutput createCollection(CollectionInput collectionInput,
      CollectionSet collectionSet, User user) {
    PermissionCheck.checkManagePermission(user, collectionSet);
    Collection collection = new Collection(collectionInput, collectionSet);
    checkValidation(collection);

    collection = collectionRepository.save(collection);

    CollectionStats collectionStats = new CollectionStats();
    collectionStats.setCollection(collection);
    collectionStats.setFavoriteCount(0);
    collectionStatsRepository.save(collectionStats);

    collectionSetService.changeVisibility(collection);
    return new CollectionOutput(collection);
  }

  public CollectionOutput updateCollection(Long id, CollectionInput collectionInput, User user) {
    Collection collection = findById(id);
    PermissionCheck.checkManagePermission(user, collection);

    collection = applyUpdates(collection, collectionInput);
    checkValidation(collection);

    collectionRepository.save(collection);
    collectionSetService.changeVisibility(collection);
    return new CollectionOutput(collection);
  }

  public BatchUpsertResponse<CollectionOutput> batchUpsertCollection(CollectionSet collectionSet,
      List<UpdateRequest<CollectionInput>> updateRequests,
      List<CreateRequest<CollectionInput>> createRequests, User user) {
    List<Collection> createCollections = new ArrayList<>();
    List<Collection> updateCollections = new ArrayList<>();
    List<FailedCreateItem> failedCreates = new ArrayList<>();
    List<FailedItem> failedUpdates = new ArrayList<>();

    PermissionCheck.checkManagePermission(user, collectionSet);

    if (createRequests != null) {
      for (CreateRequest<CollectionInput> createRequest : createRequests) {
        Collection collection = new Collection(createRequest.input(), collectionSet);

        List<ErrorDetail> errorCodes = getValidationErrors(collection);
        if (!errorCodes.isEmpty()) {
          failedCreates.add(new FailedCreateItem(createRequest.index(), errorCodes));
          continue;
        }

        createCollections.add(collection);
        collectionSetService.changeVisibility(collection);
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

        updateCollections.add(collection);
        collectionSetService.changeVisibility(collection);
      }
    }

    createCollections = collectionRepository.saveAll(createCollections);
    updateCollections = collectionRepository.saveAll(updateCollections);

    List<CollectionStats> statsToSave = createCollections.stream()
    .map(c -> {
        CollectionStats stats = new CollectionStats();
        stats.setCollection(c);
        return stats;
    })
    .toList();
    collectionStatsRepository.saveAll(statsToSave);

    List<Collection> upsertCollections = new ArrayList<>();
    upsertCollections.addAll(createCollections);
    upsertCollections.addAll(updateCollections);
    List<CollectionOutput> collectionOutputs =
        ListTransformUtil.toCollectionOutputs(upsertCollections);

    return new BatchUpsertResponse<CollectionOutput>(collectionOutputs, failedCreates,
        failedUpdates);
  }

  public CollectionOutput deleteCollection(Long id, User user) {
    Collection collection = findById(id);
    PermissionCheck.checkManagePermission(user, collection);

    CollectionStats collectionStats = getCollectionStats(collection);
    collectionStatsRepository.delete(collectionStats);
    collectionRepository.delete(collection);

    return new CollectionOutput(collection);
  }

  public BatchDeleteResponse<CollectionOutput> deleteCollections(List<Long> ids, User user) {
    List<Collection> deleteCollections = new ArrayList<>();
    List<CollectionStats> deleteCollectionStats = new ArrayList<>();
    List<FailedItem> failedItems = new ArrayList<>();
    if (ids != null) {
      for (Long id : ids) {
        Optional<Collection> optCollection = collectionRepository.findById(id);
        if (!optCollection.isPresent()) {
          failedItems.add(new FailedItem(id, ErrorCode.NOT_FOUND_COLLECTION));
          continue;
        }

        Collection collection = optCollection.get();

        if (!PermissionCheck.hasManagePermission(user, collection)) {
          failedItems.add(new FailedItem(id, ErrorCode.NOT_HAVE_MANAGE_PERMISSION));
          continue;
        }
        CollectionStats collectionStats = getCollectionStats(collection);
        deleteCollectionStats.add(collectionStats);
        deleteCollections.add(collection);
      }
    }

    collectionStatsRepository.deleteAll(deleteCollectionStats);
    collectionRepository.deleteAll(deleteCollections);
    List<CollectionOutput> collectionOutputs =
        ListTransformUtil.toCollectionOutputs(deleteCollections);

    return new BatchDeleteResponse<CollectionOutput>(collectionOutputs, failedItems);
  }

  public Collection save(Collection collection) {
    return collectionRepository.save(collection);
  }

  // public List<CollectionOutput> createCollections(List<CollectionInput> collectionInputs,
  // CollectionSet collectionSet, User user) {
  // PermissionCheck.checkManagePermission(user, collectionSet);

  // List<CollectionOutput> collectionOutputs = new ArrayList<>();

  // for (CollectionInput collectionInput : collectionInputs) {
  // Collection collection = new Collection(collectionInput, collectionSet);

  // List<ErrorCode> errorCodes = getValidationErrors(collection);
  // if (!errorCodes.isEmpty()) {
  // collectionOutputs.add(new CollectionOutput(collectionInput, errorCodes));
  // continue;
  // }

  // collection = collectionRepository.save(collection);
  // collectionOutputs.add(new CollectionOutput(collection, true));
  // CollectionSetService.changeVisibility(collection);
  // }

  // return collectionOutputs;
  // }

  // public List<CollectionOutput> updateCollections(
  // List<CollectionInputWithId> collectionInputWithIds, User user) {
  // List<Collection> updateCollections = new ArrayList<>();
  // List<CollectionOutput> collectionOutputs = new ArrayList<>();

  // for (CollectionInputWithId collectionInputWithId : collectionInputWithIds) {
  // Long id = collectionInputWithId.getId();
  // CollectionInput collectionInput = collectionInputWithId.getCollectionInput();

  // Optional<Collection> optCollection = collectionRepository.findById(id);
  // if (!optCollection.isPresent()) {
  // collectionOutputs.add(new CollectionOutput(id, ErrorCode.NOT_FOUND_COLLECTION));
  // continue;
  // }
  // Collection collection = optCollection.get();

  // if (!PermissionCheck.hasManagePermission(user, collection)) {
  // collectionOutputs.add(new CollectionOutput(id, ErrorCode.NOT_HAVE_MANAGE_PERMISSION));
  // continue;
  // }

  // collection = applyUpdates(collection, collectionInput);

  // List<ErrorCode> errorCodes = getValidationErrors(collection);
  // if (!errorCodes.isEmpty()) {
  // collectionOutputs.add(new CollectionOutput(id, errorCodes));
  // continue;
  // }

  // collectionOutputs.add(new CollectionOutput(collection, true));
  // updateCollections.add(collection);

  // CollectionSetService.changeVisibility(collection);
  // }

  // collectionRepository.saveAll(updateCollections);
  // return collectionOutputs;
  // }

  // public List<Collection> filterAccessibleCollections(List<Collection> collections, User viewer)
  // {
  // return collections.stream()
  // .filter(collection -> UserService.hasViewPermission(viewer, collection))
  // .collect(Collectors.toList());
  // }

  // public boolean accessable(Collection collection, boolean isOwner) {
  // return collection.isPublic() || isOwner;
  // }

  // // コレクションを全て取得
  // public List<CollectionResponse> getCollections() {
  // List<Collection> collections = collectionRepository.findAll();

  // return collections.stream()
  // .map(collection -> new CollectionResponse(collection.getId(), collection.getName(),
  // collection.getCollectionSet().getId())) // CollectionSet を経由して User にアクセス
  // .collect(Collectors.toList());
  // }


  // public Collection createCollection(String collectionName, User user, String collectionSetName)
  // {
  // CollectionSet collectionSet =
  // collectionSetService.getOrCreateCollectionSet(user, collectionSetName);

  // Optional<Collection> existingCollection =
  // collectionRepository.findByCollectionSetAndName(collectionSet, collectionName);
  // if (existingCollection.isPresent()) {
  // return existingCollection.get();
  // }

  // Collection collection = new Collection(collectionName, collectionSet);
  // return collectionRepository.save(collection);
  // }


  // public List<Collection> findByUserAndSetName(User user, String collectionSetName) {
  // CollectionSet collectionSet =
  // collectionSetService.getOrCreateCollectionSet(user, collectionSetName);
  // return collectionRepository.findAllByCollectionSet(collectionSet);
  // }
}
