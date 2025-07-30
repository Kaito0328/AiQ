package com.example.myapp.JWT;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.ArrayList;
import com.example.myapp.service.UserService;
import com.example.myapp.model.User;
import org.springframework.lang.NonNull;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");

        Long id = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);

            try {
                id = jwtUtil.extractUserId(jwt);
                System.out.println("Extracted user ID: " + id);
            } catch (Exception e) {
                // JWT例外をログに出力し、認証を継続しない
                System.out.println("JWT parsing failed: " + e.getMessage());
                // 無効なトークンの場合は、認証せずにフィルターチェーンを続行
                filterChain.doFilter(request, response);
                return;
            }
        }

        if (id != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                User user = userService.getUserById(id);
                System.out.println("User found: " + user.getUsername());
                CustomUserDetails custom_user = new CustomUserDetails(user);
                if (jwtUtil.validateToken(jwt, custom_user)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(custom_user, null,
                                    new ArrayList<>());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                System.out.println("User authentication failed: " + e.getMessage());
                // ユーザー認証に失敗した場合も、フィルターチェーンを続行
            }
        }

        filterChain.doFilter(request, response);
    }
}
