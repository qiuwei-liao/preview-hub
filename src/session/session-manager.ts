// Preview Hub — 会话管理器（非 React 纯模块）
// 通过 AuthAdapter 调用接入方的认证逻辑，包内不依赖任何业务 auth。

import type { AuthAdapter, SessionDisplayInfo } from "./auth-adapter";
import type { IdentitySpec } from "../types";

/**
 * 按身份配置执行真实登录（通过 authAdapter）。
 * 登录失败时抛出错误，不静默降级。
 */
export async function loginAsIdentity(
  adapter: AuthAdapter,
  identity: IdentitySpec,
): Promise<SessionDisplayInfo> {
  return adapter.login(identity);
}

/**
 * 读取当前会话展示信息（通过 authAdapter）。
 */
export function getSessionDisplayInfo(adapter: AuthAdapter): SessionDisplayInfo {
  return adapter.getSession();
}

/**
 * 检查当前是否已登录。
 */
export function isSessionActive(adapter: AuthAdapter): boolean {
  return adapter.isLoggedIn();
}
