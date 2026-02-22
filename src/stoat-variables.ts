import { ReplaceVariableFactory } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-factory";
import {
  ReplaceVariable,
  ReplaceVariableManager,
} from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { STOAT_INTEGRATION_ID } from "./constants";
import { FirebotEvents } from "./enums";

export const registerStoatVariables = (
  replaceVariableFactory: ReplaceVariableFactory,
  replaceVariableManager: ReplaceVariableManager,
) => {
  const stoatVariables = [
    ...buildUserVariables(replaceVariableFactory, "stoatBot", "the Stoat bot", [
      FirebotEvents.Connected,
      FirebotEvents.Message,
    ]),

    ...buildChannelVariables(replaceVariableFactory, "stoatChannel", [
      FirebotEvents.Message,
    ]),

    ...buildMessageVariables(replaceVariableFactory, "stoatMessage", [
      FirebotEvents.Message,
    ]),

    ...buildUserVariables(
      replaceVariableFactory,
      "stoatAuthor",
      "the author of the Stoat message",
      [FirebotEvents.Message],
    ),
  ];

  for (const variable of stoatVariables) {
    replaceVariableManager.registerReplaceVariable(variable);
  }
};

// const buildStoatVariable = (
//   replaceVariableFactory: ReplaceVariableFactory,
//   eventProperty: string,
//   description: string,
//   events: Array<FirebotEvents>,
// ): ReplaceVariable =>
//   replaceVariableFactory.createEventDataVariable({
//     handle: eventProperty,
//     description,
//     events: events.map((event) => `${STOAT_INTEGRATION_ID}:${event}`),
//     eventMetaKey: eventProperty,
//     type: "text",
//   });

const buildStoatVariables = (
  replaceVariableFactory: ReplaceVariableFactory,
  prefix: string,
  events: Array<FirebotEvents>,
  definitions: Array<[string, string]>,
): Array<ReplaceVariable> =>
  definitions.map(([name, description]) => {
    const eventProperty = `${prefix}${name}`;
    return replaceVariableFactory.createEventDataVariable({
      handle: eventProperty,
      description,
      events: events.map((event) => `${STOAT_INTEGRATION_ID}:${event}`),
      eventMetaKey: eventProperty,
      type: "text",
    });
  });

const buildUserVariables = (
  replaceVariableFactory: ReplaceVariableFactory,
  prefix: string,
  descriptor: string = "the associated Stoat user",
  events: Array<FirebotEvents>,
) =>
  buildStoatVariables(replaceVariableFactory, prefix, events, [
    ["Name", `The username of ${descriptor}`],
    ["DisplayName", `The display name of ${descriptor}`],
    ["AvatarUrl", `The url of ${descriptor}'s avatar`],
    ["IsOnline", `Will return  \`$true\` if ${descriptor} is currently online`],
    ["Presence", `The presence of ${descriptor} (ie Online, Busy, Focus)`],
  ]);

const buildChannelVariables = (
  replaceVariableFactory: ReplaceVariableFactory,
  prefix: string,
  events: Array<FirebotEvents>,
) =>
  buildStoatVariables(replaceVariableFactory, prefix, events, [
    ["Id", "The id of the associated Stoat channel"],
    ["DisplayName", "The display name of the associated Stoat channel"],
    ["Description", "The description of the associated Stoat channel"],
    ["IconUrl", "The url of the associated Stoat channel's icon"],
    ["Url", "The url of the associated Stoat channel"],
    [
      "IsMature",
      "Will return `$true` if the associated Stoat channel is marked as mature",
    ],
    [
      "IsVoice",
      "Will return `$true` if the associated Stoat channel is a voice channel",
    ],
  ]);

const buildMessageVariables = (
  replaceVariableFactory: ReplaceVariableFactory,
  prefix: string,
  events: Array<FirebotEvents>,
) =>
  buildStoatVariables(replaceVariableFactory, prefix, events, [
    ["Id", "The Id of the associated Stoat message"],
    ["Content", "The rich content of the associated Stoat message"],
    ["ContentPlain", "The plain content of the associated Stoat message"],
    ["Url", "The Url of the associated Stoat message"],
  ]);
