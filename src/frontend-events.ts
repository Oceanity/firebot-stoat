import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { stoat } from "./main";

export const initFrontendCommunicator = (
  frontendCommunicator: ScriptModules["frontendCommunicator"],
) => {
  frontendCommunicator.onAsync(
    "stoat:get-servers",
    async (): Promise<Record<string, string>> => {
      const output: Record<string, string> = {};
      stoat.client?.servers.forEach((server) => {
        output[server.id] = server.name;
      });
      return output;
    },
  );

  frontendCommunicator.onAsync(
    "stoat:get-channels",
    async (serverId: string): Promise<Record<string, string>> => {
      const output: Record<string, string> = {};
      stoat.client?.servers.get(serverId)?.channels.forEach((channel) => {
        output[channel.id] = channel.displayName;
      });
      return output;
    },
  );
};
