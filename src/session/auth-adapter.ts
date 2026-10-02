// Preview Hub — 认证适配器
// AuthAdapter 接口由接入方实现；NoopAuthAdapter 为空实现，用于无真实登录的场景。

import type { AuthAdapter, SessionDisplayInfo } from "../config/types";
import type { IdentitySpec } from "../types";

export type { AuthAdapter, SessionDisplayInfo } from "../config/types";

/** 空实现认证适配器：不执行真实登录，仅返回未登录状态。 */
export const NoopAuthAdapter: AuthAdapter = {
  async login(_identity: IdentitySpec): Promise<SessionDisplayInfo> {
    return { loggedIn: false };
  },
  getSession(): SessionDisplayInfo {
    return { loggedIn: false };
  },
  isLoggedIn(): boolean {
    return false;
  },
};
