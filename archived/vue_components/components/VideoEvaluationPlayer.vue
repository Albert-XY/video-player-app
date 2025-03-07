<template>
  <div class="video-evaluation-player">
    <div v-if="currentVideo" class="video-container">
      <video
        ref="videoPlayer"
        :src="currentVideo.src"
        @ended="videoEnded"
        controls
      ></video>
      <div class="video-controls">
        <el-button @click="playPause">{{ isPlaying ? '暂停' : '播放' }}</el-button>
        <el-button @click="replay">重播</el-button>
      </div>
    </div>

    <div v-if="showSAMScale" class="sam-scale">
      <h3>请为这个视频评分：</h3>
      <div class="scale-container">
        <div class="scale">
          <p>效价 (Valence)</p>
          <el-slider v-model="samRating.valence" :min="1" :max="9" :step="1" show-stops></el-slider>
        </div>
        <div class="scale">
          <p>唤醒度 (Arousal)</p>
          <el-slider v-model="samRating.arousal" :min="1" :max="9" :step="1" show-stops></el-slider>
        </div>
      </div>
      <el-button type="primary" @click="submitRating" :disabled="!isRatingComplete">确认</el-button>
    </div>

    <el-dialog v-model="showCompletionDialog" title="评估完成" width="30%">
      <span>您已完成所有可用视频的评估。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showCompletionDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElButton, ElSlider, ElDialog } from 'element-plus'

const videoPlayer = ref(null)
const currentVideo = ref(null)
const isPlaying = ref(false)
const showSAMScale = ref(false)
const showCompletionDialog = ref(false)

const samRating = ref({
  valence: 5,
  arousal: 5
})

const isRatingComplete = computed(() => {
  return samRating.value.valence !== 5 || samRating.value.arousal !== 5
})

onMounted(() => {
  loadNextVideo()
})

const loadNextVideo = async () => {
  try {
    const response = await fetch('/api/videos/next-unevaluated')
    const data = await response.json()
    if (data) {
      currentVideo.value = data
      showSAMScale.value = false
      samRating.value = { valence: 5, arousal: 5 }
    } else {
      showCompletionDialog.value = true
    }
  } catch (error) {
    console.error('Error loading next video:', error)
  }
}

const playPause = () => {
  if (videoPlayer.value.paused) {
    videoPlayer.value.play()
    isPlaying.value = true
  } else {
    videoPlayer.value.pause()
    isPlaying.value = false
  }
}

const replay = () => {
  videoPlayer.value.currentTime = 0
  videoPlayer.value.play()
  isPlaying.value = true
}

const videoEnded = () => {
  showSAMScale.value = true
  isPlaying.value = false
}

const submitRating = async () => {
  try {
    await fetch('/api/videos/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: currentVideo.value.id,
        valence: samRating.value.valence,
        arousal: samRating.value.arousal
      }),
    })
    loadNextVideo()
  } catch (error) {
    console.error('Error submitting rating:', error)
  }
}
</script>

<style scoped>
.video-evaluation-player {
  max-width: 800px;
  margin: 0 auto;
}

.video-container {
  margin-bottom: 20px;
}

video {
  width: 100%;
}

.video-controls {
  margin-top: 10px;
}

.sam-scale {
  margin-top: 20px;
}

.scale-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.scale {
  width: 45%;
}
</style>

