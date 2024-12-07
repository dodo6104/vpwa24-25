import { boot } from 'quasar/wrappers'
import websocket from 'src/services/websocket'

export default boot(({ app }) => {
  // Pridaj WebSocket službu do globálnych vlastností Vue
  app.config.globalProperties.$websocket = websocket
})
