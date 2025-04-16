package com.example.videoplayerapp.model;
import lombok.Data;
import jakarta.persistence.*; 
import jakarta.persistence.PostLoad; 
import jakarta.persistence.PrePersist; 
import java.time.LocalDateTime;

// 添加Lombok注解和JPA关联
@Data
@Entity
public class VideoEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "video_id")
    private Video video;
    
    private double valence;
    private double arousal;
}
