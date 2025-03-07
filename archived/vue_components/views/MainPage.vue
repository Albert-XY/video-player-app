<template>
  <div class="main-page">
    <h1>欢迎来到视频播放器应用</h1>
    <el-row :gutter="20">
      <el-col :span="8" v-for="video in featuredVideos" :key="video.id">
        <el-card :body-style="{ padding: '0px' }">
          <img :src="video.thumbnail" class="image">
          <div style="padding: 14px;">
            <span>{{ video.title }}</span>
            <div class="bottom">
              <el-button text class="button" @click="watchVideo(video.id)">观看视频</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElRow, ElCol, ElCard, ElButton } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const featuredVideos = ref([])

onMounted(async () => {
  try {
    const response = await fetch('/api/videos/featured')
    featuredVideos.value = await response.json()
  } catch (error) {
    console.error('Error fetching featured videos:', error)
  }
})

const watchVideo = (id: string) => {
  router.push(`/video/${id}`)
}
</script>

<style scoped>
.main-page {
  padding: 20px;
}
.image {
  width: 100%;
  display: block;
}
.bottom {
  margin-top: 13px;
  line-height: 12px;
}
.button {
  padding: 0;
  float: right;
}
</style>

