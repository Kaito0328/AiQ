package com.example.myapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStats;

public interface UserStatsRepository extends JpaRepository<UserStats, Long> {
    UserStats findByUser(User user);
}