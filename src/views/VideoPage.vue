<template>
  <div class="video-page">
    <el-row :gutter="20">
      <el-col :span="16">
        <div class="video-container">
          <vue-video-player
            class="video-player"
            ref="videoPlayer"
            :options="playerOptions"
          />
          <vue-danmaku
            :danmus="danmus"
            :config="danmakuConfig"
            @send="sendDanmaku"
          />
        </div>
        <h2>{{ video.title }}</h2>
        <p>{{ video.description }}</p>
      </el-col>
      <el-col :span="8">
        <div class="chart-container">
          <div ref="chartRef" style="width: 100%; height: 300px;"></div>
        </div>
        <div class="comments-section">
          <h3>评论</h3>
          <el-input
            v-model="newComment"
            placeholder="添加评论..."
            @keyup.enter="addComment"
          ></el-input>
          <el-button @click="addComment">发表评论</el-button>
          <ul>
            <li v-for="comment in comments" :key="comment.id">
              {{ comment.content }} - {{ comment.user }}
            </li>
          </ul>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElRow, ElCol, ElInput, ElButton } from 'element-plus'
import { useRoute } from 'vue-router'
import { useVideoPlayer } from '@vueuse/core'
import VueDanmaku from 'danmaku-vue'
import * as echarts from 'echarts'

const route = useRoute()
const videoId = route.params.id

const video = ref({ title: '', description: '', src: '' })
const comments = ref([])
const newComment = ref('')

const videoPlayer = ref(null)
const { player } = useVideoPlayer(videoPlayer)

const playerOptions = ref({
  sources: [{ type: "video/mp4", src: "" }],
  poster: ""
})

const danmus = ref([])
const danmakuConfig = {
  channels: 5,
  autoplay: true,
  loop: true,
  speed: 5
}

const chartRef = ref(null)

onMounted(async () => {
  try {
    const videoResponse = await fetch(`/api/videos/${videoId}`)
    video.value = await videoResponse.json()
    playerOptions.value.sources[0].src = video.value.src
    playerOptions.value.poster = video.value.thumbnail

    const commentsResponse = await fetch(`/api/videos/${videoId}/comments`)
    comments.value = await commentsResponse.json()

    const danmusResponse = await fetch(`/api/videos/${videoId}/danmus`)
    danmus.value = await danmusResponse.json()

    initChart()
  } catch (error) {
    console.error('Error fetching video data:', error)
  }
})

const sendDanmaku = async (danmu) => {
  try {
    await fetch(`/api/videos/${videoId}/danmus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(danmu)
    })
  } catch (error) {
    console.error('Error sending danmaku:', error)
  }
}

const addComment = async () => {
  if (newComment.value.trim()) {
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.value })
      })
      const comment = await response.json()
      comments.value.push(comment)
      newComment.value = ''
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }
}

const initChart = () => {
  const chart = echarts.init(chartRef.value)
  const option = {
    title: { text: '视频统计' },
    tooltip: {},
    xAxis: { data: ['观看次数', '点赞', '评论'] },
    yAxis: {},
    series: [{
      name: '数量',
      type: 'bar',
      data: [video.value.views, video.value.likes, comments.value.length]
    }]
  }
  chart.setOption(option)
}
</script>

<style scoped>
.video-page {
  padding: 20px;
}
.video-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}
.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.chart-container {
  margin-top: 20px;
}
.comments-section {
  margin-top: 20px;
}
</style>

