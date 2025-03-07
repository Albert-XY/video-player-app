package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.User;
import com.example.videoplayerapp.repository.UserRepository;
import com.example.videoplayerapp.security.jwt.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional(rollbackFor = Exception.class)
    public String register(String username, String password, String email, String fullName) {
        log.info("开始处理注册请求 - 用户名: {}, 邮箱: {}", username, email);
        
        try {
            // 1. 基础验证
            validateRegistrationInput(username, password, email, fullName);
            
            // 2. 检查用户名和邮箱是否已存在
            checkUserExistence(username, email);
            
            // 3. 创建用户对象
            User user = createUserObject(username, password, email, fullName);
            
            // 4. 保存用户
            log.debug("准备保存用户信息: {}", user.getUsername());
            User savedUser = userRepository.save(user);
            log.info("用户保存成功 - ID: {}, 用户名: {}", savedUser.getId(), savedUser.getUsername());
            
            // 5. 生成Token
            UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
            String token = jwtTokenUtil.generateToken(userDetails);
            log.info("Token生成成功 - 用户名: {}", savedUser.getUsername());
            
            return token;
            
        } catch (IllegalArgumentException e) {
            log.warn("注册参数验证失败: {}", e.getMessage());
            throw e;
        } catch (DataIntegrityViolationException e) {
            log.error("数据完整性错误: {}", e.getMessage());
            throw new IllegalStateException("保存用户数据时发生错误，请确保所有信息正确", e);
        } catch (Exception e) {
            log.error("注册过程中发生未预期的错误", e);
            throw new RuntimeException("注册失败，请稍后重试: " + e.getMessage());
        }
    }

    private void validateRegistrationInput(String username, String password, String email, String fullName) {
        log.debug("开始验证注册输入参数");
        
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        if (username.length() < 3 || username.length() > 20) {
            throw new IllegalArgumentException("用户名长度必须在3-20个字符之间");
        }
        
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }
        if (password.length() < 6 || password.length() > 20) {
            throw new IllegalArgumentException("密码长度必须在6-20个字符之间");
        }
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("邮箱不能为空");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("邮箱格式不正确");
        }
        
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new IllegalArgumentException("姓名不能为空");
        }
        
        log.debug("注册输入参数验证通过");
    }

    private void checkUserExistence(String username, String email) {
        log.debug("检查用户名和邮箱是否已存在");
        
        if (userRepository.existsByUsername(username)) {
            log.warn("用户名已存在: {}", username);
            throw new IllegalArgumentException("用户名已存在");
        }
        
        if (userRepository.existsByEmail(email)) {
            log.warn("邮箱已存在: {}", email);
            throw new IllegalArgumentException("邮箱已存在");
        }
        
        log.debug("用户名和邮箱检查通过");
    }

    private User createUserObject(String username, String password, String email, String fullName) {
        log.debug("开始创建用户对象");
        
        User user = new User();
        user.setUsername(username.trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email.trim().toLowerCase());
        user.setFullName(fullName.trim());
        user.setRole("USER");
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        log.debug("用户对象创建完成");
        return user;
    }

    public String login(String username, String password) {
        log.info("开始处理登录请求 - 用户名: {}", username);
        
        try {
            // 验证用户凭证
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            
            // 更新最后登录时间
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
            user.setLastLoginTime(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            
            // 生成新token
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            String token = jwtTokenUtil.generateToken(userDetails);
            log.info("用户登录成功 - 用户名: {}", username);
            return token;
            
        } catch (BadCredentialsException e) {
            log.warn("登录失败 - 用户名或密码错误: {}", username);
            throw new IllegalArgumentException("用户名或密码错误");
        } catch (Exception e) {
            log.error("登录过程中发生错误", e);
            throw new RuntimeException("登录失败，请稍后重试");
        }
    }
}
