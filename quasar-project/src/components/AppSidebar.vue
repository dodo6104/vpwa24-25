<template>
  <q-drawer
    :model-value="leftDrawerOpen"
    @update:model-value="updateLeftDrawer"
    side="left"
    bordered
  >

    <div class="column full-height">
      <!-- Sekcia kanálov (70%) s možnosťou scrollovania -->
      <div class="q-pa-md q-scroll" style="flex: 9; overflow-y: auto;">
        <q-list>
          <q-item>
            <q-item-section>
              <q-row>

                <q-col class="q-mr-md">
                  <strong>Channels</strong>
                </q-col>

                <!-- Add Channel Button -->
                <q-col class="text-right">
                  <q-btn round icon="add" color="primary" label="Add Channel" @click="openNewChannelForm" />
                </q-col>
              </q-row>
            </q-item-section>
          </q-item>
          <q-separator />



             <!-- Dynamically render channels -->
             <q-item v-for="channel in channels" :key="channel.id" clickable v-ripple @click="goTo(channel)">
  <q-item-section class="col-15">
    <span>&nbsp;&nbsp;&nbsp;<q-icon :name="channel.icon" size="sm"/>&nbsp;&nbsp;&nbsp;{{ channel.name }}</span>
  </q-item-section>
  <q-item-section class="col-1">
    <q-icon name="delete" size="xs" @click.stop="deleteChannel(channel.id)" />
  </q-item-section>
</q-item>


        </q-list>
      </div>


      <q-separator />
      <!-- New Channel Form Component -->
<div v-if="showNewChannelForm">
        <NewChannelForm @submit="addChannel" @cancel="closeNewChannelForm" />
      </div>
      <q-btn-dropdown anchor="top" ref="statusdropdown">
        <template v-slot:label>
          <div class="flex justify-between items-center q-border full-width">
            <div class="flex items-center">
              <q-icon name="circle" :color="statusColor" size="xs" class="q-ml-md"></q-icon>
              <div class="q-ml-xs q-pa-xs text-left">
                <strong>{{ userName }}</strong>
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
              <q-icon class="q-ml-md" name="circle" color="black" size="xs"/>
            </q-item-section>
            <q-item-section>Offline</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>


    </div>
  </q-drawer>
</template>

<script>
import NewChannelForm from './NewChannelForm.vue';

export default {
  components: {
    NewChannelForm,
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
      selectedChannel: null ,// Track selected channel
      showNewChannelForm: false // Control form visibility
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
      this.selectedChannel = channel;
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
      this.statusColor = value === 'Online' ? 'green' : 'black';
    },
    deleteChannel(id) {
  // Remove the channel from the list
  this.channels = this.channels.filter(channel => channel.id !== id);

  // Reset the selected channel and update the main layout
  this.selectedChannel = null;
  this.$emit('switch-channel', { id: 0 }); // Emit a channel with id 0 for no selected channel

  // Set loading flag to false
  this.loadingOlderMessages = false;

  this.$router.push('/'); // Redirect to default route
},
addChannel(channel) {
    // Add the new channel to the list
    this.channels.push(channel);

    // Hide the form after adding the channel
    this.showNewChannelForm = false;
  },
  openNewChannelForm() {
    this.showNewChannelForm = true; // Open the form
  },
  closeNewChannelForm() {
    this.showNewChannelForm = false; // Close the form
  },
  logout() {
    console.log(this.$router); // Check if this logs the router instance
    if (this.$router) {
      // Clear user session data or perform any logout action
      localStorage.removeItem('authToken'); // Example of clearing auth data
      console.log(this.$router); // Check if router is available
      this.$router.push('/login');
    }
    }

  }
};
</script>

<style>


</style>
