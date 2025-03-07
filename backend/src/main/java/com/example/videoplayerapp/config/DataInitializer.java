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
            Video video1 = new Video();
            video1.setTitle("实验视频 1");
            video1.setPath("/videos/exp1.mp4");
            video1.setExperimental(true);
            video1.setCategory("LALV");
            video1.setValenceScore(2.5);
            video1.setArousalScore(2.0);
            videoRepository.save(video1);

            Video video2 = new Video();
            video2.setTitle("实验视频 2");
            video2.setPath("/videos/exp2.mp4");
            video2.setExperimental(true);
            video2.setCategory("HAHV");
            video2.setValenceScore(7.5);
            video2.setArousalScore(8.0);
            videoRepository.save(video2);

            System.out.println("数据库初始化完成：添加了测试视频数据");
        };
    }
}
