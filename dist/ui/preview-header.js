"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Preview Hub — 极简顶栏
// 布局：[Preview Hub]  SurfaceSwitcher ｜ RoleSwitcher RouteSwitcher (DeviceSwitcher)   PreviewActions
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { RoleSwitcher } from "./role-switcher";
import { SurfaceSwitcher } from "./surface-switcher";
import { RouteSwitcher } from "./route-switcher";
import { DeviceSwitcher } from "./device-switcher";
import { PreviewActions } from "./preview-actions";
import { PageLocator } from "./page-locator";
export function PreviewHeader() {
    const { state, actions } = usePreviewState();
    const t = getTheme(state.theme);
    const isFocus = state.mode === "focus";
    const envLabel = state.environment.toUpperCase();
    const safe = state.readOnly;
    return (_jsxs("div", { style: {
            position: "sticky",
            top: 0,
            zIndex: 90,
            background: t.bar,
            backdropFilter: "blur(8px)",
            borderBottom: `1px solid ${t.barBorder}`,
        }, children: [_jsxs("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 16px",
                }, children: [_jsx("span", { style: {
                            fontWeight: 700,
                            fontSize: 16,
                            color: t.text,
                            letterSpacing: -0.2,
                        }, children: "Preview Hub" }), _jsx("div", { style: { width: 1, height: 18, background: t.barBorder } }), _jsx(SurfaceSwitcher, {}), _jsx("span", { style: {
                            fontSize: 14,
                            lineHeight: 1,
                            color: t.sub,
                            opacity: 0.7,
                            userSelect: "none",
                        }, children: "\uFF5C" }), _jsx(RoleSwitcher, {}), _jsx(RouteSwitcher, {}), isFocus && _jsx(DeviceSwitcher, {}), _jsx("div", { style: { flex: 1 } }), _jsx(PreviewActions, {})] }), _jsx(PageLocator, {}), _jsxs("button", { onClick: () => actions.openDrawer("status"), title: "\u67E5\u770B\u72B6\u6001\u8BE6\u60C5", style: {
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 16px",
                    fontSize: 11,
                    cursor: "pointer",
                    border: "none",
                    borderTop: `1px solid ${t.barBorder}`,
                    background: "transparent",
                    color: t.sub,
                    textAlign: "left",
                }, children: [_jsx("span", { style: {
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: safe ? "#10b981" : "#f59e0b",
                            flexShrink: 0,
                        } }), _jsx("span", { style: { fontWeight: 700, letterSpacing: 0.5 }, children: envLabel }), _jsx("span", { style: { opacity: 0.6 }, children: "\u00B7" }), _jsx("span", { style: {
                            color: safe ? "#10b981" : "#f59e0b",
                            fontWeight: 600,
                        }, children: safe ? "只读" : "可写" })] })] }));
}
//# sourceMappingURL=preview-header.js.map