<template>
  <div class="commandline-wrapper" style="max-height: 300px">
    <q-input
      v-model="message"
      ref="messageInput"
      placeholder="Type command or message"
      type="textarea"
      @keyup.enter="onKeyPress"
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
import { nextTick } from 'vue';
import { Notify } from 'quasar';

export default {
  data() {
    return {
      message: '', // Holds the message being typed
      isCommand: false, // Holds whether the message starts with a command
      commands: ['/join', '/invite', '/revoke', '/kick', '/quit', '/list'], // List of commands
    };
  },
  mounted() {
    // Použitie nextTick, aby sme sa uistili, že DOM je plne vykreslený
    nextTick(() => {
      const inputElement = this.$refs.messageInput.$el.querySelector('textarea');

      if (inputElement) {
        inputElement.addEventListener('input', () => {
          this.checkCommand();
        });
      }
    });
  },
  methods: {
    checkCommand() {
      const firstWord = this.message.split(' ')[0]; // Získanie prvého slova správy
      this.isCommand = this.commands.includes(firstWord); // Kontrola, či prvé slovo je príkaz
      this.updateTextColor(); // Aktualizácia farby textu
    },
    updateTextColor() {
      const inputElement = this.$refs.messageInput.$el.querySelector('textarea');
      if (this.isCommand) {
        inputElement.style.color = 'red'; // Nastav text na červený
      } else {
        inputElement.style.color = 'black'; // Nastav text na čierny
      }
    },
    onKeyPress(event) {
      if (event.shiftKey) {
        return;
      }
      this.sendMessage();
    },
    validateCommandFormat(command, argument) {
      if (['/join', '/invite'].includes(command)) {
        // Validate for /join and /invite commands
        return argument && argument.length >= 4 && !argument.includes(' ');
      }
      return true; // Other commands don't need special validation
    },
    sendMessage() {
      if (this.message.trim()) {
        let firstWord = this.message.split(' ')[0];
        const commandArgument = this.message.split(' ').slice(1).join(' ');
        firstWord = firstWord.replace(/\s/g, ''); // odstráni všetky biele znaky

        if (firstWord === '/join') {
          Notify.create({ message: `You have joined ${commandArgument}`, color: 'positive' });
          this.message = '';
          this.isCommand = false;
          this.updateTextColor();
          return;
        } else if (firstWord === '/invite') {
          Notify.create({ message: `You have invited ${commandArgument}`, color: 'positive' });
          this.message = '';
          this.isCommand = false;
          this.updateTextColor();
          return;
        } else if (firstWord === '/revoke') {
          Notify.create({ message: `You have revoked ${commandArgument}`, color: 'warning' });
          this.message = '';
          this.isCommand = false;
          this.updateTextColor();
          return;
        } else if (firstWord === '/kick') {
          Notify.create({ message: `You have kicked ${commandArgument}`, color: 'negative' });
          this.message = '';
          this.isCommand = false;
          this.updateTextColor();
          return;
        } else if (firstWord === '/quit') {
          Notify.create({ message: `You have quit ${commandArgument}`, color: 'info' });
          this.message = '';
          this.isCommand = false;
          this.updateTextColor();
          return;
        } else if (firstWord === '/list') {
          this.$emit('send-message', 'Members: Dominik, Marcel, Kokot');
          this.message = '';
          this.isCommand = false;
          this.updateTextColor();
          return;
        }

        // Emit the message to parent (MainLayout)
        this.$emit('send-message', this.message);
        this.message = ''; // Clear the input after sending
        this.isCommand = false; // Resetuje stav príkazu
        this.updateTextColor(); // Zresetuje farbu textu
      }
    },
  },
};
</script>

<style scoped>
.input {
  font-size: 24px;
  color: black;
}
</style>
