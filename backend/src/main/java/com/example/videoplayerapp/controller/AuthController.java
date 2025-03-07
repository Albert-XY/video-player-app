package com.example.videoplayerapp.controller;

import com.example.videoplayerapp.dto.RegisterRequest;
import com.example.videoplayerapp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:3000",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true"
)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        log.info("开始处理注册请求: {}", request.getUsername());
        
        if (bindingResult.hasErrors()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "请求参数验证失败");
            response.put("errors", bindingResult.getFieldErrors().stream()
                .collect(Collectors.toMap(
                    error -> error.getField(),
                    error -> error.getDefaultMessage()
                )));
            log.warn("注册参数验证失败: {}", response);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String token = authService.register(
                request.getUsername(),
                request.getPassword(),
                request.getEmail(),
                request.getFullName()
            );
            log.info("注册成功，返回token");
            return ResponseEntity.ok(Map.of(
                "token", token,
                "message", "注册成功"
            ));
        } catch (IllegalArgumentException e) {
            log.error("注册参数验证失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("注册过程中发生错误", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "注册失败，请稍后重试"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        log.info("开始处理登录请求: {}", request.get("username"));
        
        // 验证必填字段
        String[] requiredFields = {"username", "password"};
        for (String field : requiredFields) {
            if (!request.containsKey(field) || request.get(field) == null || request.get(field).trim().isEmpty()) {
                log.warn("缺少必填字段: {}", field);
                return ResponseEntity.badRequest()
                    .body(Map.of("message", field + " 是必填项"));
            }
        }

        try {
            String token = authService.login(
                request.get("username"),
                request.get("password")
            );
            log.info("登录成功，返回token");
            return ResponseEntity.ok(Map.of(
                "token", token,
                "message", "登录成功"
            ));
        } catch (IllegalArgumentException e) {
            log.error("登录参数验证失败: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("登录过程中发生错误", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "登录失败，请稍后重试"));
        }
    }
}
