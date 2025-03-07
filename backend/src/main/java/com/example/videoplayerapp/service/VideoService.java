package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.Video;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class VideoService {

    @Autowired
    private EntityManager entityManager;

    @PostConstruct
    @Transactional
    public void init() {
        // 检查是否已有数据
        Long count = (Long) entityManager.createQuery("SELECT COUNT(v) FROM Video v").getSingleResult();
        if (count == 0) {
            // 初始化示例数据
            List<Video> videos = new ArrayList<>();
            videos.add(new Video("1", "Video 1", "path/to/video1.mp4", "LALV"));
            videos.add(new Video("2", "Video 2", "path/to/video2.mp4", "HAHV"));
            videos.add(new Video("3", "Video 3", "path/to/video3.mp4", "HALV"));
            videos.add(new Video("4", "Video 4", "path/to/video4.mp4", "LAHV"));
            videos.add(new Video("5", "Video 5", "path/to/video5.mp4", "LALV"));
            videos.add(new Video("6", "Video 6", "path/to/video6.mp4", "HAHV"));
            
            for (Video video : videos) {
                entityManager.persist(video);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Video> getRandomExperimentalVideos(int count) {
        List<Video> allVideos = entityManager.createQuery("SELECT v FROM Video v", Video.class)
                                           .getResultList();
        List<Video> shuffledVideos = new ArrayList<>(allVideos);
        Collections.shuffle(shuffledVideos);
        return shuffledVideos.subList(0, Math.min(count, shuffledVideos.size()));
    }
}
