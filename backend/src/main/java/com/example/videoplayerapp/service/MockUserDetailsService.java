package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * 这是一个简化版的用户服务实现，用于在数据库连接不可用时提供基本的用户认证功能
 * 此服务仅用于开发和测试阶段
 */
@Service
@Primary
@Slf4j
@RequiredArgsConstructor
public class MockUserDetailsService implements UserDetailsService {
    
    private final MockUserService mockUserService;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = mockUserService.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("用户不存在: {}", username);
                    return new UsernameNotFoundException("用户不存在: " + username);
                });
        
        log.info("已加载用户: {}", username);
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole())
                .build();
    }
    
    /**
     * 获取用户详情，用于其他服务
     */
    public User getUserByUsername(String username) {
        return mockUserService.findByUsername(username).orElse(null);
    }
}
