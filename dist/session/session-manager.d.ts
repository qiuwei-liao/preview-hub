import type { AuthAdapter, SessionDisplayInfo } from "./auth-adapter";
import type { IdentitySpec } from "../types";
/**
 * 按身份配置执行真实登录（通过 authAdapter）。
 * 登录失败时抛出错误，不静默降级。
 */
export declare function loginAsIdentity(adapter: AuthAdapter, identity: IdentitySpec): Promise<SessionDisplayInfo>;
/**
 * 读取当前会话展示信息（通过 authAdapter）。
 */
export declare function getSessionDisplayInfo(adapter: AuthAdapter): SessionDisplayInfo;
/**
 * 检查当前是否已登录。
 */
export declare function isSessionActive(adapter: AuthAdapter): boolean;
//# sourceMappingURL=session-manager.d.ts.map