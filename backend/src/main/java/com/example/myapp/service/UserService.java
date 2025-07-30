package com.example.myapp.service;

import com.example.myapp.repository.UserRepository;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStats;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.example.myapp.JWT.CustomUserDetails;
import com.example.myapp.dto.UserOutput;
import com.example.myapp.exception.CustomException;
import com.example.myapp.exception.ErrorCode;
import org.springframework.context.annotation.Lazy;

@Service
public class UserService implements UserDetailsService {
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean alreadyExists(String username) {
        return userRepository.existsByUsername(username);
    }

    public static User getLoginUser(CustomUserDetails customUserDetails, boolean isRequired) {
        if (customUserDetails != null) {
            return customUserDetails.getUser();
        }

        // ログインが必須ならエラーを投げる
        if (isRequired) {
            throw new CustomException(ErrorCode.LOGIN_REQUIRED);
        }

        // ログインが必須でないなら null を返す
        return null;
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_USER));
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_COLLECTION_SET));
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User registerUser(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new CustomException(ErrorCode.DUPLICATE_USER);
        }

        User user = new User();
        if (password != null) {
            String hashedPassword = passwordEncoder.encode(password);
            user.setPassword(hashedPassword);
        } else {
            user.setPassword(null);
        }

        user.setUsername(username);


        user = userRepository.save(initUser((user)));
        return user;
    }

    public User updateUser(User user, UserOutput newUser) {
        String newName = newUser.username();
        if (newName != null && !newName.isEmpty()) {
            user.setUsername(newName);
        }
        return userRepository.save(user);
    }

    public void changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    public void deleteUser(User user) {
        userRepository.delete(user);
    }


    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_USER));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }
        return user;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // ユーザーをリポジトリから取得
        User user = getByUsername(username);

        // 認証用に UserDetails を返す
        return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getPassword()).roles("USER") // 必要に応じて役割を設定
                .build();
    }

    private User initUser(User user) {
        UserStats userStats = new UserStats();
        userStats.setUser(user);
        userStats.setFollowerCount(0);
        userStats.setFollowingCount(0);

        user.setUserStats(userStats);
        return user;
    }
}
