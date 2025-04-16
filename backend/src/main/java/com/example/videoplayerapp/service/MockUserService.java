package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.User;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 简化的用户仓库实现，仅提供必要的用户查询功能
 * 不实现完整的JpaRepository接口，避免依赖问题
 */
@Service
@Slf4j
public class MockUserService {
    private final ConcurrentHashMap<String, User> usersByUsername = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, User> usersByEmail = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, User> usersById = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(1);

    public MockUserService() {
        log.info("初始化模拟用户服务...");
        // 初始化一些测试用户
        addTestUser("admin", "admin123", "admin@example.com", "管理员", "ADMIN");
        addTestUser("test", "test123", "test@example.com", "测试用户", "USER");
        addTestUser("demo", "demo123", "demo@example.com", "演示账号", "USER");
        log.info("已创建3个测试用户");
    }

    private void addTestUser(String username, String password, String email, String fullName, String role) {
        User user = new User();
        user.setId(idSequence.getAndIncrement());
        user.setUsername(username);
        user.setPassword(password); // 实际应用中应该加密
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        usersByUsername.put(username, user);
        usersByEmail.put(email, user);
        usersById.put(user.getId(), user);
    }

    public Optional<User> findByUsername(String username) {
        return Optional.ofNullable(usersByUsername.get(username));
    }

    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(usersByEmail.get(email));
    }

    public boolean existsByUsername(String username) {
        return usersByUsername.containsKey(username);
    }

    public boolean existsByEmail(String email) {
        return usersByEmail.containsKey(email);
    }

    public User save(User user) {
        if (user.getId() == null) {
            user.setId(idSequence.getAndIncrement());
        }
        
        usersByUsername.put(user.getUsername(), user);
        if (user.getEmail() != null) {
            usersByEmail.put(user.getEmail(), user);
        }
        usersById.put(user.getId(), user);
        
        return user;
    }

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(usersById.get(id));
    }

    public List<User> findAll() {
        return new ArrayList<>(usersById.values());
    }
    
    public boolean existsById(Long id) {
        return usersById.containsKey(id);
    }

    public long count() {
        return usersById.size();
    }

    public void deleteById(Long id) {
        User user = usersById.remove(id);
        if (user != null) {
            usersByUsername.remove(user.getUsername());
            if (user.getEmail() != null) {
                usersByEmail.remove(user.getEmail());
            }
        }
    }

    public void delete(User user) {
        if (user.getId() != null) {
            deleteById(user.getId());
        }
    }
}
