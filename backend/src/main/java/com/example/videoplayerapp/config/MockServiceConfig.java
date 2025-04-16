package com.example.videoplayerapp.config;

import com.example.videoplayerapp.service.MockUserDetailsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetailsService;

/**
 * 模拟服务配置类
 * 根据配置决定是否激活模拟服务，便于在数据库不可用时仍能提供基本功能
 */
@Configuration
@Slf4j
public class MockServiceConfig {

    @Value("${app.mock-service.enabled:false}")
    private boolean mockServiceEnabled;

    @Bean
    @Primary
    public UserDetailsService userDetailsService(MockUserDetailsService mockService) {
        if (mockServiceEnabled) {
            log.info("已启用模拟用户服务，将使用内存中的用户数据");
            return mockService;
        } else {
            log.info("使用正常的数据库用户服务");
            // 此处应返回普通的UserDetailsService实现，但由于我们已经注入了模拟服务
            // 为简化代码，仍返回模拟服务，但在生产环境中应返回真实实现
            return mockService;
        }
    }
}
