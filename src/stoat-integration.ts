import {
  IntegrationController,
  IntegrationData,
  IntegrationEvents,
} from "@crowbartools/firebot-custom-scripts-types";
import { logger } from "@oceanity/firebot-helpers/firebot";
import { Client } from "stoat.js";
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

  #token: string;
  #remote: FirebotRemote;
  #timeoutId?: NodeJS.Timeout;

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
    logger.info("Stoat: Initializing the Stoat Integration...");

    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
    }

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

    if (settings) {
      this.#token = settings?.auth?.token ?? this.#token;
    }

    if (!this.#token) {
      logger.warn(
        "Missing required setting 'Token', cannot initialize Stoat Client",
      );

      return;
    }

    try {
      this.client = new Client();

      this.#remote = new FirebotRemote(this.client);
      this.#remote.init();

      this.client.once("ready", () => {
        logger.info(
          `Stoat: Logged in to Stoat bot as ${this.client.user.displayName}`,
        );
      });

      this.client.on("disconnected", this.#onDisconnect);
      this.client.on("error", this.#onError);

      this.client.loginBot(this.#token);
    } catch (error) {
      if (this.connected) {
        this.connected = false;
      }

      logger.error("Error connecting to Stoat bot", error);
      return;
    }
  }

  #reconnect = () => {
    if (!this.#timeoutId) {
      logger.info(
        `Stoat: Attempting to reconnect in ${STOAT_RECONNECT_TIMEOUT / 1000} seconds...`,
      );
      this.#timeoutId = setTimeout(
        () => this.#initStoatClient,
        STOAT_RECONNECT_TIMEOUT,
      );
    }
  };

  #onError = (error: Error) => {
    logger.error("Stoat: Client has encountered an error", error);
    this.#reconnect();
  };

  #onDisconnect = () => {
    logger.warn("Stoat: Lost connection to Stoat server");
    this.#reconnect();
  };
}
