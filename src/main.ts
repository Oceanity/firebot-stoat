import {
  Firebot,
  Integration,
} from "@crowbartools/firebot-custom-scripts-types";
import { initModules } from "@oceanity/firebot-helpers/firebot";
import {
  STOAT_EVENT_SOURCE,
  STOAT_INTEGRATION_AUTHOR,
  STOAT_INTEGRATION_DEFINITION,
  STOAT_INTEGRATION_DESCRIPTION,
  STOAT_INTEGRATION_FIREBOT_VERSION,
  STOAT_INTEGRATION_ID,
  STOAT_INTEGRATION_NAME_AND_AUTHOR,
  STOAT_INTEGRATION_VERSION,
} from "./constants";
import { AllStoatEffectTypes } from "./effects";
import { StoatIntegration } from "./stoat-integration";
import { registerStoatVariables } from "./stoat-variables";
import { StoatIntegrationSettings } from "./types";

export let stoat: StoatIntegration;

const script: Firebot.CustomScript<{}> = {
  getScriptManifest: () => {
    return {
      name: STOAT_INTEGRATION_NAME_AND_AUTHOR,
      description: STOAT_INTEGRATION_DESCRIPTION,
      author: STOAT_INTEGRATION_AUTHOR,
      version: STOAT_INTEGRATION_VERSION,
      firebotVersion: STOAT_INTEGRATION_FIREBOT_VERSION,
    };
  },
  getDefaultParameters: () => ({}),
  run: (runRequest) => {
    initModules(runRequest.modules);

    stoat = new StoatIntegration();

    runRequest.modules.eventManager.registerEventSource(STOAT_EVENT_SOURCE);

    const integration: Integration<StoatIntegrationSettings> = {
      definition: STOAT_INTEGRATION_DEFINITION,
      integration: stoat,
    };
    runRequest.modules.integrationManager.registerIntegration(integration);

    for (const effectType of AllStoatEffectTypes) {
      effectType.definition.id = `${STOAT_INTEGRATION_ID}:${effectType.definition.id}`;
      runRequest.modules.effectManager.registerEffect(effectType as any);
    }

    registerStoatVariables(
      runRequest.modules.replaceVariableFactory,
      runRequest.modules.replaceVariableManager,
    );
  },
};

export default script;
