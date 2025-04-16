package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.User;
import com.example.videoplayerapp.repository.UserRepository;
import com.example.videoplayerapp.security.jwt.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;

    public User register(String username, String password, String email, String fullName) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFullName(fullName);
        user.setActive(true);
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    public Optional<Map<String, Object>> login(String username, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();
            
            String token = jwtTokenUtil.generateToken(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName() != null ? user.getFullName() : "");
            response.put("role", user.getRole());
            
            return Optional.of(response);
        } catch (Exception e) {
            log.error("Authentication failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
    
    public void logout() {
        SecurityContextHolder.clearContext();
    }
    
    public boolean isUsernameExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }
    
    public boolean isEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}
