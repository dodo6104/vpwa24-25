import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import RegisterUserValidator from 'App/Validators/RegisterUserValidator'

export default class AuthController {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async register({ request }: HttpContextContract) {
    const data = await request.validate(RegisterUserValidator)
    const user = await User.create(data)
    // join user to general channel

    return user
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async login({ auth, request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      return await auth.use('api').attempt(email, password)
    } catch {
      return response.unauthorized({
        errors: [{ field: 'credentials', message: 'Invalid email or password' }],
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async logout({ auth }: HttpContextContract) {
    return auth.use('api').logout()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  async me({ auth, response }: HttpContextContract) {
    try {
      // Overenie, či je používateľ prihlásený
      if (!auth.user) {
        return response.unauthorized({ error: 'You are not logged in' })
      }

      // Overenie, či používateľ stále existuje v databáze
      const user = await User.find(auth.user.id)
      if (!user) {
        // Ak používateľ neexistuje, zneplatni token
        await auth.use('api').revoke()
        return response.unauthorized({ error: 'User does not exist or token is invalid' })
      }

      await user.load('channels')
      const serializedUser = {
        ...user.toJSON(),
        channels: user.channels.map((channel) => ({
          ...channel.toJSON(),
          status: channel.$extras.pivot_status, // Pridaj pivot status
          pivot_created_at: channel.$extras.pivot_created_at,
          pivot_updated_at: channel.$extras.pivot_updated_at,
        })),
      }

      return response.json(serializedUser)
    } catch (error) {
      console.error('Error in /auth/me:', error)
      return response.internalServerError({ error: 'Something went wrong' })
    }
  }
  public async updateStatus({ auth, request, response }: HttpContextContract) {
    try {
      // Overenie, či je používateľ prihlásený
      if (!auth.user) {
        return response.unauthorized({ error: 'You are not logged in' })
      }

      const status = request.input('status') // Získanie nového statusu z requestu

      // Povolené hodnoty statusu
      const allowedStatuses = ['Online', 'Offline', 'DND', 'MENTION_ONLY']
      if (!allowedStatuses.includes(status)) {
        return response.badRequest({ error: 'Invalid status value' })
      }

      // Aktualizácia statusu používateľa
      const user = await User.find(auth.user.id)
      if (!user) {
        return response.notFound({ error: 'User not found' })
      }

      user.status = status
      await user.save()

      return response.ok({ message: 'Status updated successfully', status: user.status })
    } catch (error) {
      console.error('Error updating status:', error)
      return response.internalServerError({ error: 'Something went wrong' })
    }
  }
}
