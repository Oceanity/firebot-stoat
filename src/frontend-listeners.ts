import firebot, { FrontendListener } from "@crowbartools/firebot-types";
import { STOAT_INTEGRATION_ID } from "./constants";
import { stoat } from "./main";

export const AllStoatFrontendListeners: Array<FrontendListener> = [
  {
    eventName: "get-servers",
    useAsync: true,
    handler: async (): Promise<Record<string, string>> => {
      const output: Record<string, string> = {};
      stoat?.servers.forEach((server) => {
        output[server.id] = server.name;
      });
      return output;
    },
  },
  {
    eventName: "get-channels",
    useAsync: true,
    handler: async (
      ...args: Array<unknown>
    ): Promise<Record<string, string>> => {
      const [serverId] = args as Array<string | undefined>;
      const output: Record<string, string> = {};
      if (!serverId) {
        firebot.logger.warn(
          "Missing required property 'serverId' in frontend event 'get-channels'",
        );
        return output;
      }
      stoat?.servers.get(serverId)?.channels.forEach((channel) => {
        output[channel.id] = channel.displayName ?? channel.name;
      });
      return output;
    },
  },
].map((frontendFilter) => {
  frontendFilter.eventName = `${STOAT_INTEGRATION_ID}:${frontendFilter.eventName}`;
  return frontendFilter;
});
