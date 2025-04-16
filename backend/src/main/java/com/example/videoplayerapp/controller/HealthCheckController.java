package com.example.videoplayerapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;

/**
 * 系统健康检查控制器
 * 用于前端检测API服务是否正常运行
 */
@RestController
@RequestMapping("/api")
@Slf4j
public class HealthCheckController {
    
    private final String startTime = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
    
    /**
     * 健康检查端点，返回系统基本信息
     * 此接口不需要认证即可访问，用于前端检测API可用性
     * @return 系统状态信息
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        log.info("接收到健康检查请求");
        
        // 获取系统信息
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        
        // 构建响应
        Map<String, Object> response = Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
            "startTime", startTime,
            "javaVersion", System.getProperty("java.version"),
            "memory", Map.of(
                "total", totalMemory + "MB",
                "free", freeMemory + "MB",
                "max", maxMemory + "MB"
            )
        );
        
        return ResponseEntity.ok(response);
    }
}
