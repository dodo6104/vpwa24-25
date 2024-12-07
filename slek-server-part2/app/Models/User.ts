import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'

export enum UserStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  DND = 'DND',
}

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public lastname: string

  @column()
  public email: string

  @column()
  public nickname: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public status: UserStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'createdBy',
  })
  public sentMessages: HasMany<typeof Message>

  @manyToMany(() => Channel, {
    pivotTable: 'channel_users',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'channel_id',
    pivotColumns: ['status'], // Načítanie stavu z pivot tabuľky
    pivotTimestamps: true,
  })
  public channels: ManyToMany<typeof Channel>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  /**
   * Add user to a channel with a default status of 'invited'
   */
  public async addToChannel(
    channelId: number,
    status: 'invited' | 'accepted' | 'rejected' = 'invited'
  ) {
    const channel = await Channel.findOrFail(channelId)
    await channel.related('users').attach({
      [this.id]: { status },
    })
  }

  /**
   * Update the user's status in a specific channel
   */
  public async updateChannelStatus(channelId: number, status: 'invited' | 'accepted') {
    const channel = await Channel.findOrFail(channelId)
    await channel.related('users').pivotQuery().where('user_id', this.id).update({ status })
  }

  /**
   * Get the user's status in a specific channel
   */
  public async getChannelStatus(channelId: number): Promise<string | null> {
    const channel = await Channel.findOrFail(channelId)
    const pivotRow = await channel
      .related('users')
      .pivotQuery()
      .where('user_id', this.id)
      .andWhere('channel_id', channelId)
      .first()

    return pivotRow ? pivotRow.status : null
  }
}
