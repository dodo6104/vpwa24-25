import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany, HasMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public isPrivate: boolean

  @column()
  public ownerId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'channelId',
  })
  public messages: HasMany<typeof Message>

  @manyToMany(() => User, {
    pivotTable: 'channel_users', // Názov pivot tabuľky
    pivotForeignKey: 'channel_id', // Stĺpec v pivot tabuľke, ktorý odkazuje na kanál
    pivotRelatedForeignKey: 'user_id', // Stĺpec v pivot tabuľke, ktorý odkazuje na používateľa
    pivotColumns: ['status'], // Načítanie stĺpca 'status' z pivot tabuľky
    pivotTimestamps: true, // Automatické spravovanie časových pečiatok
  })
  public users: ManyToMany<typeof User>
}
