<template>
  <!-- 全屏遮罩层：点击空白处可关闭 -->
  <div class="dj-overlay" @click.self="handleCancel" @keydown.esc="handleCancel">
    <!-- Dialog 卡片 -->
    <div class="dj-dialog-card">
      <!-- 标题栏 -->
      <div class="dj-dialog-header">
        <h2>🎉 Vue 3 自定义控件</h2>
        <span class="dj-close-btn" @click="handleCancel" title="关闭">✕</span>
      </div>

      <!-- 分隔线 -->
      <el-divider style="margin: 0;" />

      <!-- 内容区 -->
      <div class="dj-dialog-body">
        <!-- 成功标签 -->
        <div class="dj-success-banner">
          <el-tag type="success" size="large" effect="dark">升级成功</el-tag>
          <h1 class="dj-title">{{ message }}</h1>
        </div>

        <!-- 后端接口响应 -->
        <el-alert
          v-if="backendData"
          title="后端接口响应"
          type="success"
          :closable="false"
          show-icon
        >
          <p><strong>消息：</strong>{{ backendData.message }}</p>
          <p><strong>服务器时间：</strong>{{ backendData.serverTime }}</p>
          <p><strong>后端框架：</strong>{{ backendData.backend }}</p>
          <p><strong>前端框架：</strong>{{ backendData.framework }}</p>
        </el-alert>

        <el-alert
          v-if="!backendData && !loadError"
          title="正在连接后端..."
          type="warning"
          :closable="false"
          show-icon
        />

        <el-alert
          v-if="loadError"
          title="后端连接失败（开发模式正常现象）"
          type="info"
          :closable="false"
          show-icon
        >
          运行 <code>npx vite</code> 时可忽略，部署到 Seeyon 环境后正常连接。
        </el-alert>

        <!-- 技术栈信息 -->
        <el-alert
          title="技术栈"
          type="info"
          :closable="false"
          description="Vue 3 + Element Plus + Axios + Vite 4"
          show-icon
        />

        <!-- 环境信息 -->
        <div class="dj-info-panel">
          <p><strong>当前时间：</strong>{{ currentTime }}</p>
          <p><strong>渲染模式：</strong>全屏 iframe → Vue 自绘 Dialog</p>
          <p><strong>通信方式：</strong>window.parent.postMessage</p>
          <p><strong>致远 API：</strong>可通过 window.top 访问</p>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="dj-dialog-footer">
        <el-button type="primary" @click="handleOK" size="default">
          确定
        </el-button>
        <el-button @click="handleCancel" size="default">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// ---- 响应式状态 ----
const message = ref('你好，vue升级成功')
const currentTime = ref('')
const backendData = ref(null)
const loadError = ref(false)
let timer = null

// ---- 工具：获取致远上下文路径 ----
const getCtxPath = () => {
  return (window.top && window.top._ctxPath) || window._ctxPath || '/seeyon'
}

// ---- 工具：安全获取致远全局对象 ----
const getSeeyonAPI = () => {
  const top = window.top || window.parent || window
  return {
    $: top.$,
    csdk: top.csdk,
    cmp: top.cmp,
    ctxPath: top._ctxPath || '/seeyon',
    metaData: (top.csdk && top.csdk.core && top.csdk.core.getMetaData)
      ? top.csdk.core.getMetaData()
      : {}
  }
}

// ---- 更新时间 ----
const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// ---- 调用后端接口 ----
const fetchBackendHello = async () => {
  try {
    const ctxPath = getCtxPath()
    const { data } = await axios.get(ctxPath + '/djs/vueHello.do')
    if (data && data.success) {
      backendData.value = data
    }
  } catch (err) {
    console.warn('[DjVue] 后端接口调用失败（开发模式正常）:', err.message)
    loadError.value = true
  }
}

// ---- 注册 window.OK 供父窗口直接调用 ----
window.OK = () => ({
  valid: true,
  data: {
    message: message.value,
    timestamp: currentTime.value,
    backendMessage: backendData.value ? backendData.value.message : ''
  }
})

// ---- 发送消息给父窗口并关闭 ----
const postClose = (result) => {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'vueDialogClose', result }, '*')
  }
}

const handleOK = () => {
  postClose({
    valid: true,
    data: {
      message: message.value,
      timestamp: currentTime.value,
      backendMessage: backendData.value ? backendData.value.message : ''
    }
  })
}

const handleCancel = () => {
  postClose({ valid: false })
}

// ---- 生命周期 ----
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  fetchBackendHello()

  // 开发调试：检查致远全局环境
  try {
    const api = getSeeyonAPI()
    console.log('[DjVue] 致远环境检测:')
    console.log('  window.top._ctxPath:', api.ctxPath)
    console.log('  window.top.$:', typeof api.$)
    console.log('  window.top.csdk:', typeof api.csdk)
    console.log('  window.top.cmp:', typeof api.cmp)
  } catch (e) {
    console.log('[DjVue] 非致远环境（独立开发模式）')
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style>
/* ===== 全局重置（iframe 内独立样式，不污染父页面） ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
</style>

<style scoped>
/* ===== 全屏遮罩 ===== */
.dj-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  animation: fadeIn 0.2s ease-out;
}

/* ===== Dialog 卡片 ===== */
.dj-dialog-card {
  width: 580px;
  max-width: 92vw;
  max-height: 85vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

/* ===== 标题栏 ===== */
.dj-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-bottom: 1px solid #e4e7ed;
}

.dj-dialog-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.dj-close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #909399;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;
}

.dj-close-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #303133;
}

/* ===== 内容区（可滚动） ===== */
.dj-dialog-body {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
}

.dj-success-banner {
  text-align: center;
  padding: 20px 0 16px;
}

.dj-title {
  font-size: 26px;
  color: #67c23a;
  margin: 12px 0 0;
  animation: fadeInUp 0.6s ease-out;
}

.dj-info-panel {
  margin-top: 16px;
  padding: 14px 18px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.dj-info-panel p {
  margin: 6px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.dj-info-panel p strong {
  color: #303133;
}

.el-alert {
  margin-top: 14px;
}

/* ===== 底部按钮 ===== */
.dj-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 24px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
}

.dj-dialog-footer .el-button {
  min-width: 88px;
}

/* ===== 动画 ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
