package com.sunny.taskmanager;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
@Service 
public class JwtService {

    private final String secret = System.getenv("JWT_SECRET");

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(User user) {

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + 1000 * 60 * 60)
                )
                .signWith(getKey())
                .compact();
    }
    public Integer getUserId(String token) {

    return Jwts.parser()
            .verifyWith(getKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .get("userId", Integer.class);
}
    public boolean isValid(String token) {
    try {
        Jwts.parser()
            .verifyWith(getKey())
            .build()
            .parseSignedClaims(token);

        return true;
    } catch (Exception e) {
        return false;
    }
}
}