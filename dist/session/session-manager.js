// Preview Hub — 会话管理器（非 React 纯模块）
// 通过 AuthAdapter 调用接入方的认证逻辑，包内不依赖任何业务 auth。
/**
 * 按身份配置执行真实登录（通过 authAdapter）。
 * 登录失败时抛出错误，不静默降级。
 */
export async function loginAsIdentity(adapter, identity) {
    return adapter.login(identity);
}
/**
 * 读取当前会话展示信息（通过 authAdapter）。
 */
export function getSessionDisplayInfo(adapter) {
    return adapter.getSession();
}
/**
 * 检查当前是否已登录。
 */
export function isSessionActive(adapter) {
    return adapter.isLoggedIn();
}
//# sourceMappingURL=session-manager.js.map