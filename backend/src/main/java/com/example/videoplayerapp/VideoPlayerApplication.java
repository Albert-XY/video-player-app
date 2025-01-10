package com.example.videoplayerapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VideoPlayerApplication {
    public static void main(String[] args) {
        SpringApplication.run(VideoPlayerApplication.class, args);
    }
}

