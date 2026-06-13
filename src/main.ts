import firebot, { Plugin, PluginContext } from "@crowbartools/firebot-types";
import { Client } from "stoat.js";
import {
  STOAT_EVENT_SOURCE,
  STOAT_INTEGRATION_AUTHOR,
  STOAT_INTEGRATION_DESCRIPTION,
  STOAT_INTEGRATION_NAME,
  STOAT_INTEGRATION_VERSION,
  STOAT_PLUGIN_ICON_BACKGROUND,
  STOAT_PLUGIN_ICON_DATA_URI,
} from "./constants";
import { AllStoatEffectTypes } from "./effects";
import { hookStoatFirebotEvents } from "./event-handler";
import { AllStoatFrontendListeners } from "./frontend-listeners";
import { AllStoatReplaceVariables } from "./replace-variables";

export let stoat: Client | null = null;

type Params = {
  token: string;
};

const plugin: Plugin<Params> = {
  manifest: {
    name: STOAT_INTEGRATION_NAME,
    description: STOAT_INTEGRATION_DESCRIPTION,
    icon: {
      type: "custom",
      url: STOAT_PLUGIN_ICON_DATA_URI,
      backgroundColor: STOAT_PLUGIN_ICON_BACKGROUND,
    },
    author: STOAT_INTEGRATION_AUTHOR,
    version: STOAT_INTEGRATION_VERSION,
  },
  parametersSchema: [
    {
      name: "token",
      title: "Access Token",
      description:
        "Your Stoat Bot's access token (can be obtained by clicking 'Copy Token' in the Edit Bot menu)",
      type: "string",
      default: "",
    },
  ],
  registers: {
    effects: AllStoatEffectTypes,
    eventSources: [STOAT_EVENT_SOURCE],
    frontendListeners: AllStoatFrontendListeners,
    variables: AllStoatReplaceVariables,
  },
  onLoad: async (context: PluginContext<Params>) => {
    await connect(context);
  },
  onParameterUpdate: async (context: PluginContext<Params>) => {
    await connect(context);
  },
  onUnload: async () => {
    await disconnect();
  },
};

const connect = async (context: PluginContext<Params>) => {
  disconnect();

  try {
    stoat = new Client();

    await hookStoatFirebotEvents(stoat);

    await stoat.loginBot(context.parameters.token);
  } catch (error) {
    firebot.logger.error("Error initializing Stoat client", error);
  }
};

const disconnect = async () => {
  if (!stoat) {
    return;
  }

  stoat.removeAllListeners();

  stoat = null;
};

export default plugin;
