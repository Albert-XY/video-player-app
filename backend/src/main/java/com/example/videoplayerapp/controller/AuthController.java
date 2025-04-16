package com.example.videoplayerapp.controller;

import com.example.videoplayerapp.dto.LoginRequest;
import com.example.videoplayerapp.dto.RegisterRequest;
import com.example.videoplayerapp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Attempting to register user: {}", request.getUsername());
            
            // 检查用户名是否已存在
            if (authService.isUsernameExists(request.getUsername())) {
                log.warn("Username already exists: {}", request.getUsername());
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username already exists"));
            }

            // 检查邮箱是否已存在
            if (authService.isEmailExists(request.getEmail())) {
                log.warn("Email already exists: {}", request.getEmail());
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already exists"));
            }

            // 创建新用户
            var user = authService.register(
                request.getUsername(),
                request.getPassword(),
                request.getEmail(),
                request.getFullName()
            );

            log.info("User registered successfully: {}", request.getUsername());
            return ResponseEntity.ok()
                .body(Map.of(
                    "message", "User registered successfully",
                    "userId", user.getId()
                ));

        } catch (Exception e) {
            log.error("Registration failed for user: {}", request.getUsername(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Attempting to login user: {}", request.getUsername());
            var loginResult = authService.login(request.getUsername(), request.getPassword());

            if (loginResult.isEmpty()) {
                log.warn("Login failed for user: {}", request.getUsername());
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid username or password"));
            }

            log.info("User logged in successfully: {}", request.getUsername());
            return ResponseEntity.ok(loginResult.get());

        } catch (Exception e) {
            log.error("Login failed for user: {}", request.getUsername(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        log.info("User logout");
        try {
            authService.logout();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
