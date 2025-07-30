package com.example.myapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionSet;
import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {
    List<Collection> findAllByCollectionSetIdOrderByNameAsc(Long collectionSetId);

    List<Collection> findAllByIdIn(List<Long> id);

    Optional<Collection> findByCollectionSetAndName(CollectionSet collectionSet, String name);
    boolean existsByCollectionSetAndName(CollectionSet collectionSet, String name);

    // collectionSetIdがリスト内の値に一致するCollectionを取得
    List<Collection> findAllByCollectionSetIdInOrderByNameAsc(List<Long> collectionSetIds);
}

