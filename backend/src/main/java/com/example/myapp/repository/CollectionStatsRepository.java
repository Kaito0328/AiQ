package com.example.myapp.repository;

import com.example.myapp.model.Collection;
import com.example.myapp.model.CollectionStats;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CollectionStatsRepository extends JpaRepository<CollectionStats, Long> {

    // User に紐づく CollectionStats を取得
    Optional<CollectionStats> findByCollection(Collection collection);
}
