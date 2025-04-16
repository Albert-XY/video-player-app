package com.example.videoplayerapp.controller;

import com.example.videoplayerapp.model.Video;
import com.example.videoplayerapp.service.VideoService;
import com.example.videoplayerapp.service.ExperimentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class VideoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private VideoService videoService;
    
    @Mock
    private ExperimentService experimentService;

    @InjectMocks
    private VideoController videoController;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(videoController).build();
    }

    @Test
    public void getAllVideos_ShouldReturnAllVideos() throws Exception {
        // 准备模拟数据 - 使用正确的构造函数
        Video video1 = new Video("https://example.com/video1.mp4", "测试视频1", 7.5, 6.2);
        video1.setId(1L);
        
        Video video2 = new Video("https://example.com/video2.mp4", "测试视频2", 4.8, 3.5);
        video2.setId(2L);
        
        List<Video> videos = Arrays.asList(video1, video2);
        
        // 设置模拟服务行为
        when(videoService.getAllVideos()).thenReturn(videos);
        
        // 执行请求并验证
        mockMvc.perform(get("/api/videos"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is("测试视频1")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].title", is("测试视频2")));
        
        // 验证服务方法被调用
        verify(videoService, times(1)).getAllVideos();
    }
    
    @Test
    public void getVideoById_WithExistingId_ShouldReturnVideo() throws Exception {
        // 准备模拟数据 - 使用正确的构造函数
        Video video = new Video("https://example.com/video1.mp4", "测试视频1", 7.5, 6.2);
        video.setId(1L);
        
        // 设置模拟服务行为
        when(videoService.getVideoById(1L)).thenReturn(Optional.of(video));
        
        // 执行请求并验证
        mockMvc.perform(get("/api/videos/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("测试视频1")));
        
        // 验证服务方法被调用
        verify(videoService, times(1)).getVideoById(1L);
    }
    
    @Test
    public void getVideoById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // 设置模拟服务行为
        when(videoService.getVideoById(999L)).thenReturn(Optional.empty());
        
        // 执行请求并验证
        mockMvc.perform(get("/api/videos/999"))
                .andExpect(status().isNotFound());
        
        // 验证服务方法被调用
        verify(videoService, times(1)).getVideoById(999L);
    }
    
    @Test
    public void createVideo_ShouldReturnCreatedVideo() throws Exception {
        // 准备模拟数据 - 使用正确的构造函数
        Video createdVideo = new Video("https://example.com/new.mp4", "新视频", 6.0, 7.0);
        createdVideo.setId(3L);
        
        // 设置模拟服务行为
        when(videoService.saveVideo(any(Video.class))).thenReturn(createdVideo);
        
        // 执行请求并验证
        mockMvc.perform(post("/api/videos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"path\":\"https://example.com/new.mp4\",\"title\":\"新视频\",\"valence\":6.0,\"arousal\":7.0}"))
                .andExpect(status().isOk())  // 修改这里，Controller返回的是200 OK
                .andExpect(jsonPath("$.id", is(3)))
                .andExpect(jsonPath("$.title", is("新视频")));
        
        // 验证服务方法被调用
        verify(videoService, times(1)).saveVideo(any(Video.class));
    }
}
