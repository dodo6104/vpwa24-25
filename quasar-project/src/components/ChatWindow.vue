<template>
  <div class="q-pa-md chat-window" ref="chatWindow">
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
    }
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
  width: 100%;
}

.message-right {
  display: flex;
  justify-content: flex-end;
}

.message-left {
  display: flex;
  justify-content: flex-start;
}
</style>
