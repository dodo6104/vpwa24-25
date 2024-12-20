import Ws from '@ioc:Ruby184/Socket.IO/Ws'
import { Socket } from 'socket.io'
import Message from 'App/Models/Message'
import User, { UserStatus } from 'App/Models/User'
import Channel from 'App/Models/Channel'
import ChannelUser from 'App/Models/ChannelUser'
import { DateTime } from 'luxon'
import KickVote from 'App/Models/KickVote'

Ws.namespace('/')
  .connected(async ({ socket }: { socket: Socket }) => {
    console.log('New WebSocket connection established')

    const userId = socket.handshake.auth?.userId
    if (userId) {
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined room: user:${userId}`)

      const user = await User.findOrFail(userId)

      if (user) {
        await user.updateSocket(socket.id, UserStatus.ONLINE)
      }
    }

    console.log('Socket ID:', socket.id)

    socket.on('joinRoom', (channelid: string) => {
      const rooms = socket.rooms

      if (rooms.has(channelid)) {
        console.log(`Room ${channelid} already exists.`)
      } else {
        console.log(`Creating and joining room: ${channelid}`)
      }

      console.log(`Socket ${socket.id} joining room: ${channelid}`)
      socket.join(channelid)
    })

    socket.on('leaveRoom', (channelid: string) => {
      console.log(`Socket ${socket.id} leaving room: ${channelid}`)
      socket.leave(channelid)
    })

    socket.on('getRooms', () => {
      const rooms = [...Ws.io.sockets.adapter.rooms.keys()]
      console.log(`Rooms for socket ${socket.id}:`, rooms)
      socket.emit('roomsList', rooms)
    })
  })

  .disconnected(async ({ socket }: { socket: Socket }, reason: string) => {
    console.log('WebSocket disconnecting:', socket.id, 'Reason:', reason)

    const user = await User.findBy('socket_id', socket.id)

    if (user) {
      await user.updateSocket(null, UserStatus.ONLINE)
    }
  })

  .on(
    'message',
    async (
      context,
      data: { content: string; channelId: number; userId: number; pinnedUsers: Array<string> }
    ) => {
      const { socket } = context

      try {
        const { content, channelId, userId, pinnedUsers } = data

        if (!content || !channelId || !userId) {
          console.error('Invalid data received:', data)
          return
        }

        const pinusers = await User.query().whereIn('nickname', pinnedUsers).select('id').exec()

        const userIds = pinusers.map((user) => user.id)

        const newMessage = await Message.create({
          content: content,
          createdBy: userId,
          channelId: channelId,
          pinnedUsers: userIds,
        })

        await newMessage.load('author')
        await newMessage.load('channel')

        const result = {
          id: newMessage.id,
          content: newMessage.content,
          channelId: newMessage.channelId,
          createdBy: newMessage.createdBy,
          nickname: newMessage.author?.nickname,
          channelName: newMessage.channel?.name,
          createdAt: newMessage.createdAt.toISO(),
          updatedAt: newMessage.updatedAt.toISO(),
          pinnedUsers: userIds,
        }
        Ws.io.to(`channel:${channelId}`).emit('message', result)

        const channelUser = await ChannelUser.query()
          .where('channel_id', channelId)
          .andWhere('user_id', userId)
          .firstOrFail()

        channelUser.updatedAt = DateTime.now()
        await channelUser.save()

        console.log('Message successfully saved and broadcasted:', result)
      } catch (error) {
        console.error('Error while processing message:', error)
      }
    }
  )
  .on(
    'invitation',
    async (context, data: { channelId: number; nickname: string; userId: number }) => {
      const { socket } = context
      try {
        const { channelId, nickname, userId } = data

        // Find the user and channel
        const user = await User.query().where('nickname', nickname).first()
        const channel = await Channel.findOrFail(channelId)
        if (!user) {
          return socket.emit('error', { message: 'User not found' })
        }
        if (user.id === userId) {
          return socket.emit('error', { message: 'You cannot invite yourself' })
        } else if (channel.ownerId !== Number(userId) && channel.isPrivate) {
          return socket.emit('error', { message: 'You are not the owner of this channel' })
        }
        const existingUser = await channel
          .related('users')
          .query()
          .where('user_id', user.id)
          .first()

        if (String(existingUser?.$extras?.pivot_status) === 'accepted') {
          return socket.emit('error', { message: 'User is already a member of this channel' })
        } else if (String(existingUser?.$extras?.pivot_status) === 'invited') {
          return socket.emit('error', { message: 'User has already been invited' })
        } else if (
          String(existingUser?.$extras?.pivot_status) === 'banned' &&
          channel.ownerId !== Number(userId)
        ) {
          return socket.emit('error', { message: 'User has been banned from this channel' })
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

        console.log('Invitation successfully saved and broadcasted.')

        socket.emit('success', { message: 'Invitation sent successfully.' })
      } catch (error) {
        console.error('Error while processing invitation:', error)

        socket.emit('error', { message: 'Failed to process invitation. Please try again.' })
      }
    }
  )

Ws.namespace('/').on('reload_channels', async (context, data: { userId: number }) => {
  const { socket } = context

  try {
    const { userId } = data

    const user = await User.findOrFail(userId)
    await user.load('channels')

    const serializedUser = {
      ...user.toJSON(),
      channels: user.channels.map((channel) => ({
        ...channel.toJSON(),
        status: channel.$extras.pivot_status,
        pivot_created_at: channel.$extras.pivot_created_at,
        pivot_updated_at: channel.$extras.pivot_updated_at,
      })),
    }

    socket.emit('update_channel_success', {
      event: 'reload_channels',
      message: 'Channel updated successfully',
      updatedChannels: serializedUser.channels,
      user: serializedUser,
    })

    console.log('Channel updated successfully and response sent')
  } catch (error) {
    console.error('Error updating channel:', error)

    socket.emit('update_channel_error', {
      message: 'Failed to update the channel',
      error: error.message,
    })
  }
})
Ws.namespace('/').on(
  'update_channel',
  async (context, data: { channelId: number; userId: number }) => {
    const { socket } = context

    try {
      const { channelId, userId } = data

      const channelUser = await ChannelUser.query()
        .where('channel_id', channelId)
        .andWhere('user_id', userId)
        .firstOrFail()

      const user = await User.findOrFail(userId)
      await user.load('channels')

      const serializedUser = {
        ...user.toJSON(),
        channels: user.channels.map((channel) => ({
          ...channel.toJSON(),
          status: channel.$extras.pivot_status,
          pivot_created_at: channel.$extras.pivot_created_at,
          pivot_updated_at: channel.$extras.pivot_updated_at,
        })),
      }

      channelUser.updatedAt = DateTime.now()
      await channelUser.save()

      socket.emit('update_channel_success', {
        event: 'update_channel',
        message: 'Channel updated successfully',
        updatedChannels: serializedUser.channels,
        user: serializedUser,
      })

      console.log('Channel updated successfully and response sent')
    } catch (error) {
      console.error('Error updating channel:', error)

      socket.emit('update_channel_error', {
        message: 'Failed to update the channel',
        error: error.message,
      })
    }
  }
)
Ws.namespace('/').on(
  'load_messages',
  async (context, data: { channelId: number; lastMesgId: number }) => {
    const { channelId, lastMesgId } = data
    const { socket } = context

    try {
      let latestMessage = lastMesgId

      if (lastMesgId === -1) {
        const message = await Message.query().orderBy('created_at', 'desc').first()
        latestMessage = message ? message.id : -2
        latestMessage += 1
      }
      if (latestMessage === -2) {
        return []
      }
      const messages = await Message.query()
        .where('channel_id', channelId)
        .andWhere('id', '<', latestMessage)
        .preload('author')
        .preload('channel')
        .orderBy('created_at', 'desc')
        .limit(30)
      const formattedMessages = messages
        .map((message) => ({
          id: message.id,
          content: message.content,
          channelId: message.channelId,
          createdBy: message.createdBy,
          nickname: message.author?.nickname,
          channelName: message.channel?.name,
          createdAt: message.createdAt.toISO(),
          updatedAt: message.updatedAt.toISO(),
          pinnedUsers: message.pinnedUsers,
        }))
        .reverse()

      socket.emit('messages_loaded', { success: true, messages: formattedMessages })
    } catch (error) {
      console.error('Error loading messages:', error)
      socket.emit('messages_loaded', { success: false, error: 'Failed to load messages.' })
    }
  }
)

Ws.namespace('/').on(
  'add_channel',
  async (context, data: { channel: { name: string; isPrivate: boolean }; userId: number }) => {
    const { name: channelname, isPrivate } = data.channel
    const { userId } = data
    const { socket } = context
    try {
      if (channelname.length < 3) {
        socket.emit('channel_created', {
          message: 'Channel name must be at least 3 characters long.',
          channel: null,
          status: 'error',
        })
        return
      }

      const existingChannel = await Channel.query().where('name', channelname).first()
      if (existingChannel) {
        if (await ChannelUser.query().where({ channelId: existingChannel.id, userId }).first()) {
          socket.emit('channel_created', {
            message: 'You are already a member of this channel',
            channel: existingChannel,
            status: 'error',
          })
          return
        } else if (existingChannel.isPrivate) {
          socket.emit('channel_created', {
            message: 'This channel is private. You need an invitation to join.',
            channel: existingChannel,
            status: 'error',
          })
          return
        }

        await existingChannel.related('users').sync({ [userId]: { status: 'accepted' } }, false)
        socket.emit('channel_created', {
          message: 'You have joined the channel successfully',
          channel: existingChannel,
          status: 'success',
        })
        return
      }
      const channel = await Channel.create({
        name: channelname,
        isPrivate,
        ownerId: userId,
      })

      await channel.related('users').attach({
        [userId]: { status: 'accepted' },
      })

      socket.emit('channel_created', {
        message: 'Channel created successfully',
        channel: channel,
        status: 'success',
      })
    } catch (error) {
      console.error('Error creating channel:', error)
    }
  }
)
Ws.namespace('/').on(
  'accept_invitation',
  async (context, data: { channelId: Number; userId: number }) => {
    const { channelId, userId } = data

    try {
      const channel = await Channel.findOrFail(channelId)
      await channel.related('users').sync({ [userId]: { status: 'accepted' } }, false)
      const user = await User.findOrFail(userId)
      await user.load('channels')

      // Serialize the user data with channel pivot data
      const serializedUser = {
        ...user.toJSON(),
        channels: user.channels.map((channel) => ({
          ...channel.toJSON(),
          status: channel.$extras.pivot_status,
          pivot_created_at: channel.$extras.pivot_created_at,
          pivot_updated_at: channel.$extras.pivot_updated_at,
        })),
      }
      context.socket.emit('update_channel_success', {
        event: 'accept_invitation',
        message: 'Channel updated successfully',
        updatedChannels: serializedUser.channels,
        user: serializedUser,
      })
    } catch (error) {
      console.error('Error updating user invitation status:', error)
      context.socket.emit('invitation_error', { success: false, message: error.message })
    }
  }
)

Ws.namespace('/').on(
  'delete_channel',
  async (context, data: { channelId: number; userId: number }) => {
    const { channelId, userId } = data
    const { socket } = context

    try {
      const channel = await Channel.findOrFail(channelId)
      if (Number(channel.ownerId) === Number(userId)) {
        // Ak používateľ je vlastníkom kanála, odstrániť kanál
        await channel.delete()

        // Informovať všetkých používateľov o odstránení kanála
        Ws.io.to(`channel:${channelId}`).emit('channel_deleted', {
          message: `Channel ${channel.name} has been deleted`,
          channelId: channelId,
        })

        console.log(`Channel ${channelId} deleted by owner ${userId}`)
      } else {
        await channel.related('users').detach([userId])

        socket.emit('channel_deleted', {
          message: `You have left the channel ${channel.name}`,
          channelId: channelId,
        })

        console.log(`User ${userId} left channel ${channelId}`)
      }

      console.log('Channel updates broadcasted successfully')
    } catch (error) {
      console.error('Error updating channel:', error)

      // Informovať klienta o chybe
      socket.emit('delete_channel_error', {
        success: false,
        message: error.message,
      })
    }
  }
)
Ws.namespace('/').on(
  'typing',
  async (context, data: { channelId: number; userId: number; message: string }) => {
    const { socket } = context
    const { channelId, userId, message } = data

    try {
      const user = await User.findOrFail(userId)
      socket
        .to(`channel:${channelId}`)
        .emit('typing', { userId, message, nickname: user.nickname, channelId })
    } catch (error) {
      console.error('User not found or an error occurred:', error.message)

      socket.emit('error', { message: 'User not found or an internal error occurred' })
    }
  }
)
Ws.namespace('/').on(
  'kick_member',
  async (
    context,
    {
      channelId,
      targetUserName,
      voterUserId,
    }: { channelId: number; targetUserName: string; voterUserId: number }
  ) => {
    const { socket } = context

    try {
      if (!targetUserName) {
        console.error('Target username is undefined')
        return
      }
      console.log('Received inputs:', { channelId, targetUserName, voterUserId })
      console.log('Fetching target user...')
      const targetUser = await User.query().where('nickname', targetUserName).first()

      if (!targetUser) {
        console.error('Target user not found:', targetUserName)
        socket.emit('error', { message: 'Target user not found' })
        return
      }

      if (Number(targetUser.id) === Number(voterUserId)) {
        console.error('Cannoct kick yourself:', targetUserName)
        socket.emit('error', { message: 'Cannoct kick yourself' })
        return
      }
      const targetUserId = targetUser.id
      console.log('Fetched target user:', targetUserId)

      const voterIsMember = await ChannelUser.query()
        .where('channel_id', channelId)
        .andWhere('user_id', voterUserId)
        .first()

      if (!voterIsMember) {
        socket.emit('error', {
          event: 'kick_member',
          message: 'Nie ste členom tohto kanála.',
        })
        return
      }

      const existingVote = await KickVote.query()
        .where('channel_id', channelId)
        .andWhere('target_user_id', targetUserId)
        .andWhere('voter_user_id', voterUserId)
        .first()

      if (existingVote) {
        socket.emit('error', {
          event: 'kick_member',
          message: 'Už ste hlasovali za vykopnutie tohto používateľa.',
        })
        console.log('existing vote')
        return
      }

      await KickVote.create({
        channelId,
        targetUserId,
        voterUserId,
      })

      const voteCount = await KickVote.query()
        .where('channel_id', channelId)
        .andWhere('target_user_id', targetUserId)
        .count('* as total')

      const totalVotes = voteCount[0]?.$extras?.total || 0
      console.log(`Current vote count for user ${targetUserName}: ${totalVotes}`)

      if (totalVotes >= 3) {
        const updateStatus = await ChannelUser.query()
          .where('channel_id', channelId)
          .andWhere('user_id', targetUserId)
          .update({ status: 'Banned' })

        if (updateStatus) {
          console.log(`User ${targetUserName} status updated to 'Banned' successfully.`)
        } else {
          console.error(`Failed to update status for user ${targetUserName}.`)
        }

        socket.broadcast.emit('succes', {
          event: 'kick_member',
          message: `Používateľ ${targetUserName} bol trvalo vykopnutý z kanála.`,
          userId: targetUserId,
        })
      } else {
        socket.emit('success', {
          event: 'kick_member',
          message: `Hlas pre vykopnutie používateľa ${targetUserName} bol zaznamenaný.`,
          targetUserId,
          votes: totalVotes,
        })
      }
    } catch (error) {
      console.error('Chyba pri spracovaní kick_member:', error)

      socket.emit('kick_error', {
        event: 'kick_member',
        message: 'Vyskytla sa chyba pri spracovaní príkazu.',
      })
    }
  }
)

Ws.namespace('/').on(
  'list_members',
  async (context, data: { channelId: number; userId: number }) => {
    const { channelId, userId } = data
    const { socket } = context
    const users = await User.query()
      .whereIn('id', (builder) => {
        builder
          .from('channel_users')
          .select('user_id')
          .where('channel_id', channelId)
          .where('status', 'accepted')
      })
      .whereNot('id', userId)
      .select('id', 'nickname', 'status')
      .exec()

    socket.emit('list_members_success', {
      event: 'list_members',
      message: 'Members fetched successfully',
      members: users,
    })
  }
)
Ws.namespace('/').on(
  'revoke-user',
  async (context, data: { channelId: number; userId: number; username: string }) => {
    const { channelId, userId, username } = data
    const { socket } = context

    const channel = await Channel.findOrFail(channelId)

    if (Number(channel.ownerId) !== Number(userId)) {
      socket.emit('revoke_error', {
        success: false,
        message: 'Members  connot revoke from private channel.',
      })
      return
    }
    const targetUser = await User.query().where('nickname', username).first()
    if (!targetUser) {
      socket.emit('revoke_error', {
        success: false,
        message: 'Target user not found.',
      })
      return
    }

    const room = `user:${targetUser.id}`
    Ws.io.to(room).emit('refresh')

    if (Number(channel.ownerId) === Number(targetUser.id)) {
      socket.emit('revoke_error', {
        success: false,
        message: 'Owner cannot be revoked from own channel.',
      })
      return
    }
    await channel.related('users').detach([targetUser.id])

    console.log(`User ${targetUser.id} left channel ${channelId}`)
  }
)

Ws.namespace('/').on('change_status', async (context, data: { userId: number; status: string }) => {
  const { userId, status } = data
  const { socket } = context

  const user = await User.findOrFail(userId)
  if (!user) {
    return
  }

  user.status = status as UserStatus
  await user.save()
  // if (status === 'Offline') {
  //   socket.leaveAll()
  // } else if (status === 'Online') {
  //   socket.connected()
  // }
})
