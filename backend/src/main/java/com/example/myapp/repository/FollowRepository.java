package com.example.myapp.repository;
import com.example.myapp.model.Follow;
import com.example.myapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    List<Follow> findByFollowerOrderByCreatedAtDesc(User follower);
    List<Follow> findByFolloweeOrderByCreatedAtDesc(User followee);
    boolean existsByFollowerAndFollowee(User follower, User followee);
    void deleteByFollowerAndFollowee(User follower, User followee);
}
