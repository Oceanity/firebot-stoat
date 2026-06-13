import firebot from "@crowbartools/firebot-types";
import { Channel, Client, Message, User } from "stoat.js";
import { STOAT_INTEGRATION_ID } from "./constants";
import { FirebotEvents } from "./enums";

export const hookStoatFirebotEvents = async (client: Client) => {
  client.on("ready", () => {
    firebot.logger.info(JSON.stringify(client.user));

    firebot.logger.info(
      `Logged in to Stoat bot as ${client.user?.displayName}`,
    );

    client.user?.edit({
      status: {
        text: "Firebot Integration by Oceanity",
        presence: "Focus",
      },
    });

    firebot.events.trigger(STOAT_INTEGRATION_ID, FirebotEvents.Connected, {
      ...getUserMetadata("stoatBot", client.user),
    });
  });

  client.on("disconnected", () => {
    firebot.logger.warn("Disconnected from Stoat");
  });

  client.on("error", (error) => {
    firebot.logger.error("Connection error", error);
  });

  client.on("messageCreate", async (message) => {
    firebot.events.trigger(STOAT_INTEGRATION_ID, FirebotEvents.Message, {
      ...getUserMetadata("stoatBot", client.user),
      ...getChannelMetadata("stoatChannel", message.channel),
      ...getMessageMetadata("stoatMessage", message),
      ...getUserMetadata("stoatAuthor", message.author),
    });
  });

  client.on("serverMemberJoin", async (member) => {
    firebot.logger.info(`Member Joined: ${JSON.stringify(member)}`);
  });

  client.on("serverMemberLeave", async (member) => {
    firebot.logger.info(`Member Left: ${JSON.stringify(member)}`);
  });

  client.on("messageReactionAdd", (message, userId, emoji) => {
    firebot.logger.info(
      `Reaction Added: ${JSON.stringify(message)}, ${userId}, ${emoji}`,
    );
  });

  client.on("messageReactionRemove", (message, userId, emoji) => {
    firebot.logger.info(
      `Reaction Removed: ${JSON.stringify(message)}, ${userId}, ${emoji}`,
    );
  });
};

const getUserMetadata = (prefix: string = "stoatUser", user?: User) =>
  user
    ? {
        [`${prefix}Id`]: user.id,
        [`${prefix}Name`]: user.username,
        [`${prefix}DisplayName`]: user.displayName,
        [`${prefix}AvatarUrl`]: user.avatarURL,
        [`${prefix}IsOnline`]: user.online,
        [`${prefix}Presence`]: user.presence,
      }
    : {};

const getChannelMetadata = (
  prefix: string = "stoatChannel",
  channel?: Channel,
) =>
  channel
    ? {
        [`${prefix}Id`]: channel.id,
        [`${prefix}DisplayName`]: channel.displayName,
        [`${prefix}Description`]: channel.description,
        [`${prefix}IconUrl`]: channel.iconURL,
        [`${prefix}Url`]: channel.url,
        [`${prefix}IsMature`]: channel.mature,
        [`${prefix}IsVoice`]: channel.isVoice,
      }
    : {};

const getMessageMetadata = (
  prefix: string = "stoatMessage",
  message?: Message,
) =>
  message
    ? {
        [`${prefix}Id`]: message.id,
        [`${prefix}Content`]: message.content,
        [`${prefix}ContentPlain`]: message.contentPlain,
        [`${prefix}Url`]: message.url,
      }
    : {};
