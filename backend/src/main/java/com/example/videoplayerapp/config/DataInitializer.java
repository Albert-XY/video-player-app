package com.example.videoplayerapp.config;

import com.example.videoplayerapp.model.Video;
import com.example.videoplayerapp.repository.VideoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(VideoRepository videoRepository) {
        return args -> {
            // 添加一些测试视频数据
            Video video1 = new Video("/videos/exp1.mp4", "实验视频 1", 2.5, 2.0);
            video1.setExperimental(true);
            video1.setCategory("LALV");
            videoRepository.save(video1);

            Video video2 = new Video("/videos/exp2.mp4", "实验视频 2", 7.5, 8.0);
            video2.setExperimental(true);
            video2.setCategory("HAHV");
            videoRepository.save(video2);

            System.out.println("数据库初始化完成：添加了测试视频数据");
        };
    }
}
