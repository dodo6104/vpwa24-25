import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, afterCreate } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Channel from 'App/Models/Channel'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public createdBy: number

  @column()
  public channelId: number

  @column()
  public content: string

  @column()
  public pinnedUsers: number[] | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  public author: BelongsTo<typeof User>

  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  public channel: BelongsTo<typeof Channel>

  // Lifecycle hook to update the `updatedAt` field of the related channel
  @afterCreate()
  public static async updateChannelUpdatedAt(message: Message) {
    const channel = await Channel.find(message.channelId)
    if (channel) {
      channel.updatedAt = DateTime.local() // Set current time
      await channel.save() // Save update
    }
  }
}
