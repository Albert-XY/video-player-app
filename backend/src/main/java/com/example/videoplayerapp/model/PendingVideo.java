package com.example.videoplayerapp.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
public class PendingVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String path;  // 视频文件路径
    private String title;
    private LocalDateTime uploadTime;
    
    // RVM模型预测的评分
    private double valence;
    private double arousal;
    
    // SAM量表评分（如果已评估）
    private Double samValence;
    private Double samArousal;
    
    private String status = "PENDING";  // PENDING, EVALUATED, REJECTED
    
    @Version
    private Long version;  // 用于乐观锁，防止并发问题
    
    // 计算RVM和SAM评分的方差
    @Transient  // 不持久化到数据库
    public double getValenceVariance() {
        if (samValence == null) return 0.0;
        return Math.pow(valence - samValence, 2);
    }
    
    @Transient
    public double getArousalVariance() {
        if (samArousal == null) return 0.0;
        return Math.pow(arousal - samArousal, 2);
    }
}
