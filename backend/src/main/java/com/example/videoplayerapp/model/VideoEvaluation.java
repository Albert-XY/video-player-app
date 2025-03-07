package com.example.videoplayerapp.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
public class VideoEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "video_id")
    private Video video;
    
    private int valence;    // RVM量表评分
    private int arousal;    // SAM量表评分
    private LocalDateTime evaluationTime;
    private boolean processed;  // 是否已处理
    
    @PrePersist
    protected void onCreate() {
        evaluationTime = LocalDateTime.now();
        processed = false;
    }
    
    @PostLoad
    protected void onLoad() {
        // 检查待处理评估数量是否超过50
        if (!processed) {
            EntityManager em = EntityManagerFactoryUtils.getTransactionalEntityManager(
                    JpaEntityManagerFactoryUtils.getEntityManagerFactory());
            if (em != null) {
                Long pendingCount = (Long) em.createQuery(
                    "SELECT COUNT(v) FROM VideoEvaluation v WHERE v.processed = false")
                    .getSingleResult();
                
                if (pendingCount > 50) {
                    // 如果超过50个，自动处理最早的评估
                    em.createQuery(
                        "SELECT v FROM VideoEvaluation v WHERE v.processed = false ORDER BY v.evaluationTime ASC")
                        .setMaxResults(1)
                        .getResultList()
                        .forEach(v -> ((VideoEvaluation)v).setProcessed(true));
                }
            }
        }
    }
}
