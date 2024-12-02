package com.dan.shoe.shoe.security.jwt;

import com.dan.shoe.shoe.models.BlacklistedToken;
import com.dan.shoe.shoe.models.User;
import com.dan.shoe.shoe.repositories.BlacklistedTokenRepository;
import com.dan.shoe.shoe.repositories.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMillis;
    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;
    @Autowired
    private UserRepository userRepository;

    public String generateToken(String username) {
        User user = userRepository.findByUsername(username);
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getRoles().stream().map(role -> role.getName().name()).toArray());
        return createToken(claims, username, jwtExpirationInMillis);
    }

    private String createToken(Map<String, Object> claims, String username, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, getSignKey())
                .compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody();
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsTFunction) {
        final Claims claims = extractAllClaims(token);
        return claimsTFunction.apply(claims);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String usernameInToken = extractUsername(token);
        return (usernameInToken.equals(userDetails.getUsername()) && !isTokenExpired(token) && !isTokenBlacklisted(token));
    }

    public void validateToken(final String token) {
        if (!isTokenBlacklisted(token)){
            Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token);
        } else {
            throw new RuntimeException("Invalid JWT token");
        }
    }

    public void deleteToken(String token) {
        Date expirationDate = extractExpiration(token);
        blacklistedTokenRepository.save(BlacklistedToken.builder()
                .token(token).expirationDate(expirationDate).build());
    }

    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokenRepository.findByToken(token).isPresent();
    }
}