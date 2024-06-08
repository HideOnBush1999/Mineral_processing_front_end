<template>
  <div class="qa-chat">
    <div class="chat-container">
      <div
        class="messages"
        ref="messagesContainer"
        :style="
          chatHistory.length === 0
            ? { backgroundImage: 'url(/chat_background-removebg-preview.png)' }
            : {}
        "
      >
        <div
          v-for="(message, index) in chatHistory"
          :key="index"
          class="message-container"
          :class="{
            'system-stream': message.type === 'system-stream',
            'system-http': message.type === 'system-http'
          }"
        >
          <img
            v-if="message.type === 'user'"
            src="/src/assets/user.jpg"
            alt="User Avatar"
            class="avatar"
          />
          <img
            v-if="message.type === 'system-http'"
            src="/src/assets/system.jpg"
            alt="System Avatar"
            class="avatar"
          />
          <div
            class="message"
            :class="{
              'user-message': message.type === 'user',
              'system-message':
                message.type === 'system-http' ||
                message.type === 'system-stream'
            }"
          >
            <strong>{{ message.type === "user" ? "USER" : "SYSTEM" }}:</strong>
            {{ message.content }}
          </div>
        </div>
      </div>
      <div class="input-container">
        <button
          :disabled="modelLoading"
          :class="{ 'model-button': true, 'model-active': modelActive }"
          @click="toggleModel"
        >
          <span v-if="modelLoading" class="loading-spinner" />
          <span v-else>{{ modelActive ? "关闭模型" : "创建模型" }}</span>
        </button>
        <textarea
          ref="textareaRef"
          v-model="userInput"
          @input="adjustTextareaHeight"
          @keyup.enter="sendMessage"
          placeholder="输入问题..."
        />
        <div class="button-container">
          <button @click="sendMessage">上传</button>
          <div v-if="isLoading" class="loading-spinner" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { chat, createModel, terminateModel } from "@/api/qa";
import io from "socket.io-client";
const streamingContent = ref("");

const userInput = ref("");
const chatHistory = ref([]);
const messagesContainer = ref(null);
const textareaRef = ref(null);
const isLoading = ref(false);
const modelActive = ref(false);
const modelLoading = ref(false);

// WebSocket 连接
const socket = io("http://127.0.0.1:5005/qa", {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("WebSocket connected");
});

socket.on("connect_error", error => {
  console.error("WebSocket connection error:", error);
});

const sendMessage = async () => {
  console.log(chatHistory.value);
  if (userInput.value.trim() === "") return;

  chatHistory.value.push({ content: userInput.value, type: "user" });

  isLoading.value = true;
  streamingContent.value = ""; // 重置流式内容

  try {
    const response = await chat({ prompt: userInput.value });
    chatHistory.value.push({ content: response.message, type: "system-http" });

    await nextTick();
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;

    // 监听 WebSocket 中的 chat_response 事件
    socket.on("chat_response", (data: { content: string }) => {
      if (data.content === "#finish#") {
        // 当前会话结束，后端会发送 #finish#
        console.log("Chat response complete");
        socket.off("chat_response"); // 移除 'chat_response' 事件的监听器
        socket.off("chat_response_complete"); // 移除 'chat_response_complete' 事件的监听器
      } else {
        console.log("Chat response:", data.content);
        streamingContent.value += data.content;

        // 找到最后一个 system-stream 类型的消息并更新它
        if (
          chatHistory.value.length > 0 &&
          chatHistory.value[chatHistory.value.length - 1].type ===
            "system-stream"
        ) {
          chatHistory.value[chatHistory.value.length - 1].content =
            streamingContent.value;
        } else {
          chatHistory.value.push({
            content: streamingContent.value,
            type: "system-stream"
          });
        }
      }

      nextTick().then(() => {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      });
    });

    // 监听 WebSocket 中的 chat_response_complete 事件
    // chat_response_complete 事件只有在后端异常时才会触发
    socket.on("chat_response_complete", (data: { full_response: string }) => {
      console.log("Chat response complete:", data.full_response);
      socket.off("chat_response");
      socket.off("chat_response_complete");
    });
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    isLoading.value = false;
  }

  userInput.value = "";
  textareaRef.value.style.height = "auto";
};

const adjustTextareaHeight = () => {
  textareaRef.value.style.height = "auto";
  textareaRef.value.style.height =
    Math.min(textareaRef.value.scrollHeight, 3 * 24) + "px";
};

const toggleModel = async () => {
  modelLoading.value = true;

  try {
    if (modelActive.value) {
      await terminateModel();
      modelActive.value = false;
    } else {
      await createModel();
      modelActive.value = true;
    }
  } catch (error) {
    alert(`操作失败: ${error.message}`);
  } finally {
    modelLoading.value = false;
  }
};

onMounted(() => {
  messagesContainer.value = document.querySelector(".messages");
});
</script>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.qa-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 60px; /* 调整这个值以适应输入框的高度 */
}

.messages {
  flex-grow: 1;
  height: calc(100vh - 200px); /* 根据实际情况调整 */
  padding: 10px;
  overflow-y: auto;
  background-repeat: no-repeat; /* 防止背景图片重复 */
  background-position: center; /* 将背景图片居中 */
  background-size: 36%; /* 将背景图片缩小到原来的50% */
}

.message-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.message {
  max-width: 70%;
  padding: 5px;
  word-wrap: break-word;
  border-radius: 5px;
}

.user-message {
  background-color: #add8e6;
}

.system-message {
  background-color: #b0e0e6;
}

.system-stream {
  justify-content: flex-start;
  margin-left: 48px;
}

.system-http {
  justify-content: flex-start;
}

.input-container {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background-color: white;
  box-shadow: 0 -2px 5px rgb(0 0 0 / 10%);
}

textarea {
  width: 60%;
  padding: 5px 10px;
  margin-right: 10px;
  overflow-y: auto;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 5px 10px;
  color: white;
  cursor: pointer;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
}

button:hover {
  background-color: #0056b3;
}

.button-container {
  display: flex;
  align-items: center;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border: 2px solid #f3f3f3; /* Light grey */
  border-top: 2px solid #3498db; /* Blue */
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.model-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  margin-right: 10px;
  color: white;
  cursor: pointer;
  background-color: #ccc;
  border: none;
  border-radius: 5px;
}

.model-active {
  background-color: #007bff;
}

.avatar {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 50%;
}
</style>
