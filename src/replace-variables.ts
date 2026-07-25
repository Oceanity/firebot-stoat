import firebot, { ReplaceVariable } from "@crowbartools/firebot-types";
import { STOAT_INTEGRATION_ID } from "./constants";
import { FirebotEvents } from "./enums";

export const AllStoatReplaceVariables: Array<ReplaceVariable> = [
  ...buildUserVariables("stoatBot", "the Stoat bot", [
    FirebotEvents.Connected,
    FirebotEvents.Message,
  ]),

  ...buildChannelVariables("stoatChannel", [FirebotEvents.Message]),

  ...buildMessageVariables("stoatMessage", [FirebotEvents.Message]),

  ...buildUserVariables("stoatAuthor", "the author of the Stoat message", [
    FirebotEvents.Message,
  ]),
];

function buildStoatVariables(
  prefix: string,
  events: Array<FirebotEvents>,
  definitions: Array<[string, string]>,
): Array<ReplaceVariable> {
  return definitions.map(([name, description]) => {
    const eventProperty = `${prefix}${name}`;
    //@ts-expect-error(2339)
    return firebot.factories.variables.createEventDataVariable({
      handle: eventProperty,
      description,
      events: events.map((event) => `${STOAT_INTEGRATION_ID}:${event}`),
      eventMetaKey: eventProperty,
      type: "text",
    });
  });
}

function buildUserVariables(
  prefix: string,
  descriptor: string = "the associated Stoat user",
  events: Array<FirebotEvents>,
) {
  return buildStoatVariables(prefix, events, [
    ["Name", `The username of ${descriptor}`],
    ["DisplayName", `The display name of ${descriptor}`],
    ["AvatarUrl", `The url of ${descriptor}'s avatar`],
    ["IsOnline", `Will return  \`$true\` if ${descriptor} is currently online`],
    ["Presence", `The presence of ${descriptor} (ie Online, Busy, Focus)`],
  ]);
}

function buildChannelVariables(prefix: string, events: Array<FirebotEvents>) {
  return buildStoatVariables(prefix, events, [
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
}

function buildMessageVariables(prefix: string, events: Array<FirebotEvents>) {
  return buildStoatVariables(prefix, events, [
    ["Id", "The Id of the associated Stoat message"],
    ["Content", "The rich content of the associated Stoat message"],
    ["ContentPlain", "The plain content of the associated Stoat message"],
    ["Url", "The Url of the associated Stoat message"],
  ]);
}
