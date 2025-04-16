package com.example.videoplayerapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "experiments")
public class Experiment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String eegFileUrl;
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "experiment", cascade = CascadeType.ALL)
    private List<ExperimentVideo> experimentVideos;
}
