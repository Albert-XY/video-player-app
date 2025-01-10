package com.example.videoplayerapp.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExperimentVideo {
    private Long id;
    private Long experimentId;
    private String videoId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}

