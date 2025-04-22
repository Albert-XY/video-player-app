package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Optional;

/**
 * 用户服务接口
 * 定义系统中与用户相关的业务逻辑
 */
public interface UserService extends UserDetailsService {
    
    /**
     * 根据用户名查找用户
     * 
     * @param username 用户名
     * @return 用户对象，如果不存在则返回空
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 创建新用户
     * 
     * @param user 用户对象
     * @return 创建后的用户
     */
    User saveUser(User user);
    
    /**
     * 验证用户凭据
     * 
     * @param username 用户名
     * @param password 密码
     * @return 如果凭据有效则返回true
     */
    boolean validateCredentials(String username, String password);
}
