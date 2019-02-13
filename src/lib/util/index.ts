import chalk from "chalk";
import {
  AnyChannel,
  Guild,
  GuildChannel,
  Member,
  PrivateChannel,
  TextChannel,
  User,
  VoiceChannel
} from "eris";
import * as fs from "fs";
import { join } from "path";
import Bot from "../bot";
import Logger from "./logger";

export enum ChannelType {
  TEXT = 0,
  PRIVATE = 1,
  VOICE = 2
}

export default class BotUtil {
  public bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  public syncUsers(guild: Guild): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (guild.unavailable) {
        reject(
          new Error(`Guild '${guild.name}' (id: ${guild.id}) unavaliable`)
        );
      }
      if (guild.memberCount === 0) {
        resolve();
      }
      guild.fetchAllMembers();
      const check = () => {
        guild.shard.once("guildMemberChunk", (g: Guild) => {
          if (g.id === guild.id) {
            if (g.members.size === g.memberCount) {
              resolve();
            } else {
              check();
            }
          }
        });
      };
      check();
    });
  }

  /**
   * This should only be used if options.getAllUsers is set to true in the options passed to the eris client
   * @param userString
   */
  public getUser(userString: string): User {
    userString = this.trimID(userString, "@");
    return this.bot.getClient().users.find(u => u.id === userString);
  }

  public async fetchUser(userString: string): Promise<User> {
    userString = this.trimID(userString, "@");
    for (const r of this.bot.getClient().relationships.values()) {
      if (r.user.id === userString) {
        return r.user;
      }
    }
    for (const g of this.bot.getClient().guilds.values()) {
      await this.syncUsers(g);
      g.members.forEach(m => {
        if (m.id === userString) {
          return m.user;
        }
      });
    }
    return null;
  }

  public async fetchMember(
    userString: string,
    guild: Guild,
    username: boolean = false
  ): Promise<Member> {
    if (guild.unavailable) {
      return null;
    }
    userString = this.trimID(userString, "@");
    await this.syncUsers(guild);
    return (
      guild.members.find(m => m.id === userString) ||
      (username && guild.members.find(m => m.username.startsWith(userString)))
    );
  }

  public getChannel(
    channelString: string,
    types?: ChannelType | ChannelType[]
  ): AnyChannel {
    types = array(types);
    channelString = this.trimID(channelString, "#");
    const channel = this.bot.getClient().getChannel(channelString);
    return types
      ? channel && types.some(t => t === channel.type)
        ? channel
        : null
      : channel;
  }

  public getGuildChannel(
    channelString: string,
    type?: ChannelType.TEXT | ChannelType.VOICE,
    guild?: Guild
  ): GuildChannel {
    if (guild) {
      channelString = this.trimID(channelString, "#");
      const channel = guild.channels.get(channelString);
      if (!type || channel.type === type) {
        return channel;
      } else {
        return null;
      }
    } else {
      for (const channelId in this.bot.getClient().channelGuildMap) {
        if (channelId === channelString) {
          const types = type ? type : [ChannelType.TEXT, ChannelType.VOICE];
          return this.getChannel(channelString, types) as GuildChannel;
        }
      }
      return null;
    }
  }

  public getTextChannel(channelString: string, guild?: Guild): TextChannel {
    return this.getGuildChannel(
      channelString,
      ChannelType.TEXT,
      guild
    ) as TextChannel;
  }

  public getDMChannel(channelString: string): Promise<PrivateChannel> {
    channelString = this.trimID(channelString, "@");
    return this.bot.getClient().getDMChannel(channelString);
  }

  public getVoiceChannel(channelString: string, guild?: Guild): VoiceChannel {
    return this.getGuildChannel(
      channelString,
      ChannelType.VOICE,
      guild
    ) as VoiceChannel;
  }

  public getGuild(guildString: string) {
    return this.bot.getClient().guilds.get(guildString);
  }

  public formatUser(user: User, id: boolean = false): string {
    return chalk.magenta(`${user.username}#${user.discriminator}`) + id
      ? chalk.grey(` (id:${user.id})`)
      : "";
  }

  private trimID(id: string, symbols: string | string[]): string {
    for (const symbol of array(symbols)) {
      if (id.startsWith(`<${symbol}`) && id.endsWith(">")) {
        id = id.slice(2, -1);
        if (id.startsWith("!")) {
          id = id.slice(1);
        }
      }
    }
    return id;
  }
}

export function multiPromise(promises: Promise<any>[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results = [];
    let finished = 0;
    const check = () => {
      finished++;
      if (finished === promises.length) {
        resolve(results);
      }
    };
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(
        data => {
          results[i] = data;
          check();
        },
        err => {
          results[i] = err;
          check();
        }
      );
    }
  });
}

export function isFile(source: string): boolean {
  return fs.lstatSync(source).isFile();
}

export function isDirectory(source: string): boolean {
  return fs.lstatSync(source).isDirectory();
}

export interface GetFilesOptions {
  extensions?: string[];
  trimExtension?: boolean;
}

export function getFiles(
  directory: string,
  { extensions = null, trimExtension = false }: GetFilesOptions = {}
): string[] {
  const files = fs
    .readdirSync(directory)
    .map(name => join(directory, name))
    .filter(isFile);
  const finalFiles: string[] = [];
  for (const file in files) {
    if (files.hasOwnProperty(file)) {
      let newFile = files[file];
      const extension = newFile.split(".").pop();
      if (!(extensions && extensions.find(e => e === extension))) {
        continue;
      }
      newFile = newFile.slice(directory.length + 1);
      if (trimExtension) {
        newFile = newFile
          .split(".")
          .slice(0, -1)
          .join(".");
      }
      finalFiles.push(newFile);
    }
  }
  return finalFiles;
}

export function getDirectories(directory: string): string[] {
  if (directory.endsWith("\\") || directory.endsWith("/")) {
    directory = directory.slice(0, -1);
  }
  const dirs = fs
    .readdirSync(directory)
    .map(name => join(directory, name))
    .filter(isDirectory);
  for (const dir in dirs) {
    if (dirs.hasOwnProperty(dir)) {
      dirs[dir] = dirs[dir].slice(directory.length + 1);
    }
  }
  return dirs;
}

export function pathExists(path: string): boolean {
  return fs.existsSync(path);
}

export function createDirectory(path: string): void {
  fs.mkdirSync(path);
}

export function loadFile(path: string): any {
  if (path.endsWith(".js")) {
    const required = require(path);
    delete require.cache[require.resolve(path)];
    return required.default == null ? required : required.default;
  }
}

export function getInput(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const poll = () => {
      process.stdin.once("readable", () => {
        const chunk = process.stdin.read();
        if (chunk === null) {
          poll();
        } else {
          resolve(chunk.toString().trim());
        }
      });
    };
    poll();
  });
}

export function requireFiles(
  directory: string,
  paths: string[]
): Map<string, any | Error> {
  const results: Map<string, any | Error> = new Map();
  for (const path of paths) {
    if (
      !(
        pathExists(`${directory}/${path}.js`) ||
        pathExists(`${directory}/${path}.ts`)
      )
    ) {
      results.set(path, undefined);
      continue;
    }
    let result;
    try {
      result = require(`${directory}/${path}`);
      if (result.default !== undefined) {
        result = result.default;
      }
    } catch (err) {
      result = err;
    }
    results.set(path, result);
  }
  return results;
}

export function startsWithAny(str: string, arr: string[]): string {
  let longest = "";
  arr.forEach(str2 => {
    if (str2.length > longest.length && str.startsWith(str2)) {
      longest = str2;
    }
  });
  return longest.length === 0 ? null : longest;
}

export function array<T>(x: T | T[]): T[] {
  return x instanceof Array ? x : [x];
}

export function reportErrors(
  logger: Logger,
  itemName: string,
  errors: Map<string, Error>
) {
  if (itemName.length > 0) {
    itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
  }
  for (const errorPair of errors) {
    logger.warn(
      `${itemName} '${errorPair[0]}' could not be loaded: ${errorPair[1]}`
    );
  }
}