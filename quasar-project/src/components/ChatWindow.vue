<template>
  <div class="q-pa-md chat-window" ref="chatWindow" @scroll="onScroll">
    <!-- Loading Indicator -->
    <div v-if="loadingOlderMessages" class="loading-indicator">
      <q-spinner-dots color="primary" size="30px" />
      Loading older messages...
    </div>

    <!-- Messages -->
    <div v-for="(msg, index) in messages" :key="index" :class="messageClass(msg)">
      <q-chat-message
        :name="msg.name"
        :avatar="msg.avatar"
        :text="msg.text"
        :stamp="msg.stamp"
        :bg-color="msg.bgColor"
        :text-color="msg.textColor"
        :sent="msg.sent"
        class="full-width-message"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    loadMoreMessages: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      loadingOlderMessages: false, // Loading flag
      oldScrollHeight: 0 // Store scroll height before loading more messages
    };
  },
  methods: {
    messageClass(msg) {
      return msg.sent ? 'message-right' : 'message-left';
    },
    scrollToBottom() {
      const chatWindow = this.$refs.chatWindow;
      if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    },
    onScroll() {
      const chatWindow = this.$refs.chatWindow;

      // Trigger loading older messages when the user is near the top (within 20px)
      if (chatWindow.scrollTop <= 10 && !this.loadingOlderMessages && this.currentChannelId !== 0) {
        this.loadOlderMessages();
      }

    },
    loadOlderMessages() {
      this.loadingOlderMessages = true; 
      this.oldScrollHeight = this.$refs.chatWindow.scrollHeight;

      // Call the parent method to load more messages
      this.loadMoreMessages().then(() => {
        this.$nextTick(() => {
          // Maintain scroll position after loading older messages
          this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight - this.oldScrollHeight;
          this.loadingOlderMessages = false; // Reset loading flag
        });
      });
    }
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    }
  },
  mounted() {
    this.scrollToBottom();
  }
};
</script>

<style scoped>
.chat-window {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  background-color: #fff;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chat-window::-webkit-scrollbar {
  display: none;
}

.full-width-message {
  width: 45%;
}

.message-right {
  display: flex;
  justify-content: flex-end;
}

.message-left {
  display: flex;
  justify-content: flex-start;
}


.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}
</style>

