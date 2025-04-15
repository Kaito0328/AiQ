package com.example.myapp.JWT;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;
import com.example.myapp.model.User;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // プロパティファイルや環境変数から秘密鍵を取得
    @Value("${jwt.secret.key}")
    private String SECRET_KEY;

    // private final int validity_period = 1000 * 60 * 60; // 1時間

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // JWTトークンを生成するメソッド
    public String generateToken(User user) {
        return Jwts.builder().setSubject(String.valueOf(user.getId())).setIssuedAt(new Date())
                // .setExpiration(new Date(System.currentTimeMillis() + validity_period))
                .signWith(getSigningKey()).compact();
    }

    public Long extractUserId(String token) {
        return Long.parseLong(extractClaim(token, Claims::getSubject));
    }

    // 任意のクレームを抽出する汎用メソッド
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder() // 推奨される方法
                .setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
        return claimsResolver.apply(claims);
    }

    // トークンが有効かどうかを検証するメソッド
    public boolean validateToken(String token, CustomUserDetails user) {
        final Long userId = extractUserId(token);
        return userId.equals(user.getId());
    }

    // // トークンが期限切れかどうかをチェックするメソッド
    // private boolean isTokenExpired(String token) {
    // return extractClaim(token, Claims::getExpiration).before(new Date());
    // }
}
