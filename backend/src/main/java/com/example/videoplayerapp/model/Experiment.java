package com.example.videoplayerapp.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Experiment {
    private Long id;
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String eegFileUrl;
    private List<ExperimentVideo> experimentVideos;
}

