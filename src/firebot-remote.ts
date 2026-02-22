import { eventManager, logger } from "@oceanity/firebot-helpers/firebot";
import { Channel, Client, Message, User } from "stoat.js";
import { STOAT_INTEGRATION_ID } from "./constants";
import { FirebotEvents } from "./enums";

export class FirebotRemote {
  readonly #client: Client;

  constructor(client: Client) {
    this.#client = client;
  }

  init() {
    this.#client.on("ready", () => {
      logger.info(JSON.stringify(this.#client.user));
      eventManager.triggerEvent(STOAT_INTEGRATION_ID, FirebotEvents.Connected, {
        ...this.#getUserMetadata("stoatBot", this.#client.user),
      });
    });

    this.#client.on("messageCreate", async (message) => {
      eventManager.triggerEvent(STOAT_INTEGRATION_ID, FirebotEvents.Message, {
        ...this.#getUserMetadata("stoatBot", this.#client.user),
        ...this.#getChannelMetadata("stoatChannel", message.channel),
        ...this.#getMessageMetadata("stoatMessage", message),
        ...this.#getUserMetadata("stoatAuthor", message.author),
      });
    });

    this.#client.on("serverMemberJoin", async (member) => {
      logger.info(`Member Joined: ${JSON.stringify(member)}`);
    });

    this.#client.on("serverMemberLeave", async (member) => {
      logger.info(`Member Left: ${JSON.stringify(member)}`);
    });

    this.#client.on("messageReactionAdd", (message, userId, emoji) => {
      logger.info(
        `Reaction Added: ${JSON.stringify(message)}, ${userId}, ${emoji}`,
      );
    });

    this.#client.on("messageReactionRemove", (message, userId, emoji) => {
      logger.info(
        `Reaction Removed: ${JSON.stringify(message)}, ${userId}, ${emoji}`,
      );
    });
  }

  #getUserMetadata = (prefix: string = "stoatUser", user: User) => ({
    [`${prefix}Id`]: user.id,
    [`${prefix}Name`]: user.username,
    [`${prefix}DisplayName`]: user.displayName,
    [`${prefix}AvatarUrl`]: user.avatarURL,
    [`${prefix}IsOnline`]: user.online,
    [`${prefix}Presence`]: user.presence,
  });

  #getChannelMetadata = (
    prefix: string = "stoatChannel",
    channel: Channel,
  ) => ({
    [`${prefix}Id`]: channel.id,
    [`${prefix}DisplayName`]: channel.displayName,
    [`${prefix}Description`]: channel.description,
    [`${prefix}IconUrl`]: channel.iconURL,
    [`${prefix}Url`]: channel.url,
    [`${prefix}IsMature`]: channel.mature,
    [`${prefix}IsVoice`]: channel.isVoice,
  });

  #getMessageMetadata = (
    prefix: string = "stoatMessage",
    message: Message,
  ) => ({
    [`${prefix}Id`]: message.id,
    [`${prefix}Content`]: message.content,
    [`${prefix}ContentPlain`]: message.contentPlain,
    [`${prefix}Url`]: message.url,
  });
}
