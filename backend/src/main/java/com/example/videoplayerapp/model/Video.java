package com.example.videoplayerapp.model;

import lombok.Data;

@Data
public class Video {
    private String id;
    private String title;
    private String src;
    private String label; // LALV, HAHV, HALV, or LAHV

    public Video(String id, String title, String src, String label) {
        this.id = id;
        this.title = title;
        this.src = src;
        this.label = label;
    }
}

