/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import './socket'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('register', 'AuthController.register')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth')
  Route.get('me', 'AuthController.me').middleware('auth')
  Route.put('status', 'AuthController.updateStatus').middleware('auth')
  Route.post('channels', 'ChannelsController.create').middleware('auth')
  Route.get('channels/:channelId/messages', 'MessagesController.getMessages').middleware('auth')
  Route.post('channels/add', 'ChannelsController.addUser').middleware('auth')
  Route.put('accept-invitation', 'ChannelsController.acceptInvitation').middleware('auth')
  Route.put('decline-invitation', 'ChannelsController.declineInvitation').middleware('auth')
  Route.post('message/send', 'MessagesController.sendMessage').middleware('auth')
  Route.put('delete-channel', 'ChannelsController.deleteChannel').middleware('auth')
}).prefix('auth')
