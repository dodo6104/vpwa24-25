<template>
  <q-drawer
    :model-value="leftDrawerOpen"
    @update:model-value="updateLeftDrawer"
    side="left"
    bordered
    class="drawer-bg full-height"
  >
    <div class="column full-height background-black">
      <q-row style="flex: 1;" class="q-pl-md q-pr-md bottom-channels">
        <q-col class="q-pb-xl channels-top">
          <strong class="text-font">Channels</strong>
        </q-col>

        <q-col>
          <q-btn round icon="add" color="black" @click="openNewChannelForm" />
        </q-col>
      </q-row>

      <div class="background-ligher-black q-pt-md q-ml-md q-mr-md" style="flex: 8;">
        <q-list class="full-height">
          <ChannelItem
            v-for="channel in channels"
            :key="channel.id"
            :channel="channel"
            :selectedChannel="selectedChannel"
            @select-channel="goTo"
            @delete-channel="deleteChannel"
            class="q-ml-md q-mr-md q-mb-sm"
          />
          <strong class="text-font">Invitations</strong>
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
              <q-btn flat round icon="logout" @click="logout" />
            </q-item-section>
            <q-item-section @click="logout">Logout</q-item-section>
          </q-item>
          <q-item clickable @click="setStatus('Online')">
            <q-item-section avatar>
              <q-icon class="q-ml-md" name="circle" color="green" size="xs"/>
            </q-item-section>
            <q-item-section>Online</q-item-section>
          </q-item>
          <q-item clickable @click="setStatus('Offline')">
            <q-item-section avatar>
              <q-icon class="q-ml-md" name="circle" color="red" size="xs"/>
            </q-item-section>
            <q-item-section>Offline</q-item-section>
          </q-item>
          <q-item clickable @click="setStatus('DND')">
              <q-item-section avatar>
                <q-icon class="q-ml-md" name="circle" color="orange" size="xs"/>
              </q-item-section>
              <q-item-section>Do Not Disturb</q-item-section>
            </q-item>

        </q-list>
      </q-btn-dropdown>
    </div>

    <!-- New Channel Dialog -->
    <q-dialog v-model="showNewChannelForm">
      <q-card style="width: 500px; max-width: 90vw; background-color: #121212; border-radius: 8px; color: #ffffff;">
        <q-separator />
        <q-card-section>
          <div class="text-h6">Create Channel</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newChannel.name"
            label="Channel Name"
            class="channel-name-input custom-input-text"
            dense
            filled
          />
          <q-checkbox class="channel-checkbox" v-model="newChannel.isPrivate" label="Private Channel"/>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-md">
          <q-btn flat label="Cancel" color="white" @click="closeNewChannelForm" />
          <q-btn flat label="Create" color="primary" class="text-weight-bold" @click="addChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-drawer>
</template>

<script>
import ChannelItem from './ChannelItem.vue';
import inviteItem from './inviteItem.vue';
export default {
  components: {
    ChannelItem,
    inviteItem
  },
  data() {
    return {
      userName: 'dodo6104',
      status: 'online',
      statusColor: 'green',
      channels: [
        { id: 1, name: 'Channel 1', route: 'chat/channel1', icon: 'lock' },
        { id: 2, name: 'Channel 2', route: 'chat/channel2', icon: 'tag' }
      ],
      invitedChannels: [
        { id: 100, name: 'Channel 3', route: 'chat/channel3', icon: 'lock' },
        { id: 101, name: 'Channel 4', route: 'chat/channel4', icon: 'tag' }
      ],
      selectedChannel: null, // Track selected channel
      showNewChannelForm: false, // Control dialog visibility
      loading: false, // Loading flag for preventing multiple clicks
      newChannel: {
        name: '',
        type: 'Text',
        isPrivate: false
      },
      channelOptions: [
        { label: 'Text', value: 'Text' },
        { label: 'Voice', value: 'Voice' }
      ]
    };
  },
  props: {
    leftDrawerOpen: {
      type: Boolean,
      required: true
    }
  },
  created() {
    // Set default route when no channel is selected
    if (!this.selectedChannel) {
      this.$router.push('/');
    }
  },
  methods: {
    goTo(channel) {
      // Set the selected channel and emit the change
      this.selectedChannel = channel; // Set the current selected channel
      this.$emit('switch-channel', channel);

      // Navigate to the selected channel's route using Vue Router
      this.$router.push(`/${channel.route}`);
    },
    updateLeftDrawer(value) {
      this.$emit('update:leftDrawerOpen', value); // Emit event to update the drawer value
    },
    setStatus(value) {
      this.status = value;
      this.$refs.statusdropdown.hide();
      switch(value) {
        case 'Online':
          this.statusColor = 'green';
          break;
        case 'Offline':
          this.statusColor = 'red';
          break;
        case 'DND':
          this.statusColor = 'orange';
          break;
        default:
          this.statusColor = 'green';
      }
    },
    deleteChannel(id) {
      if (this.loading) return;
      this.loading = true;

      // Remove the channel from the list
      this.channels = this.channels.filter(channel => channel.id !== id);

      // Reset the selected channel and update the main layout
      this.selectedChannel = null;
      this.$emit('switch-channel', { id: 0 }); // Emit a channel with id 0 for no selected channel

      // Redirect to default route if no channels remain
      if (this.channels.length === 0) {
        this.$router.push('/');
      }

      this.loading = false;
    },
    addChannel() {
      if (this.loading) return;
      this.loading = true;

      // Add the new channel to the list
      const newChannel = {
        id: this.channels.length + 1,
        name: this.newChannel.name,
        route: `chat/${this.newChannel.name.toLowerCase().replace(/\s+/g, '-')}`,
        icon: this.newChannel.isPrivate ? 'lock' : 'tag'
      };
      this.channels.push(newChannel);

       // Automatically select and navigate to the accepted channel
       this.selectedChannel = newChannel;
       this.$emit('switch-channel', newChannel);
      // Hide the form after adding the channel
      this.closeNewChannelForm();
      this.loading = false;
    },
    openNewChannelForm() {
      this.showNewChannelForm = true; // Open the form
    },
    closeNewChannelForm() {
      this.showNewChannelForm = false; // Close the form
    },
    logout() {
      if (this.$router) {
        // Clear user session data or perform any logout action
        localStorage.removeItem('authToken'); // Example of clearing auth data
        this.$router.push('/login');
      }
    },
    handleAcceptInvitation(channelId) {
    if (this.loading) return;
    this.loading = true;

    // Find the invited channel based on the ID
    const invitedChannel = this.invitedChannels.find(channel => channel.id === channelId);

    if (!invitedChannel) {
      this.loading = false;
      return; // If no channel found, exit
    }

    // Add the invited channel to the channels list
    const newChannel = {
      id: invitedChannel.id,
      name: invitedChannel.name,
      route: `chat/${invitedChannel.name.toLowerCase().replace(/\s+/g, '-')}`,
      icon: invitedChannel.icon
    };

    this.channels.push(newChannel);

    // Reset the selected channel and emit the switch event
    this.selectedChannel = newChannel;
    this.$emit('switch-channel', newChannel); // Emit the selected channel

    // Remove the channel from the invitedChannels list
    this.invitedChannels = this.invitedChannels.filter(channel => channel.id !== channelId);

    // Redirect to default route if no channels remain
    if (this.channels.length === 0) {
      this.$emit('switch-channel', { id: 0 }); // Emit the default channel (no selected channel)
    }

    this.loading = false;

    console.log(`Accepted invitation for channel ${channelId}`);
  },

  handleDeclineInvitation(channelId) {
    // Simply remove the declined channel from the invitedChannels list
    this.invitedChannels = this.invitedChannels.filter(channel => channel.id !== channelId);

    console.log(`Declined invitation for channel ${channelId}`);
  }
  }
};
</script>

<style scoped>
.full-height {
  height: 100%; /* Set full height */
}

.text-font {
  color: white;
  font-weight: normal;
  font-size: 16px;
}

.q-list-container {
  display: flex;
  flex-direction: column;
}

.q-list {
  flex-grow: 1; /* Q-list stretches to full height */
  overflow-y: hidden; /* Prevents unnecessary scroll bar */
}

.background-black {
  background: #000;
}

.items-stretch {
  height: 100%
}

.bottom-channels {
  align-content: center;
}

.background-ligher-black {
  background: rgb(18, 17, 17);
  border-radius: 10px;
}

.channels-top {
  padding-right: 55%;
}

.user-name {
  font-weight: bold;
}

.dropdown-style {
  color: white;
  font-size: 20px;
}
</style>

<style>
.channel-name-input {
  background: white;
}

.channel-name-input input {
  color: black;

}

.full-screen-dialog .q-dialog {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
