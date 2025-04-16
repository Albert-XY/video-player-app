package com.example.videoplayerapp.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Slf4j
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        log.info("健康检查接口被调用");
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().toString(),
            "message", "服务运行正常"
        ));
    }
}
