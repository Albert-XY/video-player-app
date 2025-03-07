<template>
  <div class="experimental-video-player">
    <video
      ref="videoPlayer"
      :src="currentVideo?.src"
      @ended="handleVideoEnd"
      v-show="isExperimentRunning"
    ></video>
    
    <div v-if="!isExperimentRunning && !isExperimentComplete" class="controls">
      <el-button @click="startExperiment" type="primary">开始实验</el-button>
    </div>
    
    <div v-if="isExperimentRunning" class="controls">
      <el-button @click="exitExperiment" type="danger">退出实验</el-button>
    </div>
    
    <el-dialog v-model="showUploadDialog" title="上传脑电数据" width="30%" :close-on-click-modal="false">
      <el-upload
        class="upload-demo"
        drag
        action="/api/upload-eeg"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
    </el-dialog>
    
    <el-dialog v-model="showResultDialog" title="实验结果" width="50%" :close-on-click-modal="false">
      <pre>{{ experimentResult }}</pre>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="finishExperiment">完成</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElButton, ElDialog, ElUpload } from 'element-plus'

const videoPlayer = ref(null)
const currentVideo = ref(null)
const isExperimentRunning = ref(false)
const isExperimentComplete = ref(false)
const showUploadDialog = ref(false)
const showResultDialog = ref(false)
const experimentResult = ref('')

const videos = ref([])
const videoTimings = ref([])
const currentVideoIndex = ref(0)

let waitTimer = null

onMounted(() => {
  fetchVideos()
})

onUnmounted(() => {
  clearTimeout(waitTimer)
})

const fetchVideos = async () => {
  try {
    const response = await fetch('/api/videos/experimental')
    videos.value = await response.json()
  } catch (error) {
    console.error('Error fetching videos:', error)
  }
}

const startExperiment = () => {
  isExperimentRunning.value = true
  currentVideoIndex.value = 0
  videoTimings.value = []
  playNextVideo()
}

const exitExperiment = () => {
  isExperimentRunning.value = false
  videoPlayer.value.pause()
  clearTimeout(waitTimer)
  // Data is discarded when exiting
}

const playNextVideo = () => {
  if (currentVideoIndex.value < 5) {
    currentVideo.value = videos.value[currentVideoIndex.value]
    const startTime = new Date().toISOString()
    videoTimings.value.push({ videoId: currentVideo.value.id, startTime })
    videoPlayer.value.play()
  } else {
    isExperimentRunning.value = false
    isExperimentComplete.value = true
    showUploadDialog.value = true
  }
}

const handleVideoEnd = () => {
  const endTime = new Date().toISOString()
  videoTimings.value[currentVideoIndex.value].endTime = endTime
  currentVideoIndex.value++
  
  waitTimer = setTimeout(() => {
    playNextVideo()
  }, 60000) // Wait for 1 minute
}

const handleUploadSuccess = async (response) => {
  showUploadDialog.value = false
  try {
    const result = await sendExperimentData(response.eegFileUrl)
    experimentResult.value = JSON.stringify(result, null, 2)
    showResultDialog.value = true
  } catch (error) {
    console.error('Error processing experiment data:', error)
  }
}

const handleUploadError = () => {
  console.error('Error uploading EEG file')
}

const sendExperimentData = async (eegFileUrl) => {
  const response = await fetch('/api/process-experiment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      videoTimings: videoTimings.value,
      eegFileUrl,
    }),
  })
  return await response.json()
}

const finishExperiment = () => {
  showResultDialog.value = false
  isExperimentComplete.value = false
  // Reset the experiment state
}
</script>

<style scoped>
.experimental-video-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

video {
  max-width: 100%;
  max-height: 70vh;
}

.controls {
  margin-top: 20px;
}
</style>

