package com.example.myapp.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseCreatedTimeEntity {
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

