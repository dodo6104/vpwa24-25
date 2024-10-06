<template>
  <q-item
    clickable
    v-ripple
    @click="goToChannel"
    :class="{ 'selected-channel': isSelected }"
    class="main-container"
  >
    <q-item-section class="col-15 text-font">
      <span><q-icon :name="channel.icon" size="sm"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ channel.name }}</span>
    </q-item-section>
    <q-item-section class="col-1" v-if="isSelected">
      <q-icon name="delete" size="xs" color="white" @click.stop="deleteChannel" />
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
  computed: {
    isSelected() {
      return this.selectedChannel && this.selectedChannel.id === this.channel.id;
    }
  },
  methods: {
    goToChannel() {
      this.$emit('select-channel', this.channel); // Emituje event pre vybratie kanála
    },
    deleteChannel() {
      this.$emit('delete-channel', this.channel.id); // Emituje event pre zmazanie kanála
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
