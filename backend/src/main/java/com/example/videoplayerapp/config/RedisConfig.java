package com.example.videoplayerapp.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@Slf4j
public class RedisConfig {
    
    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;
    
    @Value("${spring.data.redis.port:6379}")
    private int redisPort;
    
    @Value("${spring.data.redis.database:0}")
    private int redisDatabase;
    
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        try {
            log.info("配置Redis连接工厂: {}:{}", redisHost, redisPort);
            RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(redisHost, redisPort);
            redisConfig.setDatabase(redisDatabase);
            return new LettuceConnectionFactory(redisConfig);
        } catch (Exception e) {
            log.error("Redis连接工厂配置失败", e);
            throw e;
        }
    }
    
    @Bean
    @Primary
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        try {
            log.info("配置RedisTemplate");
            RedisTemplate<String, Object> template = new RedisTemplate<>();
            template.setConnectionFactory(connectionFactory);
            
            // 使用 StringRedisSerializer 来序列化和反序列化 redis 的 key 值
            template.setKeySerializer(new StringRedisSerializer());
            template.setHashKeySerializer(new StringRedisSerializer());
            
            // 使用 GenericJackson2JsonRedisSerializer 来序列化和反序列化 redis 的 value 值
            GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();
            template.setValueSerializer(jsonSerializer);
            template.setHashValueSerializer(jsonSerializer);
            
            template.afterPropertiesSet();
            return template;
        } catch (Exception e) {
            log.error("RedisTemplate配置失败", e);
            // 出现异常时，返回一个能够正常工作的RedisTemplate，但实际上不会连接Redis
            // 这样应用程序可以正常启动，即使Redis不可用
            RedisTemplate<String, Object> fallbackTemplate = new RedisTemplate<>();
            fallbackTemplate.setConnectionFactory(connectionFactory);
            fallbackTemplate.afterPropertiesSet();
            return fallbackTemplate;
        }
    }
}