<template>
  <el-container>
    <el-header>
      <nav>
        <el-menu mode="horizontal" router>
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/videos">视频列表</el-menu-item>
          <el-menu-item index="/upload" v-if="isLoggedIn">上传视频</el-menu-item>
          <el-menu-item index="/login" v-if="!isLoggedIn">登录</el-menu-item>
          <el-menu-item index="/register" v-if="!isLoggedIn">注册</el-menu-item>
          <el-menu-item @click="logout" v-if="isLoggedIn">登出</el-menu-item>
        </el-menu>
      </nav>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
    <el-footer>© 2023 Video Player App</el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElContainer, ElHeader, ElMain, ElFooter, ElMenu, ElMenuItem } from 'element-plus'
import { useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const router = useRouter()

onMounted(() => {
  checkLoginStatus()
})

const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
}

const logout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  router.push('/')
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

