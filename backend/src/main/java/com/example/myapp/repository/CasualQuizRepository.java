package com.example.myapp.repository;

import com.example.myapp.model.CasualQuiz;
import com.example.myapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CasualQuizRepository extends JpaRepository<CasualQuiz, Long> {

    Optional<CasualQuiz> findById(long id);

    List<CasualQuiz> findByUserOrderByIdAsc(User user);
    
    // 最新のクイズを取得（例: クイズ履歴の一番新しいもの）
    List<CasualQuiz> findTop1ByUserOrderByCreatedAtDesc(User user);
}
