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
      <q-row class="channel-header justify-between">
  <!-- Channel Name on the left -->
        <q-col cols="auto">
          <strong># Channel name</strong>
        </q-col>

        <!-- Icon and Invite People on the right -->
        <q-col cols="auto" v-if="isInChannel()">
          <div class="row items-center justify-end">
            <q-btn class="add addButton" round icon="add" size="sm" color="dark" @click="addPeople" />
            <span class="q-ml-sm text">Invite people</span>
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
            <q-col class="q-mr-xl" cols="4">
              <q-input class="custom_input" v-model="nickname" label="Nickname" outlined :dense="dense" :error="nicknameError" :error-message="nicknameErrorMessage">
                <template v-slot:append>
                  <q-icon v-if="nickname !== ''" name="close" @click="nickname = ''" class="cursor-pointer" />
                  <q-icon name="search" />
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
      isVisible: false,
      leftDrawerOpen: true,
      isSmallScreen: false,
      nicknameError:false,
      nicknameErrorMessage:'',
      nickname:'',
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
    addPeople(){
      this.nicknameError = false;
      this.nicknameErrorMessage = '';
      this.isVisible=true;
    },
    closeNicknameDialog() {
      this.errorMessage=false;
      this.nicknameErrorMessage = '';
      this.isVisible = false;
      this.nickname = '';
    },
    submitNickname() {
      // Handle nickname submission logic
      if (this.nickname.trim() !== '') {
        console.log('Nickname submitted:', this.nickname);
        this.isVisible = false;
        this.nickname = '';
        this.isVisible=false;
        this.nicknameErrorMessage = '';
      } else {
        this.nicknameError=true,
        this.nicknameErrorMessage='Please fill in the nickname'
        console.warn('Nickname is required!');
      }

    },
    isInChannel() {
      if (this.currentChannelId === 0) {
        return false;
      } else {
        return true;
      }
    },

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
    this.isVisible=false;
  },
  async loadMoreMessages() {
  // Check if the current channel is valid and has messages
  if (this.currentChannelId === 0 || !this.channelMessages[this.currentChannelId] || this.channelMessages[this.currentChannelId].length === 0) {
    return Promise.resolve([]); // Return an empty array if no channel is selected or channel has no messages
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

      // Prepend the older messages to the current channel's messages
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
  },


};
</script>

<style scoped>

.text{
  font-size: large;
  color: black;

}
.custom_input{
  background-color: white;
  color: black;
  padding: 4px;
  border-radius: 4px;
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

}

.channel-header {
  font-size: 24px;
  font-weight: bold;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;


}
@media (max-width: 350px) {
  .channel-header {
    flex-direction: column;
    align-items: flex-start;
  }
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
