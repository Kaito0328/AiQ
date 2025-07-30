package com.example.myapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.myapp.model.Question;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

        List<Question> findAllByIdIn(List<Long> id);

        @Query("SELECT q FROM Question q WHERE q.collection.id = :collectionId")
        List<Question> findByCollectionId(@Param("collectionId") Long id);

        @Query("SELECT q FROM Question q WHERE q.collection.id IN :collectionIds ORDER BY q.id ASC")
        List<Question> findByCollectionIdInOrderByIdAscWithLimit(
                        @Param("collectionIds") List<Long> collectionIds, Pageable pageable);

        @Query("SELECT q FROM Question q WHERE q.collection.id IN :collectionIds ORDER BY q.id DESC")
        List<Question> findByCollectionIdInOrderByIdDescWithLimit(
                        @Param("collectionIds") List<Long> collectionIds, Pageable pageable);

        @Query("SELECT q FROM Question q WHERE q.collection.id IN :collectionIds ORDER BY RANDOM()")
        List<Question> findByCollectionIdInOrderByRandomWithLimit(
                        @Param("collectionIds") List<Long> collectionIds, Pageable pageable);
}
