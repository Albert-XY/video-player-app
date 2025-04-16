package com.example.videoplayerapp.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "experiment_videos")
public class ExperimentVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "experiment_id")
    private Experiment experiment;
    
    @ManyToOne
    @JoinColumn(name = "video_id")
    private Video video;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
