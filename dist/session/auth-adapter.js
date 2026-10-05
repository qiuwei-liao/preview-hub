// Preview Hub — 认证适配器
// AuthAdapter 接口由接入方实现；NoopAuthAdapter 为空实现，用于无真实登录的场景。
/** 空实现认证适配器：不执行真实登录，仅返回未登录状态。 */
export const NoopAuthAdapter = {
    async login(_identity) {
        return { loggedIn: false };
    },
    getSession() {
        return { loggedIn: false };
    },
    isLoggedIn() {
        return false;
    },
};
//# sourceMappingURL=auth-adapter.js.map