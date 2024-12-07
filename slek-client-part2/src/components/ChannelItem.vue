<template>
  <q-item
    clickable
    v-ripple
    @click="goToChannel"
    :class="{
      'selected-channel': isSelected,
      'blinking-channel': hasNewMessage && !isSelected,
    }"
    class="main-container"
  >
    <q-item-section class="col-15 text-font">
      <span>
        <q-icon :name="channel.icon" size="sm" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {{ channel.name }}
      </span>
    </q-item-section>
    <q-item-section class="col-1">
      <q-icon
        v-if="isSelected"
        name="delete"
        size="xs"
        color="white"
        @click.stop="deleteChannel"
      />
      <span v-else-if="channel.newMessages > 0" class="new-messages-count">
        {{ channel.newMessages }}
      </span>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  props: {
    channel: {
      type: Object,
      required: true
    },
    selectedChannel: {
      type: Object,
      required: false
    }
  },
  data () {
    return {
      hasNewMessage: false // Tracks if the channel has new messages
    }
  },
  computed: {
    isSelected () {
      return this.selectedChannel && this.selectedChannel.id === this.channel.id
    }
  },
  watch: {
    // Watch for changes in channel.updatedAt and recalculate hasNewMessage
    'channel.updatedAt': {
      handler (newVal, oldVal) {
        this.checkNewMesg()
      },
      immediate: true // Run the watcher immediately on component mount
    }
  },
  methods: {
    goToChannel () {
      this.$emit('select-channel', this.channel)
    },
    deleteChannel () {
      this.$emit('delete-channel', this.channel)
    },
    checkNewMesg () {
      if (this.channel.pivot_updated_at < this.channel.updatedAt) {
        this.hasNewMessage = true
      } else {
        this.hasNewMessage = false
      }
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

.blinking-channel {
  animation: blinking-bg 2s infinite;
}

.new-messages-count {
  color: white;
  font-weight: bold;
}

@keyframes blinking-bg {
  0% { background-color: #484848; }
  50% { background-color: rgb(56, 55, 55); }
  100% { background-color: #484848; }
}
</style>
