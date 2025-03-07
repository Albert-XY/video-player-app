package com.example.videoplayerapp.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        log.error("数据完整性违规: {}", e.getMessage(), e);
        String message = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        
        if (message.contains("users_username_key") || message.contains("uk_username")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "用户名已被使用"));
        } else if (message.contains("users_email_key") || message.contains("uk_email")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "邮箱已被使用"));
        }
        
        return ResponseEntity.badRequest()
                .body(Map.of("message", "数据验证失败，请检查输入"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException e) {
        log.error("参数验证失败: {}", e.getMessage(), e);
        return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<?> handleAuthenticationException(Exception e) {
        log.error("认证失败: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "用户名或密码错误"));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ResponseEntity<?> handleValidationExceptions(Exception e) {
        log.error("请求参数验证失败", e);
        Map<String, Object> response = new HashMap<>();
        
        if (e instanceof MethodArgumentNotValidException) {
            String errors = ((MethodArgumentNotValidException) e).getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            response.put("message", "请求参数验证失败");
            response.put("details", errors);
        } else {
            String errors = ((BindException) e).getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            response.put("message", "请求参数验证失败");
            response.put("details", errors);
        }
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: {}", e.getMessage(), e);
        return ResponseEntity.internalServerError()
                .body(Map.of(
                    "message", "服务器内部错误，请稍后重试",
                    "error", e.getMessage()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        log.error("未预期的错误: {}", e.getMessage(), e);
        return ResponseEntity.internalServerError()
                .body(Map.of(
                    "message", "服务器内部错误，请稍后重试",
                    "error", e.getMessage()
                ));
    }
}
