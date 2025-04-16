package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.Video;
import com.example.videoplayerapp.repository.VideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VideoServiceTest {

    @Mock
    private VideoRepository videoRepository;

    @InjectMocks
    private VideoService videoService;

    private Video video1;
    private Video video2;

    @BeforeEach
    public void setup() {
        // 使用实际Video类中的构造函数: (path, title, valence, arousal)
        video1 = new Video("/videos/test1.mp4", "测试视频1", 7.5, 8.0);
        video2 = new Video("/videos/test2.mp4", "测试视频2", 3.0, 6.5);
        
        // 手动设置ID
        setVideoId(video1, 1L);
        setVideoId(video2, 2L);
    }
    
    // 反射设置私有ID字段的辅助方法
    private void setVideoId(Video video, Long id) {
        try {
            java.lang.reflect.Field idField = Video.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(video, id);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getAllVideos_ShouldReturnAllVideos() {
        // 准备
        List<Video> expectedVideos = Arrays.asList(video1, video2);
        when(videoRepository.findAll()).thenReturn(expectedVideos);

        // 执行
        List<Video> actualVideos = videoService.getAllVideos();

        // 验证
        assertEquals(2, actualVideos.size());
        assertEquals(expectedVideos, actualVideos);
        verify(videoRepository, times(1)).findAll();
    }

    @Test
    public void getVideoById_WithExistingId_ShouldReturnVideo() {
        // 准备
        when(videoRepository.findById(1L)).thenReturn(Optional.of(video1));

        // 执行
        Optional<Video> result = videoService.getVideoById(1L);

        // 验证
        assertTrue(result.isPresent());
        assertEquals(video1, result.get());
        verify(videoRepository, times(1)).findById(1L);
    }

    @Test
    public void getVideoById_WithNonExistingId_ShouldReturnEmpty() {
        // 准备
        when(videoRepository.findById(999L)).thenReturn(Optional.empty());

        // 执行
        Optional<Video> result = videoService.getVideoById(999L);

        // 验证
        assertFalse(result.isPresent());
        verify(videoRepository, times(1)).findById(999L);
    }

    @Test
    public void saveVideo_ShouldReturnSavedVideo() {
        // 准备
        Video videoToSave = new Video("/videos/new.mp4", "新视频", 5.0, 5.0);
        Video savedVideo = new Video("/videos/new.mp4", "新视频", 5.0, 5.0);
        setVideoId(savedVideo, 3L);
        
        when(videoRepository.save(any(Video.class))).thenReturn(savedVideo);

        // 执行
        Video result = videoService.saveVideo(videoToSave);

        // 验证
        assertNotNull(result);
        assertEquals(3L, result.getId());
        assertEquals("新视频", result.getTitle());
        verify(videoRepository, times(1)).save(videoToSave);
    }

    @Test
    public void deleteVideo_ShouldDeleteVideo() {
        // 准备
        doNothing().when(videoRepository).deleteById(1L);

        // 执行
        videoService.deleteVideo(1L);

        // 验证
        verify(videoRepository, times(1)).deleteById(1L);
    }
}
