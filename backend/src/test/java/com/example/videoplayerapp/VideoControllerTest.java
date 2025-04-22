package com.example.videoplayerapp;

import com.example.videoplayerapp.model.Video;
import com.example.videoplayerapp.service.VideoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
// 使用全限定类名导入WithMockUser
// 这样解决了IDE无法解析的问题，但在实际构建时仍然有效

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VideoControllerTest {

    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private VideoService videoService;

    @Test
    void shouldReturnRandomVideos() throws Exception {
        // 模拟服务返回5个视频
        List<Video> mockVideos = Arrays.asList(
            createMockVideo(1L, "测试视频1"),
            createMockVideo(2L, "测试视频2"),
            createMockVideo(3L, "测试视频3"),
            createMockVideo(4L, "测试视频4"),
            createMockVideo(5L, "测试视频5")
        );
        
        when(videoService.getRandomVideos(5)).thenReturn(mockVideos);

        mockMvc.perform(get("/api/videos/random"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(5)));
    }

    // 添加JWT认证测试
    @Test
    void shouldRejectUnauthorizedAccess() throws Exception {
        mockMvc.perform(post("/api/videos/ratings")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"videoId\": 1, \"rating\": 5}"))
            .andExpect(status().isForbidden());
    }
    
    @Test
    @org.springframework.security.test.context.support.WithMockUser(username = "testuser", roles = {"USER"})
    void shouldAllowAuthorizedAccess() throws Exception {
        // mock service 层返回数据，避免500
        List<Video> approvedVideos = Arrays.asList(
            createMockVideo(1L, "测试视频1"),
            createMockVideo(2L, "测试视频2")
        );
        when(videoService.getApprovedVideos()).thenReturn(approvedVideos);

        mockMvc.perform(get("/api/videos/approved"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }
    
    // 创建模拟视频对象的辅助方法
    private Video createMockVideo(Long id, String title) {
        Video video = new Video();
        video.setId(id);
        video.setTitle(title);
        video.setUrl("https://example.com/video" + id);
        video.setDuration(120);
        return video;
    }
}