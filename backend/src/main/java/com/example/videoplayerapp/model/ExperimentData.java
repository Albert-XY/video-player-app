package com.example.videoplayerapp.model;

import lombok.Data;

import java.util.List;

@Data
public class ExperimentData {
    private List<VideoTiming> videoTimings;
    private String eegFileUrl;

    @Data
    public static class VideoTiming {
        private String videoId;
        private String startTime;
        private String endTime;
    }
}

