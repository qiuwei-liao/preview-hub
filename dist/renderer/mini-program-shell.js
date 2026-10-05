"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usePreviewHubConfig } from "../config/context";
import { getCurrentPage } from "./mini-program-navigation";
// ——— 固定尺寸 ———
export const MINIAPP_SHELL_DEFAULT_SIZE = { width: 340, height: 640 };
const STATUS_BAR_H = 38;
const NAV_BAR_H = 44;
/** 外壳外尺寸：未指定设备时用 340×640；指定设备时贴合设备视口宽。 */
export function getMiniProgramShellSize(device) {
    if (!device)
        return { ...MINIAPP_SHELL_DEFAULT_SIZE };
    const viewport = device.orientation === "landscape" && device.rotatable
        ? { width: device.viewport.height, height: device.viewport.width }
        : device.viewport;
    return {
        width: viewport.width,
        height: viewport.height,
    };
}
// ——— 官方胶囊图标（menu.svg / exit.svg 原样路径）———
function IconMenu({ color }) {
    return (_jsx("svg", { width: "22", height: "7", viewBox: "0 0 45 15", style: { display: "block" }, children: _jsx("path", { d: "M10 8A5 5 0 1 1-.001 7.999 5 5 0 0 1 10 8zm12.5-8a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM40 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10z", fill: color, fillRule: "evenodd" }) }));
}
function IconExit({ color }) {
    return (_jsx("svg", { width: "17", height: "17", viewBox: "0 0 52 52", style: { display: "block" }, children: _jsx("path", { d: "M26 52C11.64 52 0 40.36 0 26S11.64 0 26 0s26 11.64 26 26-11.64 26-26 26zm0-6.118c10.98 0 19.882-8.901 19.882-19.882 0-10.98-8.901-19.882-19.882-19.882C15.02 6.118 6.118 15.019 6.118 26c0 10.98 8.901 19.882 19.882 19.882zM35 26a9.001 9.001 0 1 1-18.002-.002A9.001 9.001 0 0 1 35 26z", fill: color, fillRule: "nonzero" }) }));
}
export function MiniProgramShell({ navigationState, onNavigateBack, onSwitchTab, children, device, darkNav = false, }) {
    const config = usePreviewHubConfig();
    const tabbar = config.miniapp?.tabbar ?? [];
    const current = getCurrentPage(navigationState);
    const size = getMiniProgramShellSize(device);
    // 胶囊深浅规则
    const capsuleBg = darkNav ? "#FFFFFF" : "rgba(0,0,0,0.15)";
    const capsuleBorder = darkNav
        ? "rgba(0,0,0,0.1)"
        : "rgba(255,255,255,0.25)";
    const capsuleIcon = darkNav ? "#1A1A1A" : "#FFFFFF";
    const capsuleSep = darkNav ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)";
    const navBg = darkNav ? "#1A1A1A" : "#FFFFFF";
    const navText = darkNav ? "#FFFFFF" : "#1A1A1A";
    const statusText = darkNav ? "#FFFFFF" : "#1A1A1A";
    return (_jsxs("div", { style: {
            width: size.width,
            height: size.height,
            borderRadius: 44,
            border: "2px solid #2a2e35",
            background: "#0d0f12",
            boxShadow: "0 0 0 6px #1c1f26, 0 24px 60px rgba(0,0,0,0.55)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
        }, children: [_jsxs("div", { style: {
                    height: STATUS_BAR_H,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: statusText,
                    background: navBg,
                    flexShrink: 0,
                    boxSizing: "border-box",
                }, children: [_jsx("span", { children: "9:41" }), _jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [_jsx("span", { style: { fontSize: 10, opacity: 0.8 }, children: "5G" }), _jsx("span", { style: { fontSize: 12 }, children: "\u25AE\u25AE\u25AE\u25AE" })] })] }), _jsxs("div", { style: {
                    height: NAV_BAR_H,
                    background: navBg,
                    borderBottom: darkNav
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    boxSizing: "border-box",
                }, children: [_jsx("div", { style: { width: 36, display: "flex", alignItems: "center", justifyContent: "center" }, children: navigationState.currentIndex > 0 && (_jsx("button", { onClick: onNavigateBack, "aria-label": "\u8FD4\u56DE", style: {
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: navText,
                                fontSize: 18,
                                lineHeight: 1,
                                padding: 4,
                            }, children: "\u2039" })) }), _jsx("div", { style: {
                            flex: 1,
                            textAlign: "center",
                            fontSize: 15,
                            fontWeight: 600,
                            color: navText,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }, children: current.title }), _jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            width: 87,
                            borderRadius: 27,
                            border: `1px solid ${capsuleBorder}`,
                            background: capsuleBg,
                            lineHeight: 1,
                            fontSize: 0,
                            boxSizing: "border-box",
                            flexShrink: 0,
                            marginRight: 6,
                        }, children: [_jsx("div", { style: {
                                    display: "flex",
                                    flex: 1,
                                    height: 30,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "6.4px 0",
                                    boxSizing: "border-box",
                                }, children: _jsx(IconMenu, { color: capsuleIcon }) }), _jsx("span", { style: {
                                    display: "inline-block",
                                    minWidth: 1,
                                    height: 17.2,
                                    background: capsuleSep,
                                } }), _jsx("div", { style: {
                                    display: "flex",
                                    flex: 1,
                                    height: 30,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "6.4px 0",
                                    boxSizing: "border-box",
                                }, children: _jsx(IconExit, { color: capsuleIcon }) })] })] }), _jsx("div", { style: { flex: 1, position: "relative", overflow: "hidden", background: "#FFFFFF" }, children: children }), tabbar.length > 0 && (_jsx("div", { style: {
                    flexShrink: 0,
                    paddingBottom: 34,
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                }, children: _jsx("div", { style: {
                        display: "grid",
                        gridTemplateColumns: `repeat(${tabbar.length}, 1fr)`,
                        height: 50,
                        alignItems: "center",
                        padding: "0 8px",
                        boxSizing: "border-box",
                    }, children: tabbar.map((tab) => {
                        const active = current.pageId === tab.pageId;
                        return (_jsx("button", { onClick: () => onSwitchTab(tab.pageId), style: {
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 3,
                                padding: 0,
                            }, children: _jsx("span", { style: {
                                    fontSize: 11,
                                    fontWeight: active ? 600 : 400,
                                    color: active ? "#07C160" : "#6b7280",
                                    transition: "color .3s ease",
                                }, children: tab.label }) }, tab.pageId));
                    }) }) }))] }));
}
//# sourceMappingURL=mini-program-shell.js.map