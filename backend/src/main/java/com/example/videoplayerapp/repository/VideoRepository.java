package com.example.videoplayerapp.repository;

import com.example.videoplayerapp.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoRepository extends JpaRepository<Video, Long> {
}
