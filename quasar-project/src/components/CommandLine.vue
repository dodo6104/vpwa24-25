
<template>
  <div class="commandline-wrapper">
    <q-input
      v-model="message"
      placeholder="Type command or message"
      type="textarea"
      @keyup.enter="sendMessage"
      dense
      
      outlined
      clearable

    >
      <template v-slot:append>
        <q-btn
          icon="send"
          flat
          dense
          @click="sendMessage"
          :disable="!message"
        />
      </template>
    </q-input>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '', // Holds the message being typed
    };
  },
  methods: {
    sendMessage() {
      if (event.shiftKey) {
        // Shift + Enter, nechceme odoslať správu
        return;
      }
      if (this.message.trim()) {
        // Emit the message to parent (MainLayout)
        this.$emit('send-message', this.message);
        this.message = ''; // Clear the input after sending
      }
    }
  }
};
</script>

<style scoped>

</style>

