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
import websocket from 'src/services/websocket'
export default {
  data () {
    return {
      message: ''
    }
  },
  props: {
    currentChannel: {
      type: Object,
      required: true
    },
    listOfMembers: {
      type: Array,
      required: true
    }
  },
  watch: {
    message (newValue) {
      this.$emit('typing', newValue)
    }
  },
  methods: {
    checkCommand () {
      const firstWord = this.message.split(' ')[0].trim()
      if (firstWord === '/list') {
        console.log(this.currentChannel.id)
        websocket.emit('list_members', {
          channelId: this.currentChannel.id,
          userId: localStorage.getItem('userid')
        })
        return true
      } else if (firstWord === '/join') {
        try {
          const channelName = this.message.split(' ')[1]?.trim() || '' // Ak neexistuje druhé slovo, použije sa prázdny reťazec.
          const isPublic = (() => {
            try {
              if (!this.message || this.message.trim() === '/join') {
                return true
              }

              let messageType = this.message.split(' ')[2]?.trim()
              messageType = messageType.replace(/(\r\n|\n|\r)/gm, '')
              if (messageType === '[public]') {
                return true
              }

              if (messageType === '[private]') {
                return false
              }

              return null // Ak je niečo iné, null.
            } catch (err) {
              console.error('Error determining isPublic:', err)
              return true // V prípade chyby nastavíme true.
            }
          })()
          if (channelName === '') {
            return false
          }
          if (isPublic === null) {
            return false
          }
          websocket.emit('add_channel', {
            channel: {
              name: channelName,
              isPrivate: !isPublic
            },
            userId: localStorage.getItem('userid')
          })
        } catch (err) {
          console.error('Error processing /join command:', err)
          return false
        }
        return true
      } else if (firstWord === '/quit' || firstWord === '/cancel') {
        if (!this.currentChannel) {
          this.$q.notify({
            message: 'You are not in any channel.',
            color: 'negative',
            position: 'top',
            timeout: 3000
          })
          return false
        }
        try {
          websocket.emit('delete_channel', {
            channelId: this.currentChannel.id,
            userId: localStorage.getItem('userid')
          })
        } catch (err) {
          console.error('Error processing /leave command:', err)
          return false
        }
        return true
      } else if (firstWord === '/invite') {
        try {
          let nickname = this.message.split(' ')[1]?.trim() || ''
          if (nickname === '') {
            return false
          }
          nickname = nickname.trim()
          websocket.emit('invitation', {
            channelId: this.currentChannel.id,
            nickname,
            userId: localStorage.getItem('userid')
          })
        } catch (err) {
          console.error('Error processing /invite command:', err)
          return false
        }
        return true
      } else if (firstWord === '/leave') {
        if (!this.currentChannel) {
          this.$q.notify({
            message: 'You are not in any channel.',
            color: 'negative',
            position: 'top',
            timeout: 3000
          })
          return false
        }
        try {
          websocket.emit('leave_channel', {
            channelId: this.currentChannel.id,
            userId: localStorage.getItem('userid')
          })
        } catch (err) {
          console.error('Error processing /leave command:', err)
          return false
        }
        return true
      } else if (firstWord === '/revoke') {
        try {
          let username = this.message.split(' ')[1]?.trim() || ''
          if (username === '') {
            return false
          }
          username = username.trim()
          websocket.emit('revoke-user', {
            channelId: this.currentChannel.id,
            username,
            userId: localStorage.getItem('userid')
          })
        } catch (err) {
          console.error('Error processing /revoke command:', err)
          return false
        }
        return true
      } else if (firstWord === '/kick') {
        try {
          const targetUser = this.message.split(' ')[1]?.trim() || '' // Extrahuje nickName
          if (targetUser === '') {
            this.displayMessage('Chýba nickName v príkaze.')
            return false
          }

          websocket.emit('kick_member', {
            channelId: this.currentChannel.id,
            targetUserName: targetUser,
            voterUserId: localStorage.getItem('userid') // ID aktuálneho používateľa
          })

          this.displayMessage(`Hlas pre vykopnutie ${targetUser} bol odoslaný.`)
          return true
        } catch (err) {
          console.error('Chyba pri spracovaní /kick príkazu:', err)
          return false
        }
      }

      return false
    },
    onKeyPress (event) {
      if (event.shiftKey) {
        return
      }
      this.sendMessage()
    },
    sendMessage () {
      if (this.message.trim() === '') return
      if (this.checkCommand()) {
        this.message = ''
        return
      }
      this.$emit('send-message', this.message)
      this.message = '' // Clear the input after sending
    }
  }
}
</script>

<style scoped>
.input {
  font-size: 24px;
  color: black;
}
</style>
