<template>
  <q-layout view="hHh LpR fFf" class="full-height-layout">
    <!-- Hlavička -->
    <q-header elevated>
      <q-toolbar>
        <!-- Skry tento button na veľkých obrazovkách -->
        <q-btn v-if="isSmallScreen" flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>
          Fake Slack
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Bočný panel (Sidebar) -->
    <AppSidebar
      :leftDrawerOpen="leftDrawerOpen"
      @update:leftDrawerOpen="leftDrawerOpen = $event"
      @switch-channel="handleChannelSwitch" />

    <!-- Hlavná obsahová časť -->
    <q-page-container class="no-scroll main-content">
      <!-- Sekcia pre kanál (Channel) -->
      <div class="channel-section">
        <ChatWindow :messages="messages" />
      </div>

      <!-- Komponent CommandLine -->
      <CommandLine @send-message="handleSendMessage" class="commandline" />
    </q-page-container>

    <!-- Observer na veľkosť okna -->
    <q-resize-observer @resize="onResize" />
  </q-layout>
</template>


<script>
import AppSidebar from 'components/AppSidebar.vue';
import CommandLine from 'components/CommandLine.vue';
import ChatWindow from 'components/ChatWindow.vue';

export default {
  components: {
    AppSidebar,
    CommandLine,
    ChatWindow
  },
  data() {
    return {
      leftDrawerOpen: true,
      isSmallScreen: false,
      currentChannelId: 1, // Track the current channel
      channelMessages: { // Store messages for each channel
        1: [
          {
            name: 'me',
            avatar: '',
            text: ['Welcome to Channel 1!'],
            stamp: 'just now',
            sent: true,
            bgColor: 'amber-7'
          },
          {
            name: 'Alex',
            avatar: '',
            text: ['This is Channel 1 conversation.'],
            stamp: '5 minutes ago',
            bgColor: 'primary',
            textColor: 'white'
          }
        ],
        2: [
          {
            name: 'me',
            avatar: '',
            text: ['Welcome to Channel 2!'],
            stamp: 'just now',
            sent: true,
            bgColor: 'amber-7'
          }, {
            name: 'Sam',
            avatar: '',
            text: ['This is Channel 2 conversation.'],
            stamp: '3 minutes ago',
            bgColor: 'primary',
            textColor: 'white'
          }
        ]
      }
    };
  },
  computed: {
    messages() {
      // Return the messages for the current channel
      return this.channelMessages[this.currentChannelId] || [];
    }
  },
  methods: {
    onResize({ width }) {
      if (width < 768) {
        this.isSmallScreen = true;
        this.leftDrawerOpen = false;
      } else {
        this.isSmallScreen = false;
        this.leftDrawerOpen = true;
      }
    },
    handleSendMessage(message) {
      // Push the new message to the current channel's messages
      const newMessage = {
        name: 'me',
        avatar: '',
        text: [message],
        stamp: 'just now',
        sent: true,
        bgColor: 'amber-7'
      };

      if (!this.channelMessages[this.currentChannelId]) {
        this.$set(this.channelMessages, this.currentChannelId, []);
      }

      this.channelMessages[this.currentChannelId].push(newMessage);
    },
    handleChannelSwitch(channel) {
      // Switch to the selected channel
      this.currentChannelId = channel.id;
    }
  },
  mounted() {
    this.onResize({ width: window.innerWidth });
  }
};
</script>



<style scoped>
.full-height-layout {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.channel-section {
  flex-grow: 1;
  overflow: hidden;
}

.commandline {
  background-color: #f5f5f5;
  padding: 10px;
  border-top: 1px solid #ccc;
}
</style>
