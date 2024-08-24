<template>
  <div :class="['message-row', message.role === 'user' ? 'right' : 'left']">
    <div class="row" :class="message.role === 'user' ? 'right-row' : 'left-row'">
      <div class="avatar-wrapper">
        <el-avatar v-if="message.role === 'user'" :src="avatar" class="avatar" shape="square" />
        <el-avatar v-else :src="logo" class="avatar" shape="square" />
      </div>
      <div class="message" :style="{
              backgroundColor: message.role === 'user' ? 'rgb(231, 248, 255)' : '#f4f4f5',
              maxHeight: message.role === 'user' ? '300px' : 'none' // 设置用户消息框的最大高度
            }">
        <v-md-preview
            v-if="message.content"
            :key="'preview-only'"
            :text="message.content"
        ></v-md-preview>
        <TextLoading v-else></TextLoading>
      </div>
    </div>
  </div>
</template>

<script>
import logo from '../../assets/logo.jpg'
import TextLoading from "./TextLoading.vue";

export default {
  props: {
    message: { type: Object, required: true },
    avatar: { type: String, default: 'https://www.jarcheng.top/images/logo.jpg' }
  },
  components: {
    TextLoading
  },
  data() {
    return {
      logo
    }
  }
}
</script>

<style lang="scss" scoped>
.message-row {
  display: flex;

  &.right {
    justify-content: flex-end;
  }

  &.left {
    justify-content: flex-start;
  }

  .row {
    display: flex;
    align-items: flex-start; /* 调整消息行的垂直对齐方式 */

    .avatar-wrapper {
      margin-right: 10px; /* 调整头像与消息之间的间距 */
      margin-left: 10px; /* 调整头像与消息之间的间距 */
    }

    .message {
      font-size: 15px;
      padding: 10px;
      max-width: 500px;
      overflow-y: auto;
      border-radius: 7px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 20px 20px 20px 1px rgba(0, 0, 0, 0.01);

      &:last-child {
        margin-bottom: 35px; /* 调整消息之间的间距 */
      }
    }
  }

  &.right {
    .row {
      flex-direction: row-reverse; /* 用户消息从右往左排列 */
    }
  }

  &.left {
    .row {
      flex-direction: row; /* AI回答从左往右排列 */
    }
  }

}
/* 调整markdown组件的一些样式 */
:deep(.v-md-editor-preview) {
  padding: 0 10px;

  .vuepress-markdown-body p {
    line-height: unset;
  }
}
</style>
