"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// Preview Hub — 配置注入 Context
// 通过 PreviewHubProvider 注入配置，所有子组件用 usePreviewHubConfig() 获取。
import { createContext, useContext } from "react";
const PreviewHubConfigContext = createContext(null);
export function PreviewHubProvider({ config, children }) {
    return (_jsx(PreviewHubConfigContext.Provider, { value: config, children: children }));
}
export function usePreviewHubConfig() {
    const ctx = useContext(PreviewHubConfigContext);
    if (!ctx) {
        throw new Error("usePreviewHubConfig must be used within <PreviewHubProvider>");
    }
    return ctx;
}
//# sourceMappingURL=context.js.map