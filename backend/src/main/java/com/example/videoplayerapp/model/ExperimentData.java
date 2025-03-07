package com.example.videoplayerapp.model;

import lombok.Data;

import java.util.List;

@Data
public class ExperimentData {
    private List<VideoTiming> videoTimings;
    private String eegFileUrl;
    private String videoId;
    private String startTime;
    private String endTime;
    private int valence;    // RVM量表评分
    private int arousal;    // SAM量表评分

    @Data
    public static class VideoTiming {
        private String videoId;
        private String startTime;
        private String endTime;
    }
}
