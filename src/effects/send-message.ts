import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { logger } from "@oceanity/firebot-helpers/firebot";
import { stoat } from "../main";

type Props = {
  selectMode?: string;
  message?: string;
  session?: string;
  selectedServer?: string;
  selectedChannel?: string;
  sendAsReply?: boolean;
};

export const SendMessageEffectType: Effects.EffectType<Props, unknown, void> = {
  definition: {
    id: "send-chat-message",
    name: "Send Stoat Messages",
    description: "Sends a message to the specified Stoat server/channel",
    icon: "fad fa-comment-lines",
    categories: ["integrations"],
    outputs: [],
  },
  optionsTemplate: `
    <eos-container header="Channel">
      <firebot-select
        options="selectModes"
        selected="effect.selectMode"
        style="margin-bottom: 20px;" />

      <div ng-if="effect.selectMode === 'list' && !!servers" style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 20px;">
        <firebot-select
          options="servers"
          selected="effect.selectedServer"
          on-update="getChannels()" />
        <button class="btn btn-link" ng-click="getServers()">Refresh servers</button>
      </div>

      <div ng-if="effect.selectMode === 'list' && !!effect.selectedServer && !!channels" style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 20px;">
        <firebot-select
          options="channels"
          selected="effect.selectedChannel" />
        <button class="btn btn-link" ng-click="getChannels()">Refresh channels</button>
      </div>

      <div ng-if="effect.selectMode === 'custom'" style="margin-bottom: 20px;">
        <firebot-input
          model="effect.session"
          placeholder-text="Enter session name, slot name or hostname (will use first match)"
          menu-position="under" />
      </div>
    </eos-container>

    <eos-container header="Text" pad-top="true">
      <firebot-input
        model="effect.message"
        use-text-area="true"
        placeholder-text="Chat message"
        rows="3"
        cols="40" />

      <div style="display: flex; flex-direction: row; gap: 10px 20px; flex-wrap: wrap; margin: 10px 0;">
        <firebot-checkbox
          ng-if="isMessageEvent"
          label="Send as reply"
          model="effect.sendAsReply"
          tooltip="Sends as a reply to the associated Stoat message from the Message event" />
      </div>
    </eos-container>
  `,
  optionsController: ($scope, backendCommunicator: any) => {
    $scope.isMessageEvent =
      $scope.trigger === "event" &&
      //@ts-expect-error ts(2339)
      ["oceanity:stoat:message"].includes($scope.triggerMeta?.triggerId);

    $scope.getServers = (): void => {
      backendCommunicator
        .fireEventAsync("stoat:get-servers")
        .then((data: Record<string, string>) => {
          $scope.servers = data;
        });
    };

    //@ts-expect-error ts(2349)
    $scope.getServers();

    $scope.getChannels = (): void => {
      if (!$scope.effect.selectedServer) {
        return;
      }

      backendCommunicator
        .fireEventAsync("stoat:get-channels", $scope.effect.selectedServer)
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

    //@ts-expect-error ts(2349)
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
      $scope.effect.selectMode = Object.keys($scope.selectModes).shift();
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
                id: (trigger.metadata.eventData.stoatMessageId as string) ?? "",
                mention: true,
                fail_if_not_exists: false,
              },
            ]
          : undefined,
      };
      switch (effect.selectMode) {
        case "associated": {
          if (!trigger.metadata.eventData.stoatChannelId) {
            return {
              success: false,
            };
          }

          const channel = await stoat.client?.channels.fetch(
            `${trigger.metadata.eventData.stoatChannelId}`,
          );

          await channel.sendMessage(message);

          break;
        }

        case "list": {
          await stoat.client?.channels
            .get(effect.selectedChannel)
            .sendMessage(message);

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
      logger.error("Error running Send Stoat Message effect", error);

      return {
        success: false,
      };
    }
  },
};
