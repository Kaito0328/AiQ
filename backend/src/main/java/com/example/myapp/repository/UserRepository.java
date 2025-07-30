package com.example.myapp.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.myapp.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    @Query("""
        SELECT us.user FROM UserStats us
        ORDER BY us.followerCount DESC
        """)
    List<User> findUsersOrderByFollowerCountDesc(Pageable pageable);
}
