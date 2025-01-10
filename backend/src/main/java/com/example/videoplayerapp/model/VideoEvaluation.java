package com.example.videoplayerapp.model;

import lombok.Data;

@Data
public class VideoEvaluation {
    private String videoId;
    private int valence;
    private int arousal;
}

