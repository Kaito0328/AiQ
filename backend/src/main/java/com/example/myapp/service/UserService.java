package com.example.myapp.service;

import com.example.myapp.repository.UserRepository;
import com.example.myapp.repository.UserStatsRepository;
import com.example.myapp.model.User;
import com.example.myapp.model.UserStats;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
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
    private final UserStatsRepository userStatsRepository;

    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, UserStatsRepository userStatsRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userStatsRepository = userStatsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static Long OFFICIAL_USER_ID = 1L;
    public static final String OFFICIAL_USER_NAME = "official_user";
    private static User official_user;

    public static Long getOfficialUserId() {
        return OFFICIAL_USER_ID;
    }

    public static User getOfficialUser() {
        return official_user;
    }

    public void saveOfficialUser() {
        Optional<User> optionalOfficialUser = userRepository.findByUsername(OFFICIAL_USER_NAME);

        if (optionalOfficialUser.isEmpty()) {
            User officialUser = new User();
            officialUser.setUsername(OFFICIAL_USER_NAME);
            officialUser.setPassword(null); // パスワードはnull
            officialUser = userRepository.save(officialUser); // ID は自動生成される

            // official_user を代入
            official_user = officialUser;
        } else {
            // 既存の公式ユーザーをセット
            official_user = optionalOfficialUser.get();
        }

        // OFFICIAL_USER_ID を更新
        OFFICIAL_USER_ID = official_user.getId();
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

    public UserStats getUserStats(User user) {
        return userStatsRepository.findByUser(user);
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

        UserStats userStats = userStatsRepository.findByUser(user);
        if (userStats != null) {
            userStatsRepository.delete(userStats);
        }
    }

    public User registerUser(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new CustomException(ErrorCode.DUPLICATE_USER);
        }
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User();
        user.setUsername(username);
        user.setPassword(hashedPassword);

        UserStats userStats = new UserStats();
        userStats.setUser(user);
        userStats.setFollowerCount(0);
        userStats.setFollowingCount(0);

        userStatsRepository.save(userStats);
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_USER));
    }


    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_USER));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }
        return user;
    }

    public User findByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new UsernameNotFoundException("User not found with username: " + username));
        return user; // UserクラスがUserDetailsを実装しているのでそのまま返す
    }

    public User findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_USER));
        return user;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // ユーザーをリポジトリから取得
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // 認証用に UserDetails を返す
        return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getPassword()).roles("USER") // 必要に応じて役割を設定
                .build();
    }
}
