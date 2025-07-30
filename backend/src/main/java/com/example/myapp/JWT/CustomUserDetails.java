package com.example.myapp.JWT;

import org.springframework.security.core.userdetails.UserDetails;
import com.example.myapp.model.User;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

public class CustomUserDetails implements UserDetails {

    private User user; // アプリケーションのUserクラス

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null; // 必要に応じて権限を返す
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    public Long getId() {
        return user.getId();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // アカウントの有効性をチェック
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // アカウントのロック状態をチェック
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 資格情報（パスワード）の有効性をチェック
    }

    @Override
    public boolean isEnabled() {
        return true; // ユーザーが有効かどうかをチェック
    }

    // 必要に応じてUserクラスのプロパティへのアクセスメソッドを追加
    public User getUser() {
        return user;
    }
}
