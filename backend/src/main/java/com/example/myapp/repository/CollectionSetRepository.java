package com.example.myapp.repository;

import com.example.myapp.model.CollectionSet;
import com.example.myapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CollectionSetRepository extends JpaRepository<CollectionSet, Long> {
    Optional<CollectionSet> findByUserAndName(User user, String name);

    boolean existsByUserAndName(User user, String name);

    List<CollectionSet> findAllByUser(User user);
}
