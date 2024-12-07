import { io, Socket } from 'socket.io-client'
import { authManager } from '.'

class WebSocketService {
  private socket: Socket | null = null

  connect (userId: number) {
    if (!this.socket) {
      this.socket = io('http://localhost:3333', {
        auth: { token: authManager.getToken(), userId }
      })

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket:', this.socket?.id)
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket')
      })
    }
  }

  disconnect () {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('WebSocket disconnected')
    }
  }

  emit (event: string, data?: unknown) {
    if (this.socket) {
      this.socket.emit(event, data)
    } else {
      console.error('WebSocket is not connected. Cannot emit event:', event)
    }
  }

  on (event: string, callback: (data: unknown) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    } else {
      console.error('WebSocket is not connected. Cannot listen to event:', event)
    }
  }

  off (event: string) {
    if (this.socket) {
      this.socket.off(event)
    } else {
      console.error('WebSocket is not connected. Cannot remove listener for event:', event)
    }
  }

  joinRoom (roomName: string) {
    if (this.socket) {
      this.emit('joinRoom', roomName)
      console.log(`Joined room: ${roomName}`)
    } else {
      console.error('WebSocket is not connected. Cannot join room:', roomName)
    }
  }

  leaveRoom (roomName: string) {
    if (this.socket) {
      this.emit('leaveRoom', roomName)
      console.log(`Left room: ${roomName}`)
    } else {
      console.error('WebSocket is not connected. Cannot leave room:', roomName)
    }
  }
}

export default new WebSocketService()
