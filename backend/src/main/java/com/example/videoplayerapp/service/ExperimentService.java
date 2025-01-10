package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.ExperimentData;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class ExperimentService {

    @Autowired
    private ResourceLoader resourceLoader;

    public String uploadEEGFile(MultipartFile file) {
        // 实现文件上传逻辑（例如，保存到MinIO或S3）
        // 现在我们只返回一个模拟的URL
        return "http://example.com/eeg-files/" + file.getOriginalFilename();
    }

    public Map<String, Object> processExperimentData(ExperimentData experimentData) {
        // 实现实际的数据处理逻辑
        // 这通常涉及发送数据到您的服务器端处理程序并等待结果

        // 现在我们只返回一个模拟的结果
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "实验数据处理完成");
        result.put("details", "这里将包含来自服务器端处理程序的详细结果");
        return result;
    }

    public Map<String, Object> runCrossValidation(String dataPath) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 使用Python脚本运行交叉验证
            Process process = Runtime.getRuntime().exec("python backend/ml/run_cross_validation.py " + dataPath);

            // 读取Python脚本的输出
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            StringBuilder output = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            // 等待Python进程完成
            int exitCode = process.waitFor();

            if (exitCode == 0) {
                result.put("status", "success");
                result.put("message", "交叉验证完成");
                result.put("output", output.toString());
            } else {
                result.put("status", "error");
                result.put("message", "交叉验证过程中出错");
                result.put("output", output.toString());
            }
        } catch (IOException | InterruptedException e) {
            result.put("status", "error");
            result.put("message", "运行交叉验证时发生异常");
            result.put("error", e.getMessage());
        }

        return result;
    }
}

