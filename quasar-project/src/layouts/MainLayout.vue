<template>
  <q-layout view="hHh LpR fFf" class="full-height-layout">
    <!-- Sidebar -->
    <AppSidebar
      :leftDrawerOpen="leftDrawerOpen"
      @update:leftDrawerOpen="leftDrawerOpen = $event"
      @switch-channel="handleChannelSwitch" />

    <!-- Main Content -->

    <q-page-container class="no-scroll main-content">
      <!-- Channel Section (Displays the messages) -->
      <div class="channel-header">
        <strong># Channel name</strong>
      </div>

      <div class="channel-section">
        <ChatWindow
          :messages="messages"
          :loadMoreMessages="loadMoreMessages"
        />
      </div>

      <!-- CommandLine Component (for sending messages) -->
      <CommandLine @send-message="handleSendMessage" class="commandline" />
    </q-page-container>

    <!-- Resize Observer for responsiveness -->
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
      currentChannelId: 0, // Track the current channel
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
          },
          {
            name: 'Sam',
            avatar: '',
            text: ['This is Channel 2 conversation.'],
            stamp: '3 minutes ago',
            bgColor: 'primary',
            textColor: 'white'
          },
          {
            name: 'me',
            avatar: '',
            text: ['Welcome to Channel 2!'],
            stamp: 'just now',
            sent: true,
            bgColor: 'amber-7'
          },
          {
            name: 'Sam',
            avatar: '',
            text: ['This is Channel 2 conversation.'],
            stamp: '3 minutes ago',
            bgColor: 'primary',
            textColor: 'white'
          },
          {
            name: 'me',
            avatar: '',
            text: ['Welcome to Channel 2!'],
            stamp: 'just now',
            sent: true,
            bgColor: 'amber-7'
          },
          {
            name: 'Sam',
            avatar: '',
            text: ['This is Channel 2 conversation.'],
            stamp: '3 minutes ago',
            bgColor: 'primary',
            textColor: 'white'
          },
          {
            name: 'me',
            avatar: '',
            text: ['Welcome to Channel 2!'],
            stamp: 'just now',
            sent: true,
            bgColor: 'amber-7'
          },
          {
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
    return this.currentChannelId === 0 ? [] : this.channelMessages[this.currentChannelId] || [];
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
    this.currentChannelId = channel.id;
  },
  async loadMoreMessages() {

// Check if the current channel is valid
if (this.currentChannelId === 0) {
  return Promise.resolve([]); // Return an empty array if no channel is selected
}

return new Promise((resolve) => {
  setTimeout(() => {
    const olderMessages = [
      {
        name: 'me',
        avatar: '',
        text: ['Simulating loading1'],
        stamp: '10 minutes ago',
        sent: true,
        bgColor: 'amber-7'
      },
      {
        name: 'Sam',
        avatar: '',
        text: ['loading 2'],
        stamp: '3 minutes ago',
        bgColor: 'primary',
        textColor: 'white'
      }
    ];

    // Ensure that the channel is still valid before prepending messages
    if (this.currentChannelId !== 0) {
      // Prepend the older messages to the current channel's messages
      this.channelMessages[this.currentChannelId] = [
        ...olderMessages,
        ...this.channelMessages[this.currentChannelId]
      ];
    }

    resolve(olderMessages);
  }, 1000);
});
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

.channel-header {
  font-size: 24px;
  font-weight: bold;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
}

.channel-section {
  flex-grow: 1;
  overflow: hidden;
}

.commandline {
  background-color: #f5f5f5;
  padding: 20px;
  border-top: 1px solid #ccc;
}
</style>
