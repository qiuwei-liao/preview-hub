"use client";
import { jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Preview Hub 右上角登录状态浮层：
 * - 登录中（蓝色）/ 登录失败（红色）二选一展示。
 * 注意：沿用 Preview Hub 自有深色主题内联色值，不接入主站语义 token。
 */
export function PreviewLoginToast({ isLoggingIn, identityLabel, loginError, }) {
    if (loginError) {
        return (_jsxs("div", { style: {
                position: "fixed",
                top: 60,
                right: 20,
                background: "rgba(239,68,68,0.9)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 12,
                zIndex: 100,
            }, children: ["\u767B\u5F55\u5931\u8D25: ", loginError] }));
    }
    if (isLoggingIn) {
        return (_jsxs("div", { style: {
                position: "fixed",
                top: 60,
                right: 20,
                background: "rgba(59,130,246,0.9)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 12,
                zIndex: 100,
            }, children: ["\u6B63\u5728\u767B\u5F55 ", identityLabel, "..."] }));
    }
    return null;
}
//# sourceMappingURL=preview-login-toast.js.map