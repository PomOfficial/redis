/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project sequelize-core
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

import {CreatePlugin} from "@pomegranate/plugin-tools";
import {RedisClient, createClient} from "redis";
import Bluebird from 'bluebird'

export * from 'redis'

export const Plugin = CreatePlugin('merge')
  .variables({
    host: 'localhost',
    port: 6379,
    password: null,
    clientOptions: {}
  })
  .configuration({
    name: 'Redis',
    injectableParam: 'Redis',
  })
  .hooks({
    load: async (Injector,PluginVariables, PluginLateError, PluginLogger) => {
      let client = createClient(PluginVariables.port, PluginVariables.host, PluginVariables.clientOptions)
      client.on('error', (err) => {
        PluginLateError(err)
      })
      return new Bluebird((resolve, reject) => {
        client.on('ready', () => {
          resolve(client)
        })
      })
    },
    start: async (PluginVariables, PluginLogger, Redis) => {
      PluginLogger.log('Ensuring connection.', 2)
      if(!Redis.connected){
        throw new Error('Redis client is not connected at start hook.')
      }
      PluginLogger.log('connection available.', 2)
    },
    stop: async (PluginLogger, Redis) => {
      return new Bluebird((resolve) => {
        PluginLogger.log('Closing connection.')
        Redis.on('end', () => {
          resolve(true)
        })
        Redis.quit()
      })
    }
  })
