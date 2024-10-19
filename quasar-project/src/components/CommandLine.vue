<template>
  <div class="commandline-wrapper" style="max-height: 300px;">
    <q-input
      v-model="message"
      placeholder="Type command or message"
      type="textarea"
      @keyup.enter="sendMessage"
      @keydown.enter.exact.prevent="sendMessage"
      @keydown.shift.enter.exact.prevent="newline"
      dense
      outlined
      clearable
      class="input"
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
    sendMessage(event) {
      if (event.shiftKey) {
        return; // Handle shift + enter for new lines
      }

      const trimmedMessage = this.message.trim();

      if (!trimmedMessage) {
        return; // Ignore empty messages
      }

      if (trimmedMessage.startsWith('/')) {
        // Handle command input
        this.processCommand(trimmedMessage);
      } else {
        // Emit the message as a normal message
        this.$emit('send-message', trimmedMessage);
      }

      // Clear the input field after sending
      this.message = '';
    },

    newline(event) {
      const textarea = event.target;
      const cursorPos = textarea.selectionStart;
      this.message =
        this.message.substring(0, cursorPos) + '\n' + this.message.substring(cursorPos);
      this.$nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos + 1;
      });
    },
  },
};
</script>

<style scoped>
.input {
  font-size: 24px;
  color: white;
  background-color: white;
}
</style>
