import { EffectType } from "@crowbartools/firebot-types";
import { STOAT_INTEGRATION_ID } from "../constants";
import { SendMessageEffectType } from "./send-message";

export const AllStoatEffectTypes: Array<EffectType<any>> = [
  SendMessageEffectType,
].map((effectType: EffectType<any>) => {
  effectType.definition.id = `${STOAT_INTEGRATION_ID}:${effectType.definition.id}`;
  return effectType;
});
