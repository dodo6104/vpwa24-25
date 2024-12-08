<template>
  <div class="q-pa-md chat-window" ref="chatWindow" @scroll="onScroll">
    <!-- Zobrazenie správ -->
    <div v-if="messages && messages.length > 0">
      <!-- Indikátor načítania pre staršie správy -->
      <div v-if="allLoaded" class="all-loaded-message">
        <p>All messages have been loaded.</p>
      </div>
      <div v-if="fetchingOlderMessages1" class="loading-indicator-top">
        <q-spinner color="white" size="100px" />
      </div>

      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'message',
          isMyMessage(message) ? 'message-right' : 'message-left',
          !isMyMessage(message) && amIPinned(message) ? 'highlighted' : ''
        ]"
      >
        <p class="nickname">{{ message.nickname }}</p>
        <p class="message-content">{{ message.content }}</p>
      </div>
    </div>

    <!-- Indikátor načítania pre celé okno -->
    <div v-else-if="loading" class="loading-indicator">
      <q-spinner color="white" size="100px" />
    </div>

    <!-- Uvítacia správa, keď nie sú žiadne správy -->
    <div v-else class="welcome-message">
      <p v-if="currentChannel">
        No messages in <strong>{{ currentChannel.name }}</strong>.
      </p>
      <p v-else>
        Welcome to FakeSlack!
      </p>
    </div>
  </div>
  <div class="typing-indicator">
    <p v-if="typingUsers.length > 0">
      <span v-for="user in typingUsers"
            :key="user.userId"
            class="typing-user">
        {{ user.nickname }}
        <div class="tooltip">
          <p>{{ user.nickname }}</p>
          <p>{{ user.message }}</p>
        </div>
      </span>
      <span v-if="typingUsers.length === 1"> is typing...</span>
      <span v-else-if="typingUsers.length > 1"> are typing...</span>
    </p>
  </div>
</template>

<script>
import websocket from 'src/services/websocket'

export default {
  data () {
    return {
      fetchingOlderMessages1: false,
      fetchingOlderMessages2: false,
      allLoaded: false,
      typingUsers: [],
      timers: {}
    }
  },
  props: {
    currentChannel: {
      type: Object,
      required: true
    },
    myUserId: {
      type: String,
      required: true
    },
    messages: {
      type: Array,
      default: () => []
    },
    loading: {
      // Stav načítania
      type: Boolean,
      default: false
    }
  },
  methods: {
    async onScroll () {
      const chatWindow = this.$refs.chatWindow

      if (chatWindow.scrollTop === 0 && !this.fetchingOlderMessages1) {
        this.fetchingOlderMessages1 = true
        this.fetchingOlderMessages2 = true
        const oldScrollHeight = chatWindow.scrollHeight
        const oldsize = this.messages.length
        await this.sleep(1000)
        this.$emit('more-messages', this.messages[0]?.id)
        if (oldsize === this.messages.length && this.allLoaded === false) {
          const newScrollHeight = chatWindow.scrollHeight
          chatWindow.scrollTop = newScrollHeight - oldScrollHeight
          this.allLoaded = true
        }
        this.fetchingOlderMessages1 = false
        await this.sleep(500)
        this.fetchingOlderMessages2 = false
        if (this.allLoaded === true) {
          await this.sleep(5000)
          this.allLoaded = false
        }
      }
    },
    isMyMessage (message) {
      return Number(this.myUserId) === Number(message.createdBy)
    },
    amIPinned (message) {
      for (let i = 0; i < message.pinnedUsers.length; i++) {
        if (Number(this.myUserId) === Number(message.pinnedUsers[i])) {
          return true
        }
      }
      return false
    },
    sleep (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    scrollToBottom () {
      const chatWindow = this.$refs.chatWindow
      const lastMessage = chatWindow?.querySelector('.message:last-child')

      if (chatWindow && lastMessage) {
        setTimeout(() => {
          const extraOffset = 20 // Dodatočný posun, aby správa bola viditeľná
          chatWindow.scrollTop =
            lastMessage.offsetTop + lastMessage.offsetHeight - chatWindow.clientHeight + extraOffset
        }, 20)
      }
    }
  },
  mounted () {
    this.scrollToBottom()
    websocket.on('typing', (data) => {
      if (Number(data.channelId) !== Number(this.currentChannel.id)) {
        return
      }
      if (!this.typingUsers.some((user) => user.userId === data.userId)) {
        this.typingUsers.push({ userId: data.userId, nickname: data.nickname, message: data.message })
      }

      if (this.timers[data.userId]) {
        clearTimeout(this.timers[data.userId])
        const index = this.typingUsers.findIndex((user) => user.userId === data.userId)
        this.typingUsers[index].message = data.message
      }

      this.timers[data.userId] = setTimeout(() => {
        const index = this.typingUsers.findIndex((user) => user.userId === data.userId)
        if (index !== -1) {
          this.typingUsers.splice(index, 1)
        }
        delete this.timers[data.userId]
      }, 1000)
    })
  },
  watch: {
    messages () {
      this.$nextTick(() => {
        if (this.fetchingOlderMessages2 === false) {
          this.scrollToBottom()
        }
      })
    }
  }
}
</script>

<style scoped>
.chat-window {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.message {
  max-width: 60%;
  margin: 5px 0;
  padding: 8px 12px;
  border-radius: 10px;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.message-right {
  background-color: #2465ff;
  align-self: flex-end;
  margin-left: auto;
  color: white;
  text-align: right;
}

.message-left {
  background-color: #ffffff;
  align-self: flex-start;
  margin-right: auto;
  color: black;
  text-align: left;
}

.message-left.highlighted {
  background-color: rgb(248, 108, 108);
}

.nickname {
  color: black;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 8px;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
}

/* Explicitné zarovnanie pre každú časť */
.message-right .nickname,
.message-right .message-content {
  text-align: right; /* Zarovnaj každú časť doprava */
}

.message-left .nickname,
.message-left .message-content {
  text-align: left; /* Zarovnaj každú časť doľava */
}

.welcome-message {
  color: white;
  text-align: center;
  font-size: 60px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading-indicator-top {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.all-loaded-message {
  color: white;
  text-align: center;
}

.typing-indicator {
  padding: 20px;
  background-color: None;
  color: white;
  font-size: 14px;
  display: flex;
}

.typing-user {
  position: relative;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  background-color: #3b3a3a;
  color: white;
  bottom: 100%; /* Tooltip sa zobrazí nad elementom */
  left: 200%; /* Tooltip je centrovaný horizontálne */
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s;
  z-index: 1;
  word-break: break-all;
  padding: 30px;
  width: 300px;
  max-height: 300px;
  overflow-y: auto; /* Povolenie scrollbaru pri pretečení obsahu */
  padding: 20px;
  font-size: 20px;
  border-radius: 25px;
  box-sizing: border-box;
  text-align: center;
}

.typing-user:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip::-webkit-scrollbar {
  width: 10px;
}

.tooltip::-webkit-scrollbar-thumb {
  background-color: white;
  border-radius: 4px;
}

.tooltip::-webkit-scrollbar-thumb:hover {
  background-color: white;
}
</style>
