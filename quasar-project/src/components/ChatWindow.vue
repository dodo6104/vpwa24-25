<template>
  <div v-if="messages.length != 0" class="q-pa-md chat-window" ref="chatWindow" @scroll="onScroll">
    <!-- Loading Indicator -->
    <div v-if="loadingOlderMessages" class="loading-indicator">
      <q-spinner color="white" size="60px" />
    </div>

    <!-- Messages -->
    <div
      v-for="(msg, index) in messages"
      :key="index"
      :class="messageClass(msg)"
    >
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

  <!-- Typing Indicator with hoverable name -->
  <div v-if="messages.length === 0" class="welcome-message">
    Welcome to FakeSlack
  </div>
  <div v-else class="typing-indicator">
    <span class="relative-container">
      <div v-if="isPopupVisible" class="hover-popup" ref="popup">
        <p><strong>Peter</strong></p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
          ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </span>
    <a
      href="#"
      @mouseover="showPopup"
      @mouseout="hidePopup"
      @click="clickPopup"
      class="clickable-name"
      ref="clickableName"
    >
      Peter
    </a>
    is typing<span class="dots"></span>
  </div>
</template>

<script>
export default {
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
    loadMoreMessages: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      loadingOlderMessages: false, // Loading flag
      oldScrollHeight: 0, // Store scroll height before loading more messages
      initialLoad: true, // Flag for detecting initial load of messages
      isPopupVisible: false, // Flag to control hover popup visibility
      isPopupClicked: false,
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

      // Trigger loading older messages when the user is near the top (within 30px)
      if (
        chatWindow.scrollTop <= 30 &&
        !this.loadingOlderMessages &&
        this.currentChannelId !== 0
      ) {
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
          this.$refs.chatWindow.scrollTop =
            this.$refs.chatWindow.scrollHeight - this.oldScrollHeight;
          this.loadingOlderMessages = false; // Reset loading flag
        });
      });
    },
    showPopup() {
      this.isPopupVisible = true;
    },
    hidePopup() {
      if (!this.isPopupClicked) {
        this.isPopupVisible = false;
      }
    },
    clickPopup() {
      this.isPopupClicked = !this.isPopupClicked;
    },
    handleOutsideClick(event) {
      const popupElement = this.$refs.popup; // Referencia na popup
      const clickableNameElement = this.$refs.clickableName; // Referencia na klikateľné meno

      // Ak klikneš mimo popup a mimo mena, skry popup
      if (
        popupElement &&
        !popupElement.contains(event.target) &&
        clickableNameElement &&
        !clickableNameElement.contains(event.target)
      ) {
        this.isPopupVisible = false;
        this.isPopupClicked = false;
      }
    },
  },
  watch: {
    messages: {
      handler() {
        if (this.initialLoad) {
          this.$nextTick(() => {
            this.scrollToBottom();
            this.initialLoad = false; // Prevent further automatic scrolling
          });
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.scrollToBottom();
    document.addEventListener('click', this.handleOutsideClick); // Pridaj listener pri mountovaní
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick); // Odstráň listener pri zničení komponentu
  },
};
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

.typing-indicator {
  color: white;
  text-align: left;
  padding: 10px;
  width: 400px;
  position: relative;
  border-radius: 25px;
}

.welcome-message {
  color: white;
  text-align: center;
  font-size: 60px; /* Zvýšiť veľkosť textu */
  padding: 20px;
  display: flex;
  justify-content: center; /* Centrovať horizontálne */
  align-items: center; /* Centrovať vertikálne */
  height: 100%; /* Zaberať celé okno */
}


.hover-popup {
  position: absolute;
  bottom: 20px; /* Posun nad meno */
  left: 0; /* Zarovnané s menom */
  max-width: 400px;
  max-height: 150px;
  width: auto;
  background-color: rgba(255, 255, 255, 0.85); /* Nepriehľadnosť */
  padding: 10px;
  color: black;
  z-index: 1000;
  overflow-y: auto;
  border-radius: 25px;
}

.relative-container {
  position: relative;
  display: flex;
  width: 400px;
  background: transparent;
}

.clickable-name {
  color: lightblue;
  cursor: pointer;
  text-decoration: none;
}

.clickable-name:hover {
  text-decoration: underline;
}

/* Pridaj, ak chceš nastaviť pevné zalomenie pre dlhšie slová */
.hover-popup p {
  margin: 0;
}

/* Dot animation for typing effect */
.dots::after {
  content: '.';
  animation: dots 1.5s steps(1, end) infinite;
}

@keyframes dots {
  0% {
    content: '.';
  }
  33% {
    content: '..';
  }
  66% {
    content: '...';
  }
  100% {
    content: '';
  }
}
</style>
