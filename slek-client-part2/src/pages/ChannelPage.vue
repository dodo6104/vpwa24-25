<template>
  <q-layout view="hHh LpR fFf" class="full-height-layout">
    <!-- Sidebar -->
    <AppSidebar
      :leftDrawerOpen="leftDrawerOpen"
      @update:leftDrawerOpen="leftDrawerOpen = $event"
      @switch-channel="handleChannelSwitch"
      class="appside drawer-bg full-height"
      persistent
      ref="child"
      @send-data="handleChannels"
      @showNotification="showNotification"
    />

    <!-- Main Content -->
    <q-page-container class="no-scroll main-content">
      <q-row class="channel-header justify-between">
        <q-col cols="auto">
          <span>
            <q-icon
              :name="currentChannelTag"
              size="sm"
            />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ currentChannelName }}
          </span>
        </q-col>

        <!-- Icon and Invite People on the right -->
        <q-col cols="auto" v-if="isInChannel()">
          <div class="row items-center justify-end">
            <q-btn
              class="add addButton"
              round
              icon="add"
              size="lg"
              color="dark"
              @click="showAddPeopleDialog"
            />
          </div>
        </q-col>
      </q-row>

      <!-- Main Chat Section -->
      <div class="channel-section commandline-wrapper">
          <ChatWindow @more-messages="loadMessages" :key="currentChannelId" :messages="messages" :myUserId="myUserId" :currentChannel="currentChannel" ref="chatWindow"/>
        <!-- CommandLine Component (for sending messages) -->
        <CommandLine class="commandline" @send-message="handleSendMessage"  @typing = "handleTyping" :currentChannel = "currentChannel" :listOfMembers = "listOfMembers"/>
      </div>
    </q-page-container>

    <!-- Add People Dialog -->
    <q-dialog v-model="addPeopleDialogVisible">
      <q-card class="add-people-dialog">
        <q-card-section>
          <div class="text-h6 text-white">Add People</div>
        </q-card-section>

        <q-card-section>
          <q-input
            filled
            v-model="newPersonName"
            @keyup.enter="submitNickname"
            label="Enter name"
            :error="nicknameError"
            :error-message="nicknameErrorMessage"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeAddPeopleDialog" />
          <q-btn flat label="Add" color="primary" @click="submitNickname" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-resize-observer @resize="onResize" />
  </q-layout>
</template>

<script>
import AppSidebar from 'components/AppSidebar.vue'
import CommandLine from 'components/CommandLine.vue'
import ChatWindow from 'components/ChatWindow.vue'
import websocket from 'src/services/websocket'
import { AppVisibility } from 'quasar'
import { ref, onMounted, onUnmounted } from 'vue'

import { isAppVisible, watchVisibility } from 'src/helpers/appVisibilityHelper'

export default {
  components: {
    AppSidebar,
    CommandLine,
    ChatWindow
  },
  setup () {
    const isHere = ref(isAppVisible())

    const handleVisibilityChange = (visible) => {
      console.log('Stav viditeľnosti sa zmenil:', visible)
      isHere.value = visible
      if (visible) {
        this.notificationQueue.forEach((data) => {
          this.showNotification(data)
        })
        // Vymaž frontu
        this.notificationQueue = []
      }
    }

    let stopWatching

    onMounted(() => {
      stopWatching = watchVisibility(handleVisibilityChange)
    })

    onUnmounted(() => {
      if (stopWatching) {
        stopWatching()
      }
    })

    return { isHere }
  },
  data () {
    return {
      listOfMembers: [],
      notificationQueue: [],
      isVisible: false,
      leftDrawerOpen: true,
      isSmallScreen: false,
      nicknameError: false,
      nicknameErrorMessage: '',
      newPersonName: '',
      addPeopleDialogVisible: false,
      currentChannel: null,
      currentChannelId: 0,
      messages: [],
      channelMessages: {},
      myUserId: localStorage.getItem('userid'),
      channels: []
    }
  },
  mounted () {
    websocket.connect(localStorage.getItem('userid'))
    this.$websocket.on('refresh', () => {
      websocket.emit('reload_channels', {
        userId: localStorage.getItem('userid')
      })
      this.handleChannelSwitch(null)
    })
    this.loadMessages().then(() => {
      websocket.on('message', (data) => {
        const visible = isAppVisible()
        if (data.channelId === this.currentChannelId) {
          this.messages.push(data)
        } else {
          const shortenedContent = data.content.length > 10
            ? data.content.substring(0, 10) + '...'
            : data.content

          console.log('New message in channel:', data)
          const notification = {
            icon: 'announcement',
            message: `
          <strong>New Message in ${data.channelName}</strong>
          <br>Sent by: <em>${data.nickname}</em><br><p>Message: ${shortenedContent}</p>`,
            position: 'top',
            timeout: 5000,
            html: true,
            color: 'green',
            onClick: () => {
              this.openChannel(data.channelId)
              this.$refs.chatWindow.scrollToBottom()
            }
          }

          if (!visible) {
            this.sendMessageNotf(data.nickname, data.channelName, data.content)
            this.notificationQueue.push(notification)
          } else {
            this.$q.notify(notification)
          }
        }

        websocket.emit('update_channel', {
          channelId: data.channelId,
          userId: localStorage.getItem('userid')
        })
      })
    }).catch((error) => {
      console.error('Error loading messages:', error)
    })

    websocket.on('update_channel_success', (data) => {
      if (data.event === 'accept_invitation') {
        this.$q.notify({
          type: 'positive',
          html: true,
          message: `
            <div>
              <strong style="font-size: 16px;">Invitation Accepted</strong><br>
              You have successfully joined the channel.
            </div>
          `,
          position: 'top',
          timeout: 3000
        })
      }
      this.$refs.child.updateChannelInUI(data.updatedChannels)
    })
    websocket.on('error', (data) => {
      this.$q.notify({
        type: 'negative',
        html: true,
        message: `
          <div>
            <strong style="font-size: 16px;">Error</strong><br>
            ${data.message}
          </div>
        `,
        position: 'top',
        timeout: 3000
      })
    })
    websocket.on('success', (data) => {
      this.$q.notify({
        type: 'pozitive',
        html: true,
        message: `
          <div>
            <strong style="font-size: 16px;">Error</strong><br>
            ${data.message}
          </div>
        `,
        position: 'top',
        timeout: 3000
      })
    })
    websocket.on('messages_loaded', (data) => {
      if (data.success) {
        this.messages = [...data.messages, ...this.messages]
      } else {
        console.error('Failed to load messages:', data.error)
      }
    })
    websocket.on('list_members_success', (data) => {
      this.listOfMembers = data.members
      let message = '' // Inicializuj prázdny string
      this.listOfMembers.forEach((member, index) => {
        if (index > 0) message += ', '
        message += `${member.nickname} (${member.status})`
      })
      if (this.listOfMembers.length === 0) message = 'No members in the channel'
      this.$q.notify({
        message, // Odstráni posledné prázdne riadky
        color: 'primary',
        position: 'top',
        timeout: 3000,
        multiline: true
      })
    })
    websocket.on('channel_created', (data) => {
      console.log(data)
      if (data.status === 'error') {
        this.$q.notify({
          type: 'negative',
          html: true,
          message: `
            <div>
              <strong style="font-size: 16px;">Error Creating Channel</strong><br>
              ${data.message}
            </div>
          `,
          position: 'top',
          timeout: 3000
        })
        return
      }
      this.$refs.child.addNewChannel(data.channel)
      this.$refs.child.showNewChannelForm = false
      this.handleChannels(data.channel.id)
      this.$q.notify({
        type: 'positive',
        html: true,
        message: `
          <div>
            <strong style="font-size: 16px;">Channel Created</strong><br>
            Channel "<em>${data.channel.name}</em>" has been successfully created.
          </div>
        `,
        position: 'top',
        actions: [
          {
            label: 'Open Channel',
            color: 'white',
            handler: () => {
              this.handleChannelSwitch(data.channel)
              this.$refs.child.goToChannel(data.channel)
            }
          }
        ],
        timeout: 3000
      })
    })
    websocket.on('channel_deleted', (data) => {
      const channel = this.$refs.child.channels.find(
        (channel) => Number(channel.id) === Number(data.channelId)
      )
      if (this.currentChannelId === data.channelId) {
        this.currentChannel = null
        this.currentChannelId = 0
        this.messages = []

        this.$q.notify({
          type: 'warning',
          html: true,
          message: `
        <div>
          <strong style="font-size: 16px;">Channel Deleted</strong><br>
          The channel you were in has been deleted.
        </div>
      `,
          position: 'top',
          timeout: 3000
        })
      }

      // Reload channels list
      websocket.emit('reload_channels', {
        userId: localStorage.getItem('userid')
      })

      // Notify about general channel deletion
      this.$q.notify({
        type: 'info',
        html: true,
        message: `
      <div>
        <strong style="font-size: 16px;">Channel Removed</strong><br>
        Channel <em>${channel.name}</em> has been deleted.
      </div>
    `,
        position: 'top',
        timeout: 3000
      })
    })
  },
  computed: {
    currentChannelTag () {
      // eslint-disable-next-line eqeqeq
      return this.currentChannel && this.currentChannelId != 0
        ? this.currentChannel.icon
        : ''
    },
    currentChannelName () {
      return this.currentChannel && this.currentChannel.id !== 0
        ? this.currentChannel.name
        : ''
    }
  },
  methods: {
    async loadMessages (lastMsgId = -1) {
      websocket.emit('load_messages', {
        channelId: this.currentChannelId,
        lastMesgId: lastMsgId
      })
    },
    async handleSendMessage (message) {
      try {
        const matches = message.match(/@(\w+)/g)

        const names = matches ? matches.map(name => name.substring(1)) : []

        console.log(names)
        if (this.currentChannel !== null) {
          websocket.emit('message', {
            content: message,
            channelId: this.currentChannel.id,
            userId: this.myUserId,
            pinnedUsers: names
          })
          this.$nextTick(() => {
            this.$refs.chatWindow.scrollToBottom()
          })
        } else {
          console.warn('No channel selected, message not sent.')
        }
      } catch (error) {
        console.error('Error while sending the message:', error)

        this.$toast.error('Failed to send the message. Please try again.')
      }
    },
    handleChannelSwitch (channel) {
      this.currentChannel = channel
      if (channel === null) {
        this.currentChannelId = 0
        this.messages = []
      } else {
        if (this.currentChannelId !== channel.id) {
          this.currentChannelId = channel.id
          this.messages = []
          this.loadMessages()
        }
      }
      this.$refs.chatWindow.scrollToBottom()
    },
    sendMessageNotf (nickname, channelName, message) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(`New message from ${nickname}`, {
          body: `Channel: ${channelName}\nMessage: ${message}`
        })
        notification.onclick = () => {
          console.log('Klikli ste na notifikáciu!')
        }
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            this.sendMessageNotf()
          } else {
            console.log('Notifikácie boli zamietnuté.')
          }
        })
      }
    },
    showAddPeopleDialog () {
      this.addPeopleDialogVisible = true
    },
    closeAddPeopleDialog () {
      this.addPeopleDialogVisible = false
      this.newPersonName = ''
      this.nicknameError = false
      this.nicknameErrorMessage = ''
    },
    submitNickname () {
      if (this.newPersonName.trim() === '') {
        this.nicknameError = true
        this.nicknameErrorMessage = 'Please fill in the name'
      } else {
        websocket
          .emit('invitation', {
            channelId: this.currentChannelId,
            nickname: this.newPersonName,
            userId: this.myUserId
          })
          .then(() => {
            this.closeAddPeopleDialog()

            this.$q.notify({
              type: 'positive',
              message: 'Person added successfully to the channel!'
            })
          })
          .catch((error) => {
            console.error('Error adding person to the channel:', error)

            this.$q.notify({
              type: 'negative',
              message: 'Failed to add person to the channel. Please try again.'
            })
          })
      }
    },
    isInChannel () {
      return this.currentChannelId !== 0
    },
    onResize ({ width }) {
      this.isSmallScreen = width < 768
      this.leftDrawerOpen = !this.isSmallScreen
    },
    handleChannels (channelId) {
      websocket.joinRoom(`channel:${channelId}`)
    },
    handleTyping (message) {
      websocket.emit('typing', {
        channelId: this.currentChannelId,
        userId: this.myUserId,
        message
      })
    },
    showNotification (invitation) {
      const visible = isAppVisible()
      if (visible) {
        this.$q.notify({
          type: 'positive',
          message: `You have been invited to channel: ${invitation.name}`,
          position: 'top',
          timeout: 3000 //
        })
      } else {
        if (Notification.permission === 'granted') {
          const notification = new Notification(`You have been invited to channel: ${invitation.name}`)
          notification.onclick = () => {
            console.log('Klikli ste na notifikáciu!')
          }
        } else {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              this.sendMessageNotf()
            } else {
              console.log('Notifikácie boli zamietnuté.')
            }
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.text {
  font-size: large;
  color: white;
}
.custom_input {
  color: white;
  background-color: white;
  padding: 4px;
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
}
.commandline {
  background-color: white;
  border-top: 1px solid #444;
  border-radius: 8px;
  margin: 0;
}
.add-people-dialog {
  width: 400px;
  background-color: #121212;
  border-radius: 8px;
}

.q-card-section {
  color: white;
}

.q-input {
  background-color: white;
  color: black;
  border-radius: 4px;
}

.q-btn {
  font-weight: bold;
}

.q-btn[label='Add'] {
  color: #2196f3;
}

.q-btn[label='Cancel'] {
  color: #ffffff;
}
</style>
