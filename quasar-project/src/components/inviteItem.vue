<template>
  <q-item
    clickable
    v-ripple
    :class="{ 'selected-channel': isSelected }"
    class="main-container"
  >


    <q-item-section class="col-15 text-font">
      <span><q-icon :name="invitedChannel.icon" size="sm"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ invitedChannel.name }}</span>
    </q-item-section>
    <q-item-section class="col-1" v-if="!isSelected">
      <q-icon name="check" size="sm" color="white" @click.stop="acceptInvitation" />
    </q-item-section>
    <q-item-section class="col-1" v-if="!isSelected">
      <q-icon name="close" size="sm" color="grey" @click.stop="declineInvitation" />
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  props: {
    invitedChannel: {
      type: Object,
      required: true
    },
    selectedChannel: {
      type: Object,
      required: false
    }
  },
  computed: {
    isSelected() {
      return this.selectedChannel && this.selectedChannel.id === this.invitedChannel.id;
    }
  },
  methods: {
    acceptInvitation() {
      this.$emit('accept-invitation', this.invitedChannel.id); // Emit event to accept the invitation
    },
    declineInvitation() {
      this.$emit('decline-invitation', this.invitedChannel.id); // Emit event to decline the invitation
    }
  }
}
</script>

<style scoped>
.main-container {
  border-radius: 10px;
}

.text-font {
  color: white;
}

.selected-channel {
  background-color: #484848;
  font-weight: bold;
}
</style>
