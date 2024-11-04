import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UserController {
  public async index({ response }: HttpContext) {
    try {
      const users = await User.all()
      return response.json(users)
    } catch (error) {
      response.status(500).json({ message: 'Error fetching users', error })
    }
  }
}
