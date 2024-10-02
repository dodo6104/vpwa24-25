<template>
  <div>
    <div v-for="message in messages" :key="message.id">
      <q-item>
        <q-item-section>
          <span><strong>Ahoj</strong></span>
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [
        { id: 1, sender: 'Admin', content: 'Welcome to the channel!' }
      ],
      newMessage: ''
    };
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim()) {
        this.messages.push({ id: this.messages.length + 1, sender: 'You', content: this.newMessage });
        this.newMessage = '';
      }
    }
  }
};
</script>
