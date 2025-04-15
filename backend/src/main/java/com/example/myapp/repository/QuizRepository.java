package com.example.myapp.repository;

import com.example.myapp.model.Quiz;
import com.example.myapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findById(long id);

    // 特定のユーザーが持つクイズをすべて取得（例: 終了済みクイズなどの条件追加も可能）
    List<Quiz> findByUser(User user);

    // 最新のクイズを取得（例: クイズ履歴の一番新しいもの）
    List<Quiz> findTop1ByUserOrderByCreatedAtDesc(User user);
}
