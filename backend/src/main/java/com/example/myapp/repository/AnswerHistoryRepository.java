package com.example.myapp.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.example.myapp.model.AnswerHistory;
import com.example.myapp.model.User;

@Repository
public interface AnswerHistoryRepository extends JpaRepository<AnswerHistory, Long> {
    List<AnswerHistory> findByUser(User user);
}
