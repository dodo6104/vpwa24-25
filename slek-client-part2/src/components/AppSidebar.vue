<template>
  <q-drawer
    :model-value="leftDrawerOpen"
    @update:model-value="updateLeftDrawer"
    side="left"
    class="drawer-bg full-height"
  >
    <div class="column full-height background-black">
      <!-- Invitations Section -->
      <div v-if="invitedChannels.length > 0">
        <q-row style="flex: 1;" class="q-pl-md q-pr-md bottom-channels">
          <q-col class="q-pb-xl channels-top">
            <strong class="text-font">Invitations</strong>
          </q-col>
        </q-row>
        <div class="background-ligher-black q-pt-md q-ml-md q-mr-md" style="flex: 8;">
          <q-list class="full-height">
            <inviteItem
              v-for="invitedChannel in invitedChannels"
              :key="invitedChannel.id"
              :invitedChannel="invitedChannel"
              :selectedChannel="selectedChannel"
              @accept-invitation="handleAcceptInvitation"
              @decline-invitation="handleDeclineInvitation"
              class="q-ml-md q-mr-md q-mb-sm"
            />
          </q-list>
        </div>
      </div>

      <!-- Channels Section -->
      <div class="background-ligher-black q-pt-md q-ml-md q-mr-md" style="flex: 8;">
        <q-list class="full-height">
          <div style="display: flex; background-color: black; padding-top: 40px; margin-bottom: 20px;">
            <q-row>
              <q-col>
                <strong class="text-font" style="padding-right: 150px;">Channels</strong>
              </q-col>
              <q-col>
                <q-btn round icon="add" color="black" @click="channelForm" />
              </q-col>
            </q-row>
          </div>
          <ChannelItem
            v-for="channel in channels"
            :key="channel.id"
            :channel="channel"
            :selectedChannel="selectedChannel"
            @select-channel="goToChannel"
            @delete-channel = "handleDelete"
            class="q-ml-md q-mr-md q-mb-sm"
            ref="child"
          />
        </q-list>
      </div>

      <!-- User Info Section -->
      <q-separator />
      <q-btn-dropdown style="flex: 1;" anchor="top" ref="statusdropdown" class="dropdown-style">
        <template v-slot:label>
          <div class="flex justify-between items-center q-border full-width">
            <div class="flex items-center">
              <q-icon name="circle" :color="statusColor" size="xs" class="q-ml-md q-pr-md"></q-icon>
              <div class="q-ml-xs q-pa-xs text-left">
                <div class="text-font user-name">{{ userName }}</div>
                <div class="text-grey text-caption">{{ status }}</div>
              </div>
            </div>
          </div>
        </template>
        <q-list>
          <q-item clickable @click="setStatus('Online')">
            <q-item-section avatar>
              <q-icon class="q-ml-md" name="circle" color="green" size="xs" />
            </q-item-section>
            <q-item-section>Online</q-item-section>
          </q-item>
          <q-item clickable @click="setStatus('Offline')">
            <q-item-section avatar>
              <q-icon class="q-ml-md" name="circle" color="red" size="xs" />
            </q-item-section>
            <q-item-section>Offline</q-item-section>
          </q-item>
          <q-item clickable @click="setStatus('DND')">
            <q-item-section avatar>
              <q-icon class="q-ml-md" name="circle" color="orange" size="xs" />
            </q-item-section>
            <q-item-section>Do Not Disturb</q-item-section>
          </q-item>
          <q-item clickable @click="logout()" class="logout">
            <q-item-section avatar>
              <q-icon class="q-ml-md" name="exit_to_app" color="black" size="xs" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <q-dialog v-model="showNewChannelForm">
      <q-card style="width: 500px; max-width: 90vw; background-color: #121212; border-radius: 8px; color: #ffffff;">
        <q-separator />
        <q-card-section>
          <div class="text-h6">Create Channel</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newChannel.name"
            @keyup.enter="addChannel"
            label="Channel Name"
            class="channel-name-input custom-input-text"
            dense
            filled
          />
          <q-checkbox dark class="channel-checkbox" v-model="newChannel.isPrivate" label="Private Channel" />
        </q-card-section>

        <q-card-actions align="right" class="q-pt-md">
          <q-btn flat label="Cancel" color="white" @click="channelForm" />
          <q-btn flat label="Create" color="primary" class="text-weight-bold" @click="addChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-drawer>
</template>

<script>
import ChannelItem from './ChannelItem.vue'
import inviteItem from './inviteItem.vue'
import websocket from 'src/services/websocket'

export default {
  components: {
    ChannelItem,
    inviteItem
  },
  data () {
    return {
      userName: '',
      status: 'Online',
      statusColor: 'green',
      channels: [],
      invitedChannels: [],
      selectedChannel: null,
      showNewChannelForm: false,
      newChannel: {
        name: '',
        isPrivate: false
      }
    }
  },
  props: {
    leftDrawerOpen: {
      type: Boolean,
      required: true
    }
  },
  async created () {
    await this.fetchChannels()
    await this.$websocket.on('new-invitation', this.handleNewInvitation)
  },
  methods: {
    handleNewInvitation (invitation) {
      this.invitedChannels = [invitation, ...this.invitedChannels]
      this.$emit('send-data', invitation.id)
      this.$emit('showNotification', invitation)
    },

    async fetchChannels () {
      try {
        const response = await this.$api.get('/auth/me')
        const backendData = response.data
        this.userName = backendData.nickname
        this.userId = backendData.id
        localStorage.setItem('userid', backendData.id)
        localStorage.setItem('userName', backendData.nickname)
        this.status = backendData.status
        this.statusColor = this.getStatusColor(backendData.status)
        this.channels = backendData.channels
          .filter((channel) => channel.status === 'accepted') // Filtrovanie kanálov s podmienkou "accepted"
          .map((channel) => ({
            id: channel.id,
            name: channel.name,
            route: `channels/${channel.name.toLowerCase().replace(/\s+/g, '-')}`,
            icon: channel.is_private ? 'lock' : 'tag',
            ownerId: channel.owner_id,
            isPrivate: channel.is_private,
            updatedAt: new Date(channel.updated_at),
            pivot_updated_at: new Date(channel.pivot_updated_at)
          }))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        this.channels.forEach((channel) => {
          this.$emit('send-data', channel.id)
        })
        this.invitedChannels = backendData.channels
          .filter((channel) => channel.status === 'invited') // Filtrovanie kanálov s podmienkou "accepted"
          .map((channel) => ({
            id: channel.id,
            name: channel.name,
            route: `channels/${channel.name.toLowerCase().replace(/\s+/g, '-')}`,
            icon: channel.is_private ? 'lock' : 'tag',
            ownerId: channel.owner_id,
            isPrivate: channel.is_private,
            updatedAt: new Date(channel.updated_at),
            pivot_updated_at: new Date(channel.pivot_updated_at)
          }))
      } catch (error) {
        console.error('Chyba pri načítaní kanálov:', error)
      }
    },
    getStatusColor (status) {
      switch (status) {
        case 'Online':
          return 'green'
        case 'Offline':
          return 'red'
        case 'DND':
          return 'orange'
        default:
          return 'grey'
      }
    },
    logout () {
      console.log('Logging out...')
      this.$api.post('/auth/logout').then(() => {
        localStorage.removeItem('userid')
        localStorage.removeItem('userName')
        this.$router.push('/login')
      }).catch((err) => {
        console.error('Chyba pri odhlásení:', err)
      })
    },
    channelForm () {
      this.newChannel = {
        name: '',
        isPrivate: false
      }
      this.showNewChannelForm = !this.showNewChannelForm
    },
    async addChannel () {
      websocket.emit('add_channel', { channel: this.newChannel, userId: localStorage.getItem('userid') })
    },
    setStatus (value) {
      this.status = value
      this.statusColor = this.getStatusColor(value)
      this.$api.put('/auth/status', { status: value }).catch((err) => {
        console.error('Chyba pri aktualizácii stavu:', err)
      })
      this.$refs.statusdropdown.hide()
    },
    handleAcceptInvitation (channelId) {
      websocket.emit('accept_invitation', { channelId, userId: localStorage.getItem('userid') })
    },
    handleDeclineInvitation (channelId) {
      this.$api.put('/auth/decline-invitation', {
        channelId,
        userId: localStorage.getItem('userid')
      }).then(() => {
        this.invitedChannels = this.invitedChannels.filter(channel => channel.id !== channelId)
      }).catch(error => {
        console.error(`Failed to decline invitation for channel ${channelId}:`, error)
      })
    },
    handleDelete (channel) {
      websocket.emit('delete_channel', { channelId: channel.id, userId: localStorage.getItem('userid') })
    },
    goToChannel (channel) {
      this.selectedChannel = channel
      this.$emit('switch-channel', channel)
      websocket.emit('update_channel', {
        channelId: channel.id,
        userId: localStorage.getItem('userid')
      })
    },
    updateChannels (channelId) {
      const channelIndex = this.channels.findIndex(channel => channel.id === channelId)
      if (channelIndex !== -1) {
        this.channels[channelIndex].updatedAt = Date.now()
        this.channels.sort((a, b) => b.updatedAt - a.updatedAt)
      }
    },
    addNewChannel (channel) {
      this.channels.push({
        id: channel.id,
        name: channel.name,
        route: `channels/${channel.name.toLowerCase().replace(/\s+/g, '-')}`,
        icon: channel.is_private ? 'lock' : 'tag',
        ownerId: channel.owner_id,
        isPrivate: channel.is_private
      })
      this.updateChannels(channel.id)
    },
    updateChannelInUI (data) {
      this.channels = data
        .filter((channel) => channel.status === 'accepted') // Filtrovanie kanálov s podmienkou "accepted"
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          route: `channels/${channel.name.toLowerCase().replace(/\s+/g, '-')}`,
          icon: channel.is_private ? 'lock' : 'tag',
          ownerId: channel.owner_id,
          isPrivate: channel.is_private,
          updatedAt: new Date(channel.updated_at),
          pivot_updated_at: new Date(channel.pivot_updated_at)
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

      this.invitedChannels = data
        .filter((channel) => channel.status === 'invited') // Filtrovanie kanálov s podmienkou "accepted"
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          route: `channels/${channel.name.toLowerCase().replace(/\s+/g, '-')}`,
          icon: channel.is_private ? 'lock' : 'tag',
          isPrivate: channel.is_private,
          updatedAt: new Date(channel.updated_at),
          pivot_updated_at: new Date(channel.pivot_updated_at)
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    }
  }
}

</script>

<style scoped>
.full-height {
  height: 100%;
}

.text-font {
  color: white;
  font-weight: normal;
  font-size: 16px;
}

.background-black {
  background: #000;
  border-right: 2px solid #444;
}

.background-ligher-black {
  background: rgb(18, 17, 17);
  border-radius: 10px;
}

.channels-top {
  padding-right: 55%;
}

.dropdown-style {
  color: white;
  font-size: 20px;
}
.channel-name-input {
  background-color: white !important;
  color: black !important;
  border-radius: 4px;
}

.logout {
  border-top: 2px solid black;
}
</style>
