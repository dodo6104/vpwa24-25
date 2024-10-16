<template>
  <q-layout view="hHh LpR fFf" class="full-height-layout" >
    <!-- Sidebar -->
    <AppSidebar
      :leftDrawerOpen="leftDrawerOpen"
      @update:leftDrawerOpen="leftDrawerOpen = $event"
      @switch-channel="handleChannelSwitch" />

    <!-- Main Content -->
    <q-page-container class="no-scroll main-content">

      <q-row class="channel-header justify-between">
        <q-col cols="auto">
          <span><q-icon :name="currentChannelTag" size="sm"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ currentChannelName}}</span>
        </q-col>

        <!-- Icon and Invite People on the right -->
        <q-col cols="auto" v-if="isInChannel()">
          <div class="row items-center justify-end">
            <q-btn class="add addButton" round icon="add" size="lg" color="dark" @click="addPeople" />
          </div>
        </q-col>
      </q-row>

      <!-- New Dialog Window for inviting -->
      <q-dialog v-model="isVisible">
        <q-card style="width: 500px; max-width: 90vw; background-color: #121212; border-radius: 8px; color: #ffffff;">
          <q-separator />
          <q-card-section>
            <div class="text-h6">Enter Nickname</div>
          </q-card-section>

          <q-card-section>
            <q-col class="q-mr-xl" cols="12">
              <q-input class="custom_input" v-model="nickname" label="Nickname" outlined dense :error="nicknameError" :error-message="nicknameErrorMessage">
                <template v-slot:append>
                  <q-icon v-if="nickname !== ''" name="close" @click="nickname = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </q-col>
          </q-card-section>

          <q-card-actions align="right" class="q-pt-md">
            <q-btn flat label="Cancel" color="white" @click="closeNicknameDialog" />
            <q-btn flat label="Submit" color="primary" class="text-weight-bold" @click="submitNickname" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div class="channel-section commandline-wrapper">
        <ChatWindow
          :messages="messages"
          :loadMoreMessages="loadMoreMessages"
        />

        <!-- CommandLine Component (for sending messages) -->
        <CommandLine @send-message="handleSendMessage" class="commandline" />
      </div>
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
      isVisible: false,
      leftDrawerOpen: true,
      isSmallScreen: false,
      nicknameError: false,
      nicknameErrorMessage: '',
      nickname: '',
      currentChannel: '',
      currentChannelId: 0,
      channelMessages: {
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
          }
        ]
      }
    };
  },
  computed: {
    messages() {
      return this.currentChannelId === 0 ? [] : this.channelMessages[this.currentChannelId] || [];
    },
    currentChannelTag(){
      return this.currentChannel && this.currentChannelId != 0 ? this.currentChannel.icon : '';
    },
    currentChannelName() {
      return this.currentChannel && this.currentChannel.id !== 0
        ? this.currentChannel.name
        : 'General';
    }
  },
  methods: {
    addPeople() {
      this.nicknameError = false;
      this.nicknameErrorMessage = '';
      this.isVisible = true;
    },
    closeNicknameDialog() {
      this.nicknameError = false;
      this.nicknameErrorMessage = '';
      this.isVisible = false;
      this.nickname = '';
    },
    submitNickname() {
      if (this.nickname.trim() !== '') {
        console.log('Nickname submitted:', this.nickname);
        this.isVisible = false;
        this.nickname = '';
        this.nicknameErrorMessage = '';
      } else {
        this.nicknameError = true;
        this.nicknameErrorMessage = 'Please fill in the nickname';
        console.warn('Nickname is required!');
      }
    },
    isInChannel() {
      return this.currentChannelId !== 0;
    },
    onResize({ width }) {
      this.isSmallScreen = width < 768;
      this.leftDrawerOpen = !this.isSmallScreen;
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
      this.currentChannel = channel;
      this.currentChannelId = channel.id;
      this.isVisible = false;
    },
    async loadMoreMessages() {
      if (this.currentChannelId === 0 || !this.channelMessages[this.currentChannelId]) {
        return Promise.resolve([]);
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          const olderMessages = [
            {
              name: 'me',
              avatar: '',
              text: ['Simulating loading older messages'],
              stamp: '10 minutes ago',
              sent: true,
              bgColor: 'amber-7'
            },
            {
              name: 'Sam',
              avatar: '',
              text: ['Simulated older message'],
              stamp: '3 minutes ago',
              bgColor: 'primary',
              textColor: 'white'
            }
          ];

          this.channelMessages[this.currentChannelId] = [
            ...olderMessages,
            ...this.channelMessages[this.currentChannelId]
          ];

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
.text {
  font-size: large;
  color: white;
}
.custom_input {
  color: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #555;
}
.full-height-layout {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
}
.main-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  background-color: black;
}
.channel-header {
  font-size: 24px;
  font-weight: bold;
  padding: 10px;
  background-color: black;
  color: #ffffff;
  display: flex;
  align-items: center;
  align-content: center;
  height: 9.5%;
  margin-left: 20px;
}
@media (max-width: 350px) {
  .channel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
.channel-section {
  flex-grow: 1;
  overflow: auto;
  padding: 20px;
  background-color: #121212;
  border-radius: 8px;
  margin: 30px;
  margin-top: 0px;
}
.commandline-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.commandline {
  background-color: white;
  border-top: 1px solid #444;
  border-radius: 8px;
  margin: 0;
}
</style>
