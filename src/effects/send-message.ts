import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { logger } from "@oceanity/firebot-helpers/firebot";
import { stoat } from "../main";

type Props = {
  selectMode?: string;
  message?: string;
  session?: string;
  selectedServer?: string;
  selectedChannel?: string;
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
    </eos-container>
  `,
  optionsController: ($scope, backendCommunicator: any) => {
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

    if (
      $scope.trigger === "event" &&
      //@ts-expect-error ts(2339)
      ["oceanity:stoat:message"].includes($scope.triggerMeta?.triggerId)
    ) {
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

          await channel.sendMessage(effect.message);

          break;
        }

        case "list": {
          await stoat.client?.channels
            .get(effect.selectedChannel)
            .sendMessage(effect.message);

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
