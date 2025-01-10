package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.Video;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class VideoService {

    private List<Video> videos = new ArrayList<>();

    public VideoService() {
        // Mock data, in a real application this would be loaded from a database
        videos.add(new Video("1", "Video 1", "path/to/video1.mp4", "LALV"));
        videos.add(new Video("2", "Video 2", "path/to/video2.mp4", "HAHV"));
        videos.add(new Video("3", "Video 3", "path/to/video3.mp4", "HALV"));
        videos.add(new Video("4", "Video 4", "path/to/video4.mp4", "LAHV"));
        videos.add(new Video("5", "Video 5", "path/to/video5.mp4", "LALV"));
        videos.add(new Video("6", "Video 6", "path/to/video6.mp4", "HAHV"));
    }

    public List<Video> getRandomExperimentalVideos(int count) {
        List<Video> shuffledVideos = new ArrayList<>(videos);
        Collections.shuffle(shuffledVideos);
        return shuffledVideos.subList(0, Math.min(count, shuffledVideos.size()));
    }
}

