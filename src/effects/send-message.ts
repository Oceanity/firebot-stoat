import firebot, { EffectType } from "@crowbartools/firebot-types";
import { stoat } from "../main";
import optionsTemplate from "./send-message.html";

type EffectModel = {
  selectMode?: string;
  message?: string;
  session?: string;
  selectedServer?: string;
  selectedChannel?: string;
  sendAsReply?: boolean;
};

export const SendMessageEffectType: EffectType<EffectModel> = {
  definition: {
    id: "send-chat-message",
    name: "Send Stoat Messages",
    description: "Sends a message to the specified Stoat server/channel",
    icon: "fad fa-comment-lines",
    categories: ["integrations"],
    outputs: [],
  },
  optionsTemplate,
  optionsController: ($scope, backendCommunicator: any) => {
    $scope.isMessageEvent =
      $scope.trigger === "event" &&
      ["oceanity:stoat:message"].includes($scope.triggerMeta?.triggerId);

    $scope.getServers = async (): Promise<void> => {
      $scope.servers = backendCommunicator
        .fireEventAsync("oceanity:stoat:get-servers")
        .then((data: Record<string, string>) => {
          $scope.servers = data;
        });
    };

    $scope.getServers();

    $scope.getChannels = (): void => {
      if (!$scope.effect.selectedServer) {
        return;
      }

      backendCommunicator
        .fireEventAsync(
          "oceanity:stoat:get-channels",
          $scope.effect.selectedServer,
        )
        .then((data: Record<string, string>) => {
          $scope.channels = data;

          if (
            !!$scope.effect.selectedChannel &&
            !Object.keys($scope.channels).includes(
              $scope.effect.selectedChannel,
            )
          ) {
            // Channel does not exist in server, clear
            delete $scope.effect.selectedChannel;
          }
        });
    };

    $scope.getChannels();

    $scope.selectModes = {
      list: "Select from list",
      // custom: "Manually enter a name",
    };

    if ($scope.isMessageEvent) {
      $scope.selectModes = {
        associated: "Associated Stoat Channel",
        ...($scope.selectModes as Object),
      };
    }

    if (!$scope.effect.selectMode) {
      $scope.effect.selectMode = Object.keys($scope.selectModes)[0];
    }
  },
  optionsValidator: (effect) => {
    const errors: Array<string> = [];
    if (
      effect.selectMode === "list" &&
      (!effect.selectedServer || !effect.selectedChannel)
    ) {
      errors.push("Select a server and channel from the list");
    }
    if (!effect.message?.length) {
      errors.push("Please insert a message to send");
    }
    return errors;
  },
  onTriggerEvent: async ({ effect, trigger }) => {
    try {
      const message = {
        content: effect.message,
        replies: !!effect.sendAsReply
          ? [
              {
                id:
                  (trigger.metadata.eventData?.stoatMessageId as string) ?? "",
                mention: true,
                fail_if_not_exists: false,
              },
            ]
          : undefined,
      };
      switch (effect.selectMode) {
        case "associated": {
          if (!trigger.metadata.eventData?.stoatChannelId) {
            throw new Error(
              "Trigger metadata has no associated 'stoatChannelId'",
            );
          }

          const channel = await stoat?.channels.fetch(
            `${trigger.metadata.eventData.stoatChannelId}`,
          );

          await channel?.sendMessage(message);

          break;
        }

        case "list": {
          if (!effect.selectedChannel) {
            throw new Error("No channel selected to send Stoat message to");
          }

          await stoat?.channels
            ?.get(effect.selectedChannel)
            ?.sendMessage(message);

          break;
        }

        // case "custom": {
        //   return client
        //     .findSession(effect.session)
        //     ?.messages.sendChat(effect.message);
        // }
      }

      return {
        success: true,
      };
    } catch (error) {
      firebot.logger.error("Error running Send Stoat Message effect", error);

      return {
        success: false,
      };
    }
  },
};
