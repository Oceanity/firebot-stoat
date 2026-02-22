import {
  IntegrationController,
  IntegrationData,
  IntegrationEvents,
} from "@crowbartools/firebot-custom-scripts-types";
import { logger } from "@oceanity/firebot-helpers/firebot";
import { Client } from "stoat.js";
import { setTimeout } from "timers";
import { TypedEmitter } from "tiny-typed-emitter";
import { STOAT_RECONNECT_TIMEOUT } from "./constants";
import { FirebotRemote } from "./firebot-remote";
import { StoatIntegrationSettings } from "./types";

class IntegrationEventEmitter extends TypedEmitter<IntegrationEvents> {}

export class StoatIntegration
  extends IntegrationEventEmitter
  implements IntegrationController<StoatIntegrationSettings>
{
  constructor() {
    super();
  }

  connected: boolean = false;
  client?: Client;

  #remote: FirebotRemote;

  init(
    _linked: boolean,
    integrationData: IntegrationData<StoatIntegrationSettings>,
  ): void | PromiseLike<void> {
    this.#initStoatClient(integrationData.userSettings);
  }

  onUserSettingsUpdate?(
    integrationData: IntegrationData<StoatIntegrationSettings>,
  ): void | PromiseLike<void> {
    this.#initStoatClient(integrationData.userSettings);
  }

  #initStoatClient(settings?: StoatIntegrationSettings) {
    if (this.client) {
      try {
        this.client.user.edit({
          status: {
            presence: "Invisible",
          },
        });
        this.client.removeAllListeners();
      } catch (error) {
        logger.warn(
          "Could not properly deconstruct existing Stoat Client",
          error,
        );
      }
    }

    const token = settings?.auth?.token;

    if (!token) {
      logger.warn(
        "Missing required setting 'Token', cannot initialize Stoat Client",
      );

      return;
    }

    logger.info("Stoat: Logging in to Stoat Bot");

    try {
      this.client = new Client();

      this.#remote = new FirebotRemote(this.client);
      this.#remote.init();

      this.client.once("ready", () => {
        logger.info(
          `Stoat: Logged in to Stoat bot as ${this.client.user.displayName}`,
        );

        this.client.user.edit({
          status: {
            text: "Firebot Integration by Oceanity",
            presence: "Focus",
          },
        });
      });

      this.client.on("disconnected", () => {
        logger.warn(
          `Stoat: Connection lost, reconnecting in ${STOAT_RECONNECT_TIMEOUT / 1000} seconds`,
        );

        setTimeout(() => this.#initStoatClient, STOAT_RECONNECT_TIMEOUT);
      });

      this.client.on("error", (error) => {
        logger.error(
          `Stoat: Connection error, reconnecting in ${STOAT_RECONNECT_TIMEOUT / 1000} seconds`,
          error,
        );

        setTimeout(() => this.#initStoatClient, STOAT_RECONNECT_TIMEOUT);
      });

      this.client.loginBot(token);
    } catch (error) {
      if (this.connected) {
        this.connected = false;
      }

      logger.error("Error connecting to Stoat bot", error);
      return;
    }

    // Event Hooks
  }
}
