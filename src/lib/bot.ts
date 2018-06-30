import { Client } from 'eris'
import * as fs from 'fs'
import * as readline from 'readline-sync'

import Logger from './util/logger'
import DatabaseManager from './database/database-manager'
import TableManager from './database/table-manager'
import Config from './config'
import { CommandManager } from './module/command/command-manager'
import { ModuleManager } from './module/module-manager'
import Module from './module/module'
import { EventManager } from './module/event/event-manager'
import UserManager from './user-manager'
import BotUtil, { multiPromise, pathExists, createDirectory, getInput } from './util/util'

import TABLES from './default-modules/core/database'
const BTI = TABLES.bot

export default class Bot {

  private directory: string
  private logger: Logger
  util: BotUtil
  private databaseManager: DatabaseManager
  private moduleManager: ModuleManager
  private commandManager: CommandManager
  private eventManager: EventManager
  mainModuleID: number
  table: TableManager
  client: Client
  config: Config
  temp: any

  constructor(directory: string) {
    this.directory = directory
    this.logger = null
    this.util = null
    this.databaseManager = null
    this.table = null
    this.client = null
    this.config = null
    this.temp = {}
  }

  onrestart(bot: Bot, err?: Error) { }

  load(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.logger = new Logger('bot-core')
      this.logger.log('Loading...')
      this.util = new BotUtil(this)
      this.loadConfig('config.json')
      this.client = new Client(this.config.token, {})
      this.databaseManager = new DatabaseManager('storage', this.logger)
      this.moduleManager = new ModuleManager(this)
      await this.databaseManager.load(this.directory).catch(err => { return reject(err) })
      if(this.config.generateFolders) {
        if (!pathExists(this.directory)) createDirectory(this.directory)
      }
      await multiPromise([
        this.loadModule(`${__dirname}/default-modules`).catch(err => { return reject(err) }),
        this.loadModule(this.directory).catch(err => { return reject(err) })
      ])
      this.table = this.databaseManager.tables[BTI.name]
      this.moduleManager.reload()
      this.logger.success('Successfully loaded.')
      resolve()
    })
  }

  loadModule(directory: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.databaseManager.loadFile(`${directory}/database.js`).catch(err => { return reject(err) })
      this.moduleManager.loadDirectory(directory)
      resolve()
    })
  }

  getModule(name: string): Module {
    return this.moduleManager.find(name).data.element
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log('Connecting...')
      this.client.on('ready', () => {
        this.logger.success('Successfully connected.')
        resolve()
      })
      this.client.connect()
    })
  }

  async loadConfig(file: string): Promise<void> {
    let writeConfig = (config) => {
      fs.writeFileSync(`${this.directory}/${file}`, JSON.stringify(config, null, '\t'))
    }

    if (fs.existsSync(`${this.directory}/${file}`)) {
      let config = require(`${this.directory}/${file}`)
      let updated = false
      let neededConfig = new Config()
      for (let key in neededConfig) {
        if (config[key] == null && neededConfig[key] === undefined) {
          if (!updated) this.logger.warn(`Config is not completed! Please fill in the following values...`)
          process.stdout.write(this.logger.getLogString(key))
          config[key] = await getInput()
          updated = true
        }
      }
      if (updated) {
        writeConfig(config)
        this.logger.success('Config file updated.')
      }
      this.config = config
    } else {
      this.logger.warn('No config file detected!\nCreating new config file...')
      let config = new Config()
      for (let key in config) {
        process.stdout.write(this.logger.getLogString(`Enter ${key}: `))
        if (config[key] == null) config[key] = await getInput()
      }
      writeConfig(config)
      this.logger.success('Config file generated')
      this.config = config
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        this.connect().then(resolve, reject)
      }, reject)
    })
  }

  //replace with an exit, dummy, and find a way to make stop actually stop it
  restart(reloadFiles: boolean = false): Promise<Bot> {
    return new Promise(async (resolve, reject) => {
      this.logger.info('Restarting...')
      this.client.disconnect({ reconnect: false })
      if (reloadFiles) {
        Object.keys(require.cache).forEach(function (key) { if (!key.includes('node_modules')) delete require.cache[key] })
        let NewCatbot = require(__filename).default
        let bot = new NewCatbot(this.directory)
        bot.start().then(() => {
          this.onrestart(bot)
          resolve(bot)
        }, err => {
          this.onrestart(bot, err)
          reject(err)
        })
      } else {
        this.temp = {}
        this.start().then(resolve.bind(null, this), reject.bind(null, this))
      }
    })
  }

  stop() {
    this.logger.info('Stopping...')
    this.client.disconnect({ reconnect: false })
  }

  getCommandManager(): CommandManager {
    return this.commandManager
  }

  getEventManager(): EventManager {
    return this.eventManager
  }

  getLogger(): Logger {
    return this.logger
  }

  // Database Functions

  get(key: any, defaultValue: any = null): Promise<any> {
    return this.table.get(key, 'value', defaultValue)
  }

  set(key: any, value: any): Promise<void> {
    return this.table.set(key, { name: 'value', value })
  }
}
