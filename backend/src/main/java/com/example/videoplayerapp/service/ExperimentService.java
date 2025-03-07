package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ResourceLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import javax.persistence.EntityManager;
import javax.persistence.Query;

import java.io.*;
import java.util.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Service
public class ExperimentService {

    @Autowired
    private ResourceLoader resourceLoader;
    
    @Autowired
    private EntityManager entityManager;

    private static final String RVM_MODEL_PATH = "backend/ml/models/rvm_model.joblib";
    private static final String PYTHON_SCRIPT = "backend/ml/video_processor.py";
    private static final double SQUARE_SUM_THRESHOLD = 5.0;
    private static final int MAX_PENDING_VIDEOS = 50;
    private static final double VARIANCE_THRESHOLD = 1.0;

    public String uploadEEGFile(MultipartFile file) {
        // 实现文件上传逻辑
        String filePath = "uploads/" + file.getOriginalFilename();
        try {
            file.transferTo(Paths.get(filePath));
            return filePath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    @Transactional
    public Map<String, Object> processExperimentData(ExperimentData experimentData) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 提取EEG特征
            String eegFeatures = extractEEGFeatures(experimentData.getEegFileUrl());
            
            // 2. 使用RVM模型评估视频
            double predictedScore = evaluateVideoWithRVM(eegFeatures);
            
            // 3. 创建视频评估记录
            Video video = entityManager.find(Video.class, experimentData.getVideoId());
            if (video == null) {
                result.put("status", "error");
                result.put("message", "视频不存在");
                return result;
            }
            
            VideoEvaluation evaluation = new VideoEvaluation();
            evaluation.setVideo(video);
            evaluation.setValence((int) predictedScore);  // 使用RVM预测的评分
            evaluation.setArousal(experimentData.getArousal()); // SAM量表评分
            
            entityManager.persist(evaluation);
            
            result.put("status", "success");
            result.put("message", "实验数据处理完成");
            result.put("predictedScore", predictedScore);
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "处理失败: " + e.getMessage());
        }
        
        return result;
    }
    
    private String extractEEGFeatures(String eegFilePath) {
        // 实现EEG特征提取
        // 这里应该调用你的EEG特征提取代码
        // 返回特征向量的字符串表示
        return ""; // TODO: 实现特征提取
    }
    
    private double evaluateVideoWithRVM(String features) throws IOException, InterruptedException {
        // 调用Python脚本进行RVM评估
        ProcessBuilder pb = new ProcessBuilder(
            "python",
            PYTHON_SCRIPT,
            "evaluate",
            features,
            RVM_MODEL_PATH
        );
        
        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String output = reader.readLine();
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("RVM evaluation failed");
        }
        
        return Double.parseDouble(output);
    }

    @Transactional
    public Map<String, Object> trainRVMModel(String dataPath) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 调用Python脚本训练RVM模型
            ProcessBuilder pb = new ProcessBuilder(
                "python",
                PYTHON_SCRIPT,
                "train",
                dataPath,
                RVM_MODEL_PATH
            );
            
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String output = reader.readLine();
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("RVM training failed");
            }
            
            result.put("status", "success");
            result.put("message", "RVM model trained successfully");
        } catch (IOException | InterruptedException e) {
            result.put("status", "error");
            result.put("message", "Training failed: " + e.getMessage());
        }
        return result;
    }

    @Transactional
    public Map<String, Object> processNewVideo(String videoPath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 使用RVM模型进行初筛
            ProcessBuilder pb = new ProcessBuilder(
                "python",
                PYTHON_SCRIPT,
                "predict",
                videoPath
            );
            
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            
            // 读取Python输出
            boolean passed = Boolean.parseBoolean(reader.readLine().split(": ")[1]);
            double valence = Double.parseDouble(reader.readLine().split(": ")[1]);
            double arousal = Double.parseDouble(reader.readLine().split(": ")[1]);
            double squareSum = Double.parseDouble(reader.readLine().split(": ")[1]);
            
            if (!passed || squareSum <= SQUARE_SUM_THRESHOLD) {
                result.put("status", "rejected");
                result.put("message", "视频未通过初筛");
                return result;
            }
            
            // 2. 检查待处理视频数量
            Long pendingCount = (Long) entityManager.createQuery(
                "SELECT COUNT(v) FROM PendingVideo v")
                .getSingleResult();
                
            if (pendingCount >= MAX_PENDING_VIDEOS) {
                result.put("status", "rejected");
                result.put("message", "待处理视频数量已达上限");
                return result;
            }
            
            // 3. 添加到待处理数据库
            PendingVideo pendingVideo = new PendingVideo();
            pendingVideo.setPath(videoPath);
            pendingVideo.setValence(valence);
            pendingVideo.setArousal(arousal);
            pendingVideo.setUploadTime(LocalDateTime.now());
            
            entityManager.persist(pendingVideo);
            
            result.put("status", "success");
            result.put("message", "视频已添加到待处理列表");
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "处理失败: " + e.getMessage());
        }
        
        return result;
    }
    
    @Transactional
    public Map<String, Object> processSAMEvaluation(Long pendingVideoId, double samValence, double samArousal) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 获取待处理视频
            PendingVideo pendingVideo = entityManager.find(PendingVideo.class, pendingVideoId);
            if (pendingVideo == null) {
                result.put("status", "error");
                result.put("message", "待处理视频不存在");
                return result;
            }
            
            // 2. 计算RVM和SAM评分的方差
            double valenceVariance = Math.pow(pendingVideo.getValence() - samValence, 2);
            double arousalVariance = Math.pow(pendingVideo.getArousal() - samArousal, 2);
            
            if (valenceVariance > VARIANCE_THRESHOLD || arousalVariance > VARIANCE_THRESHOLD) {
                // 方差过大，删除待处理视频
                entityManager.remove(pendingVideo);
                result.put("status", "rejected");
                result.put("message", "RVM和SAM评分差异过大");
                return result;
            }
            
            // 3. 添加到正式视频库
            Video video = new Video();
            video.setPath(pendingVideo.getPath());
            // 使用SAM评分的平均值作为最终评分
            double finalValence = (pendingVideo.getValence() + samValence) / 2;
            double finalArousal = (pendingVideo.getArousal() + samArousal) / 2;
            
            // 根据最终评分确定视频类别
            String label;
            if (finalValence >= 5 && finalArousal >= 5) {
                label = "HAHV";
            } else if (finalValence >= 5 && finalArousal < 5) {
                label = "HALV";
            } else if (finalValence < 5 && finalArousal >= 5) {
                label = "LAHV";
            } else {
                label = "LALV";
            }
            
            video.setLabel(label);
            video.setValence(finalValence);
            video.setArousal(finalArousal);
            
            entityManager.persist(video);
            
            // 4. 删除待处理视频
            entityManager.remove(pendingVideo);
            
            result.put("status", "success");
            result.put("message", "视频已添加到正式库");
            result.put("label", label);
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "处理失败: " + e.getMessage());
        }
        
        return result;
    }
    
    @Transactional
    public Map<String, Object> trainRVMModel(String videoListPath, String labelsPath) {
        Map<String, Object> result = new HashMap<>();
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "python",
                PYTHON_SCRIPT,
                "train",
                videoListPath,
                labelsPath
            );
            
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                result.put("status", "success");
                result.put("message", "RVM模型训练完成");
                result.put("output", output.toString());
            } else {
                result.put("status", "error");
                result.put("message", "RVM模型训练失败");
                result.put("output", output.toString());
            }
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "训练过程发生异常");
            result.put("error", e.getMessage());
        }
        return result;
    }
}
