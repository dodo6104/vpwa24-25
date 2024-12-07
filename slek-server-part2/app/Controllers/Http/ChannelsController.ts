import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import Ws from '@ioc:Ruby184/Socket.IO/Ws'

export default class ChannelController {
  public async create({ auth, request, response }: HttpContextContract) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ error: 'You are not logged in' })
      }

      const { name, isPrivate } = request.only(['name', 'isPrivate'])

      // Vytvorenie kanála
      const channel = await Channel.create({
        name,
        isPrivate,
        ownerId: user.id,
      })

      // Pridanie používateľa do pivot tabuľky s predvoleným stavom 'accepted'
      await channel.related('users').attach({
        [user.id]: { status: 'accepted' }, // Predvolený stav pre majiteľa kanála
      })

      return response.created({
        message: 'Channel created successfully',
        channel,
      })
    } catch (error) {
      console.error('Error creating channel:', error)
      return response.internalServerError({ error: 'Something went wrong' })
    }
  }

  public async addUser({ request, response }: HttpContextContract) {
    try {
      const { channelId, nickname } = request.only(['channelId', 'nickname'])

      if (!channelId || !nickname) {
        return response.badRequest({ message: 'Channel ID and nickname are required' })
      }

      const channel = await Channel.findOrFail(channelId)
      const user = await User.query().where('nickname', nickname).first()
      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      await channel.related('users').attach({
        [user.id]: { status: 'invited' },
      })
      const room = `user:${user.id}`
      const isOnline = Ws.io.sockets.adapter.rooms.get(room)

      if (isOnline) {
        Ws.io.to(room).emit('new-invitation', {
          created_at: channel.createdAt,
          id: channel.id,
          is_private: channel.isPrivate,
          name: channel.name,
          owner_id: channel.ownerId,
          status: 'invited',
          updated_at: channel.updatedAt,
        })
      }

      return response.ok({ message: 'User added to channel with pending status' })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ message: 'Something went wrong' })
    }
  }

  public async acceptInvitation({ request, response }: HttpContextContract) {
    try {
      const { channelId, userId } = request.only(['channelId', 'userId'])
      if (!channelId || !userId) {
        return response.badRequest({ message: 'Channel ID and User ID are required' })
      }

      const channel = await Channel.findOrFail(channelId)

      // Zmeníme stav používateľa na 'accepted'
      await channel.related('users').sync({ [userId]: { status: 'accepted' } }, false)

      return response.ok({ message: 'User invitation accepted', channel })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ message: 'Something went wrong' })
    }
  }

  public async declineInvitation({ request, response }: HttpContextContract) {
    try {
      const { channelId, userId } = request.only(['channelId', 'userId'])

      if (!channelId || !userId) {
        return response.badRequest({ message: 'Channel ID and User ID are required' })
      }

      const channel = await Channel.findOrFail(channelId)

      // Odstránime používateľa z kanála
      await channel.related('users').detach([userId])

      return response.ok({ message: 'User invitation declined and removed from the channel' })
    } catch (error) {
      console.error(error)
      return response.internalServerError({ message: 'Something went wrong' })
    }
  }
  public async deleteChannel({ auth, request, response }: HttpContextContract) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'You are not logged in' })
      }

      const { channelId } = request.only(['channelId'])
      if (!channelId) {
        return response.badRequest({ message: 'Channel ID is required' })
      }

      const channel = await Channel.findOrFail(channelId)

      // Ak je používateľ vlastníkom, odstráni celý kanál
      if (channel.ownerId === user.id) {
        await channel.delete()
        return response.ok({ message: 'Channel deleted successfully' })
      }

      // Ak nie je vlastníkom, iba ho odstráni z kanála
      await channel.related('users').detach([user.id])
      return response.ok({ message: 'You have been removed from the channel' })
    } catch (error) {
      console.error('Error deleting channel:', error)
      return response.internalServerError({ message: 'Something went wrong' })
    }
  }
}
