import { IntegrationDefinition } from "@crowbartools/firebot-custom-scripts-types";
import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import * as packageJson from "../package.json";
import { FirebotEvents } from "./enums";
import { StoatIntegrationSettings } from "./types";

export const {
  displayName: STOAT_INTEGRATION_NAME,
  description: STOAT_INTEGRATION_DESCRIPTION,
  author: STOAT_INTEGRATION_AUTHOR,
  version: STOAT_INTEGRATION_VERSION,
} = packageJson;

export const STOAT_INTEGRATION_NAME_AND_AUTHOR = `${STOAT_INTEGRATION_NAME} (by ${STOAT_INTEGRATION_AUTHOR})`;
export const STOAT_INTEGRATION_ID = "oceanity:stoat";
export const STOAT_INTEGRATION_FIREBOT_VERSION = "5";
export const STOAT_INTEGRATION_PACKAGE_URL =
  "https://raw.githubusercontent.com/Oceanity/firebot-stoat/refs/heads/main/package.json";

export const STOAT_RECONNECT_TIMEOUT = 15000;

export const STOAT_INTEGRATION_DEFINITION: IntegrationDefinition<StoatIntegrationSettings> =
  {
    id: STOAT_INTEGRATION_ID,
    name: STOAT_INTEGRATION_NAME,
    description: STOAT_INTEGRATION_DESCRIPTION,
    linkType: "none",
    configurable: true,
    connectionToggle: false,
    settingCategories: {
      auth: {
        title: "Auth",
        settings: {
          token: {
            type: "string",
            default: "",
            title: "Token",
            description:
              "Your Stoat Bot's token (can be obtained by clicking 'Copy Token' in the Edit Bot menu)",
            validation: {
              required: true,
            },
          },
        },
      },
    },
  };

export const STOAT_EVENT_SOURCE: EventSource = {
  id: STOAT_INTEGRATION_ID,
  name: STOAT_INTEGRATION_NAME,
  events: [
    {
      id: FirebotEvents.Connected,
      name: "Connected",
      description: "When the integration connects to the Stoat bot",
    },
    {
      id: FirebotEvents.Message,
      name: "Message",
      description:
        "When a message is received in a channel the Stoat bot has access to",
    },
  ],
};
