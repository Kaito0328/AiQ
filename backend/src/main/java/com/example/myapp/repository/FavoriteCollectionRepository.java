package com.example.myapp.repository;

import com.example.myapp.model.FavoriteCollection;
import com.example.myapp.model.User;
import com.example.myapp.model.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteCollectionRepository extends JpaRepository<FavoriteCollection, Long> {
    List<FavoriteCollection> findByUserOrderByCreatedAtDesc(User user);
    boolean existsByUserAndCollection(User user, Collection collection);
    void deleteByUserAndCollection(User user, Collection collection);
}
