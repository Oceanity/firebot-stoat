import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { logger } from "@oceanity/firebot-helpers/firebot";
import { stoat } from "../main";

type Props = {
  selectMode?: string;
  message?: string;
  session?: string;
  selectedSession?: string;
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
    <eos-container header="Channel" pad-bottom="true">
      <firebot-select
        selected="effect.selectMode"
        options="selectModes" />

      <div ng-if="effect.selectMode === 'list'" style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 20px;">
        <firebot-select
          selected="effect.selectedSession"
          options="sessions" />
        <button class="btn btn-link" ng-click="getSessionNames()">Refresh Sessions</button>
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
    $scope.getSessionNames = (): void => {
      backendCommunicator
        .fireEventAsync("archipelago:getSessionTable")
        .then((data: Record<string, string>) => {
          $scope.sessions = data;
        });
    };

    //@ts-expect-error ts(2349)
    $scope.getSessionNames();

    $scope.selectModes = {
      associated: "Associated Stoat Channel",
      // list: "Select from list",
      // custom: "Manually enter a name",
    };

    if (!$scope.effect.selectMode) {
      $scope.effect.selectMode = "associated";
    }
  },
  optionsValidator: (effect) => {
    const errors: Array<string> = [];
    if (effect.selectMode === "list" && !effect.selectedSession) {
      errors.push("Select a session from the list");
    }
    if (effect.selectMode === "custom" && !effect.session) {
      errors.push("Enter the name of a session");
    }
    if (!effect.message?.length) {
      errors.push("Please insert a message to send");
    }
    return errors;
  },
  onTriggerEvent: async ({ effect, trigger }) => {
    console.log(JSON.stringify(trigger));
    logger.info(JSON.stringify(trigger));
    switch (effect.selectMode) {
      case "associated": {
        if (!trigger.metadata.eventData.stoatChannelId) {
          return {
            success: false,
          };
        }

        try {
          const channel = await stoat.client?.channels.fetch(
            `${trigger.metadata.eventData.stoatChannelId}`,
          );

          await channel.sendMessage(effect.message);

          return { success: true };
        } catch (error) {
          return {
            success: false,
          };
        }
      }

      // case "list": {
      //   return client.sessions
      //     .get(effect.selectedSession)
      //     ?.messages.sendChat(effect.message);
      // }

      // case "custom": {
      //   return client
      //     .findSession(effect.session)
      //     ?.messages.sendChat(effect.message);
      // }
    }
  },
};
