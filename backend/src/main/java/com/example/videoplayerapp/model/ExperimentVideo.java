package com.example.videoplayerapp.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
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
