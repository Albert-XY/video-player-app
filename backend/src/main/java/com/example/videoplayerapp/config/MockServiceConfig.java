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

    /**
     * 服务配置已更新，确保仅在测试环境下使用模拟服务
     * 生产环境将始终使用真实的数据库和UserDetailsService实现
     */
    @Bean
    @Primary
    public UserDetailsService userDetailsService(MockUserDetailsService mockService, 
            @org.springframework.beans.factory.annotation.Autowired(required = false) 
            com.example.videoplayerapp.service.UserService realUserService) {
        if (mockServiceEnabled) {
            log.info("已启用模拟用户服务，将使用内存中的用户数据");
            return mockService;
        } else {
            log.info("使用正常的数据库用户服务");
            // 确保返回真实的UserDetailsService实现
            if (realUserService != null) {
                return (UserDetailsService) realUserService;
            } else {
                log.warn("未找到真实的UserService实现，系统可能无法正常运行。请确保数据库连接配置正确。");
                throw new org.springframework.beans.factory.NoSuchBeanDefinitionException(
                    "UserService", "No real UserService implementation found. Check database connection.");
            }
        }
    }
}
