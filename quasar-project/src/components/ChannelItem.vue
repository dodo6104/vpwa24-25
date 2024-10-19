<template>
  <q-item
    clickable
    v-ripple
    @click="goToChannel"
    :class="{ 'selected-channel': isSelected, 'blinking-channel': !isSelected && channel.newMessages > 0 }"
    class="main-container"
  >
    <q-item-section class="col-15 text-font">
      <span>
        <q-icon :name="channel.icon" size="sm"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {{ channel.name }}
      </span>
    </q-item-section>
    <!-- Ak je kanál zvolený, zobrazí sa ikona koša, inak sa zobrazí počet nových správ, ak je väčší než 0 -->
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

.blinking-channel {
  animation: blinking-bg 2s infinite;
}

.new-messages-count {
  color: white;
  font-weight: bold;
}

@keyframes blinking-bg {
  0% { background-color: #484848; }
  50% { background-color: rgb(56, 55, 55); } /* Môžeš zmeniť farbu na inú, ktorá vyhovuje tvojmu dizajnu */
  100% { background-color: #484848; }
}
</style>
