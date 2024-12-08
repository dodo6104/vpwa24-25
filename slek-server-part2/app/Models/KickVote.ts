import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Channel from './Channel'
import User from './User'

export default class KickVote extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public channelId: number

  @column()
  public targetUserId: number

  @column()
  public voterUserId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: Date

  // Vzťahy s tabuľkou Channel
  @belongsTo(() => Channel)
  public channel: BelongsTo<typeof Channel>

  // Vzťahy s tabuľkou User pre targetUserId
  @belongsTo(() => User, {
    foreignKey: 'targetUserId',
  })
  public targetUser: BelongsTo<typeof User>

  // Vzťahy s tabuľkou User pre voterUserId
  @belongsTo(() => User, {
    foreignKey: 'voterUserId',
  })
  public voterUser: BelongsTo<typeof User>
}
