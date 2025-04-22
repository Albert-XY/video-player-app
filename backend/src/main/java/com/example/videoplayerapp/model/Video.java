package com.example.videoplayerapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
@Data
@NoArgsConstructor
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String path;  // 视频文件路径
    private String title;
    private LocalDateTime addedTime;
    
    private String url;      // 视频URL
    private int duration;    // 视频时长（秒）
    
    // 最终评分（RVM和SAM的平均值）
    private double valence;
    private double arousal;
    
    private String label;  // LALV, HAHV, HALV, or LAHV
    
    @Version
    private Long version;  // 用于乐观锁
    
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
    
    // 添加缺失字段
    @Column(name = "experimental")
    private boolean experimental;
    
    @Column(name = "category")
    private String category;
    
    @Column(name = "valence_score")
    private double valenceScore;
    
    @Column(name = "arousal_score")
    private double arousalScore;
    
    // 生成对应的getter/setter方法
    // [用IDE自动生成所有字段的getter/setter]
}
