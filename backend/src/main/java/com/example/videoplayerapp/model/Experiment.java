package com.example.videoplayerapp.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Experiment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String eegFileUrl;
    
    @OneToMany(mappedBy = "experiment", cascade = CascadeType.ALL)
    private List<ExperimentVideo> experimentVideos;
}
