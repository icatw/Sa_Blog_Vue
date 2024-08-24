<template>
  <div id="app">
    <div class="chat-container">

      <!-- 添加标题和选择框 -->
      <div class="header-container">
        <el-header>
          <h2 class="gradient-text">欢迎使用AI小助手，有任何问题都可以向我提问喔~</h2>
          <!-- 添加带有提示的图标 -->
          <el-tooltip class="item" effect="dark" content="该AI对话功能调用通义请问API，具体请参考官网......" placement="top"
                      style="margin-left: 10px;">
            <el-icon class="el-icon-question"></el-icon>
          </el-tooltip>
        </el-header>

        <!-- 模型选择 -->
        <div class="model-select">
          <label for="model">选择模型: </label>
          <el-select v-model="selectedModel" disabled @change="updateUrl" id="model">
            <!--            <el-option label="文心一言4.0" value="ErnieBot"></el-option>-->
            <el-option label="通义千问" value="通义千问"></el-option>
<!--            <el-option label="文心一言-Turbo" value="ErnieBot-Turbo"></el-option>-->
<!--            <el-option label="文心一言3.5" value="BloomZ-7B"></el-option>-->
          </el-select>
        </div>
      </div>

      <div class="chat-box">
        <!-- Display Messages -->
        <el-scrollbar wrap-class="message-list">
          <el-card v-for="message in messages" :key="message.id" class="message-card">
            <template #header>
              <img v-if="message.isUser" class="avatar" :src="avatar"/>
              <img v-else class="avatar" src="../../assets/bot.png"/>
            </template>
            <div class="message-content" v-html="parseMarkdown(message.text)"/>
          </el-card>
        </el-scrollbar>
      </div>

      <!-- Input Box -->
      <div class="input-container">
        <el-input
            v-model="newMessage"
            @keydown.native="handleKeyDown"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            placeholder="请输入消息...（可通过Alt+回车换行）"
            :class="{'focused': isInputFocused}"
            class="input-height"
            :rows="5"
            type="textarea"
        />
        <el-button
            :loading="isSending"
            @click="sendMessage"
            type="primary"
            size="mini"
            class="send-button"
            icon="el-icon-position"
        >
          <!--          发送-->
        </el-button>
      </div>

    </div>
  </div>
</template>

<script>
import hljs from "highlight.js";
import {fetchEventSource} from '@microsoft/fetch-event-source';
import Clipboard from "clipboard";
import tocbot from "tocbot";
// const MarkdownIt = require('@alias/markdown-it');
// import { ElSelect, ElOption, ElButton, ElInput, ElLoading } from 'element-plus';

export default {
  components: {
    // ElSelect,
    // ElOption,
    // ElButton,
    // ElInput,
    // ElLoading,
  },
  destroyed() {
    this.clipboard.destroy();
  },
  data() {
    return {
      avatar: this.$store.state.avatar ? this.$store.state.avatar : this.$store.state.blogInfo.websiteConfig.touristAvatar,
      AI_avatar: this.$store.state.avatar ? this.$store.state.avatar : this.$store.state.blogInfo.websiteConfig.touristAvatar,
      messages: [
        {
          id: 1,
          text: "您好，我是您的专属AI小助手，有什么可以帮助您的吗？",
        }
      ],
      clipboard: null,
      newMessage: '',
      // selectedModel: 'ErnieBot-Turbo',
      selectedModel: '通义千问',
      apiUrl: '/api/ai/send',
      isInputFocused: false,
      isSending: false,
      eventSource: null, // 用于存储EventSource实例
      isReceiving: false, // 标志当前是否正在接收数据
      currentMessage: null, // 用于保存当前显示的消息对象
      userId: this.$store.state.userId ? this.$store.state.avatar : Math.floor(Math.random() * 900000) + 100000,
    };
  },

  methods: {
    parseMarkdown(text) {
      const MarkdownIt = require("markdown-it");
      const hljs = require("highlight.js");
      const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
          // 当前时间加随机数生成唯一的id标识
          var d = new Date().getTime();
          if (
              window.performance &&
              typeof window.performance.now === "function"
          ) {
            d += performance.now();
          }
          const codeIndex = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
              /[xy]/g,
              function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
              }
          );
          // 复制功能主要使用的是 clipboard.js
          let html = `<button class="copy-btn iconfont iconfuzhi" type="button" data-clipboard-action="copy" data-clipboard-target="#copy${codeIndex}"></button>`;
          const linesLength = str.split(/\n/).length - 1;
          // 生成行号
          let linesNum = '<span aria-hidden="true" class="line-numbers-rows">';
          for (let index = 0; index < linesLength; index++) {
            linesNum = linesNum + "<span></span>";
          }
          linesNum += "</span>";
          if (lang && hljs.getLanguage(lang)) {
            // highlight.js 高亮代码
            const preCode = hljs.highlight(lang, str, true).value;
            html = html + preCode;
            if (linesLength) {
              html += '<b class="name">' + lang + "</b>";
            }
            // 将代码包裹在 textarea 中，由于防止textarea渲染出现问题，这里将 "<" 用 "<" 代替，不影响复制功能
            return `<pre class="hljs"><code>${html}</code>${linesNum}</pre><textarea style="position: absolute;top: -9999px;left: -9999px;z-index: -9999;" id="copy${codeIndex}">${str.replace(
                /<\/textarea>/g,
                "</textarea>"
            )}</textarea>`;
          }
        }
      });
      // 将markdown替换为html标签
      const html = md.render(text);
      // 添加代码复制功能
      this.$nextTick(() => {
        // 添加代码复制功能
        this.clipboard = new Clipboard(".copy-btn");
        this.clipboard.on("success", () => {
          this.$toast({type: "success", message: "复制成功"});
        });
      });
      return html
    },

    updateUrl() {
      if (this.selectedModel === 'ErnieBot') {
        this.apiUrl = '/api/wenxin/ernie/param/chats';
      } else if (this.selectedModel === 'ErnieBot-Turbo') {
        this.apiUrl = '/api/wenxin/turbo/param/chats';
      } else if (this.selectedModel === 'BloomZ-7B') {
        this.apiUrl = '/api/wenxin/bloomz7b/param/chats';
      }
    },

    // 逐字显示效果
    /*addTypingEffect(messageId, text) {
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < text.length) {
          // 查找对应的消息对象并更新其内容
          const message = this.messages.find(m => m.id === messageId);
          if (message) {
            message.text += text[index++];
          }
        } else {
          clearInterval(typingInterval);
        }
      }, 50); // 控制打字机速度
    },*/

    async sendMessage() {
      if (!this.newMessage.trim()) return;
      // 判断登录
      if (!this.$store.state.userId) {
        this.$store.state.loginFlag = true;
        return false;
      }
      this.isSending = true;

      const newMsg = {
        id: Date.now(),
        text: this.newMessage,
        isUser: true,
      };

      this.messages.push(newMsg);

      try {
        await this.startSSE(newMsg.text, newMsg.id);
      } catch (error) {
        console.error("发送消息失败", error);
        this.$message.error("发送消息失败，请重试");
      } finally {
        this.newMessage = '';
        this.isSending = false;
      }
    },

    async startSSE(message, messageId) {
      this.isReceiving = true;

      const responseMsg = {
        id: Date.now() + 1,
        text: '',
        isAssistant: true,
      };

      this.messages.push(responseMsg);

      this.$nextTick(() => {
        const container = this.$el.querySelector('.chat-box');
        container.scrollTop = container.scrollHeight;
      });

      try {
        await fetchEventSource('http://localhost:8080/ai/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: this.userId,
            message: message,
          }),
          onopen: (response) => {
            if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
              console.log("SSE连接已打开");
            } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
              console.error("SSE连接失败", response.status);
            }
          },
          onmessage: (event) => {
            const data = event.data;
            if (data) {
              console.log("接收到消息", data);
              const parts = data.split(' ');
              const sequenceNumber = parseInt(parts[1], 10);
              const text = parts.slice(2).join(' ');

              // 根据序列号排序消息
              this.addMessageWithSequence(responseMsg.id, text, sequenceNumber);
            }
          },
          onerror: (err) => {
            console.error("SSE连接错误", err);
            this.isReceiving = false;
          },
          onclose: () => {
            console.log("SSE连接已关闭");
            this.isReceiving = false;
          }
        });
      } catch (error) {
        console.error("连接SSE失败", error);
        this.isReceiving = false;
      }
    },

    addMessageWithSequence(messageId, text, sequenceNumber) {
      let message = this.messages.find(m => m.id === messageId);
      if (message) {
        let sortedMessages = this.messages.slice().sort((a, b) => {
          return a.sequenceNumber - b.sequenceNumber;
        });
        let index = sortedMessages.findIndex(m => m.id === messageId);
        console.log("Before update:", message.text); // 打印更新前的内容
        message.text += text;
        console.log("After update:", message.text); // 打印更新后的内容
        sortedMessages[index] = message;
        this.$nextTick(() => {
          const container = this.$el.querySelector('.chat-box');
          container.scrollTop = container.scrollHeight;
        });
      }
    },

// 逐字显示效果
    addTypingEffect(messageId, text) {
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < text.length) {
          // 查找对应的消息对象并更新其内容
          const message = this.messages.find(m => m.id === messageId);
          if (message) {
            console.log(message);
            message.text += text[index++];
            this.addMessageWithSequence(messageId, message.text, message.sequenceNumber);
          } else {
            clearInterval(typingInterval);
          }
        } else {
          clearInterval(typingInterval);
        }
      }, 50); // 控制打字机速度
    },
    handleKeyDown(event) {
      if (event.key === 'Enter' && !event.altKey) {
        event.preventDefault();
        this.sendMessage();
      } else if (event.key === 'Enter' && event.altKey) {
        this.newMessage += '\n';
      }
    },
  }
  ,
  beforeDestroy() {
    if (this.eventSource) {
      this.eventSource.close(); // 关闭SSE连接
    }
  }

}
;
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(90deg, rgba(247, 149, 51, 1) 0, rgba(243, 112, 85, 1) 15%, rgba(239, 78, 123, 1) 30%, rgba(161, 102, 171, 1) 44%, rgba(80, 115, 184, 1) 58%, rgba(16, 152, 173, 1) 72%, rgba(7, 179, 155, 1) 86%, rgba(109, 186, 130, 1) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chat-container {
  max-width: 1080px;
  margin: 30px auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 85vh;
  background-color: #fff;
  justify-content: space-between;
}

.el-card__body {
  padding: 10px;
}

::v-deep .el-textarea__inner {
  resize: none !important;
}

.chat-box {
  flex: 1;
  overflow-y: auto;
}

.input-container {
  display: flex;
  //align-items: center;
  position: relative; /* 设置为相对定位 */
}

.message-list {
  max-height: calc(90vh - 100px);
  padding: 10px;
  box-sizing: border-box;
}

.message-card {
  margin-bottom: 10px;
  padding: 1px;
  width: 99%;
}

.model-select {
  margin-bottom: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  margin-right: 10px;
}

.message-card::v-deep .el-card__header {
  padding-top: 7px;
  padding-bottom: 5px;
  padding-left: 7px;
}

.input-height {
  //width: 100%;
  font-size: 14px;
  border-radius: 10px;
  align-items: center;
}

.send-button {
  min-height: 20px;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  position: absolute; /* 设置为绝对定位 */
  right: 0; /* 放在右边 */
  bottom: 0; /* 放在底部 */
}

.header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.el-header {
  display: flex;
  align-items: center;
  justify-content: center;
}


</style>