package com.example.myapp.model;

import jakarta.persistence.*;
import com.example.myapp.auth.OfficialUserManager;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;
    private String email;
    private String password;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_stats_id", nullable = false)
    private UserStats userStats;

    public User() {}

    public User(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    public boolean isOfficial() {
        return this.id.equals(OfficialUserManager.getOfficialUserId());
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;

        User that = (User) obj;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id == null ? 0 : id.hashCode();
    }
}
