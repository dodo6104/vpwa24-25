import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Channels extends BaseSchema {
  protected tableName = 'channels'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary() // Primárny kľúč
      table.string('name').notNullable().unique() // Názov kanála musí byť unikátny
      table.boolean('is_private').defaultTo(false).notNullable() // Indikácia, či je kanál privátny
      table.integer('owner_id').unsigned().references('id').inTable('users').onDelete('CASCADE') // Ak používateľ bude zmazaný, zmažú sa aj jeho kanály
      /**
       * Používame timestamptz pre PostgreSQL a DATETIME2 pre MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
