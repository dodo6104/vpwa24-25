import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'

class MessagesController {
  public async getMessages({ params, response }: HttpContextContract) {
    const { channelId } = params

    const messages = await Message.query()
      .where('channelId', channelId)
      .preload('author') // Načítanie autora správy (User)
      .preload('channel') // Načítanie kanálu (Channel)
      .orderBy('createdAt', 'asc')

    const result = messages.map((message) => ({
      id: message.id,
      content: message.content,
      channelId: message.channelId,
      createdBy: message.createdBy,
      nickname: message.author?.nickname,
      channelName: message.channel?.name,
      createdAt: message.createdAt.toISO(), // Sérializácia do ISO formátu
      updatedAt: message.updatedAt.toISO(), // Sérializácia do ISO formátu
    }))

    return response.ok(result)
  }
}

export default MessagesController
