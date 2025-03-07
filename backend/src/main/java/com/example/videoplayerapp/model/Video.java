package com.example.videoplayerapp.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String path;  // 视频文件路径
    private String title;
    private LocalDateTime addedTime;
    
    // 最终评分（RVM和SAM的平均值）
    private double valence;
    private double arousal;
    
    private String label;  // LALV, HAHV, HALV, or LAHV
    
    @Version
    private Long version;  // 用于乐观锁
    
    public Video() {}
    
    public Video(String path, String title, double valence, double arousal) {
        this.path = path;
        this.title = title;
        this.valence = valence;
        this.arousal = arousal;
        this.addedTime = LocalDateTime.now();
        this.label = calculateLabel();
    }
    
    // 根据效价和唤醒度计算标签
    private String calculateLabel() {
        if (valence >= 5 && arousal >= 5) {
            return "HAHV";
        } else if (valence >= 5 && arousal < 5) {
            return "HALV";
        } else if (valence < 5 && arousal >= 5) {
            return "LAHV";
        } else {
            return "LALV";
        }
    }
    
    // 更新评分时自动更新标签
    public void updateScores(double valence, double arousal) {
        this.valence = valence;
        this.arousal = arousal;
        this.label = calculateLabel();
    }
}
