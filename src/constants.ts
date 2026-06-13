import { EventSource } from "@crowbartools/firebot-types";
import * as packageJson from "../package.json";
import { FirebotEvents } from "./enums";

export const {
  displayName: STOAT_INTEGRATION_NAME,
  description: STOAT_INTEGRATION_DESCRIPTION,
  author: STOAT_INTEGRATION_AUTHOR,
  version: STOAT_INTEGRATION_VERSION,
} = packageJson;

export const STOAT_INTEGRATION_ID = "oceanity:stoat";
export const STOAT_INTEGRATION_PACKAGE_URL =
  "https://raw.githubusercontent.com/Oceanity/firebot-stoat/refs/heads/main/package.json";

export const STOAT_EVENT_SOURCE: EventSource = {
  id: STOAT_INTEGRATION_ID,
  name: STOAT_INTEGRATION_NAME,
  events: [
    {
      id: FirebotEvents.Connected,
      name: "Connected",
      description: "When the integration connects to the Stoat bot",
    },
    {
      id: FirebotEvents.Message,
      name: "Message",
      description:
        "When a message is received in a channel the Stoat bot has access to",
    },
  ],
};

export const STOAT_PLUGIN_ICON_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAGJAAABiQGeLhE1AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAA0RJREFUWIW1l0toXkUYhp/8Jo21CrYpRlqNtmrETSq0iKCiDQQvm4piESyCIoILFS+4cNUiiFpEwYILURAFF1I3IqihQSJaC15QV7EXq0awqcZLY2Ox7eNi5sQ/J2fmnL/GF4b8me+b73vnm3cup0ulIZYCNwAbgXXARcCyaPsT2Ad8BYwB7wGzjaKqdW1AfUH93eb4LY4ZqIufM/ao29TZDhKXMatujbE6IrBC3fUfEpfxoXpOUwKD6r5FTF5gv3ppOV+X80W4AtgDXNxUmR3iIHAFcLjoaLUZe4A3/8fkABcCO4ElVQQeB4Yzg78GJjpINgOcqOi/Bnhw7r+4FuebV/tOdYm6TN2sTtWs94vRd1vCPm0Q+hyB52sCDqm71Rn1AfWCSGpAXa72qxvVJ9XP1NUx7m2ZmNsLAqerv2Ycf1A3lPp2qH3quS7cRWeqz6qb1NszcafV3hYwApydWcs9wFD8fRR4DvgS+Av4KbH2jxCO6+szcZcDI92Esz2HKWAVcAy4B9gV++rwBDBa4zPcikxTEFgJfAe8RahGk+TF2PuA4xmfdS1gTcZhjHBojAHPAAcaJi+wF3g9Y1+L+nNGKDdHUW2qEFuTtkodzgkR9XDCeFA9rUGSOwx3x00VtrvVNzIEDrWAPxLleZl/T7IrM2W8jvA4uarC9hrwdmbsFOpogt3lbTPZYjh8qirQF+1nJexL1WOJHKMtwp4uY7LUPw48nJjFLwShHUnYZ4GXErZPWoR9Xcb7hG1U4HvgMsKh1RT9wKvAp8DfCZ8x1F4XCvHRilIORr971VYDcY6oJ2J7pUqAam/hvL1kvDUR9Gr1iLpXfdqwTc/LkBhSn1KPVhDYatuLqJ9wyJwRS7Me+DxRtvXAO3FMgR+Bj2K5Jwh3xmrgLuDaihgzhIfPoXa2j7WxG6wp71r1mzb/HaZ3UxXuL2K1B+1Wx6PDJTUEiKWfUj82aOLbhsnHbdNQd1tZjgObgd3AybS45zAJbCFcqyeZ/7xLYQK4ZV78ipmtUVc2qEDRuuLfd2tmvt+Kw+xULphUuzOT/AM7+DA51dajHiglnlYfMnOpLSYB1Btj4knDA7Wvbkz5y2gxsAH4gupvggX4B3m4HZ3muYHQAAAAAElFTkSuQmCC";

export const STOAT_PLUGIN_ICON_BACKGROUND =
  "linear-gradient(180deg,#191523,#2A233A)";
