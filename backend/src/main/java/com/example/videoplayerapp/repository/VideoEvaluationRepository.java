package com.example.videoplayerapp.repository;

import com.example.videoplayerapp.model.VideoEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoEvaluationRepository extends JpaRepository<VideoEvaluation, Long> {
    // 可以添加自定义查询方法
}
