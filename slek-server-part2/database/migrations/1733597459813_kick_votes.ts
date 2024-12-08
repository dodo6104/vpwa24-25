import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class KickVotes extends BaseSchema {
  protected tableName = 'kick_votes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id'); // Auto-incrementujúci stĺpec id
      table.integer('channel_id').unsigned().notNullable();
      table.integer('target_user_id').unsigned().notNullable();
      table.integer('voter_user_id').unsigned().notNullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());

      // Zahrnutie referencií na cudzie kľúče
      table.foreign('channel_id').references('channels.id').onDelete('CASCADE');
      table.foreign('target_user_id').references('users.id').onDelete('CASCADE');
      table.foreign('voter_user_id').references('users.id').onDelete('CASCADE');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
