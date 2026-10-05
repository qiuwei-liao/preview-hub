"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usePreviewHubConfig } from "../config/context";
// ——— 固定尺寸 ———
export const APP_SHELL_DEFAULT_SIZE = { width: 390, height: 780 };
const STATUS_BAR_H = 44;
const NAV_BAR_H = 52;
const TAB_BAR_H = 50;
const HOME_INDICATOR_H = 20;
/** 外壳外尺寸：未指定设备时用 390×780；指定设备时贴合设备视口宽。 */
export function getAppShellSize(device) {
    if (!device)
        return { ...APP_SHELL_DEFAULT_SIZE };
    const viewport = device.orientation === "landscape" && device.rotatable
        ? { width: device.viewport.height, height: device.viewport.width }
        : device.viewport;
    return {
        width: viewport.width,
        height: viewport.height,
    };
}
// ——— 内置极简图标池（iOS SF Symbols 风格线条图标） ———
function IconHome({ color, active }) {
    return (_jsx("svg", { width: "26", height: "26", viewBox: "0 0 26 26", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M4 11.5 13 4l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5h-4.8v-5.6h-3.4V22.5H5.5A1.5 1.5 0 0 1 4 21v-9.5Z", stroke: color, strokeWidth: active ? 2.1 : 1.6, strokeLinejoin: "round", fill: active ? color : "none", fillOpacity: active ? 0.12 : 0 }) }));
}
function IconList({ color, active }) {
    return (_jsxs("svg", { width: "26", height: "26", viewBox: "0 0 26 26", fill: "none", "aria-hidden": true, children: [_jsx("rect", { x: "4", y: "5", width: "18", height: "16", rx: "3.5", stroke: color, strokeWidth: active ? 2.1 : 1.6 }), _jsx("path", { d: "M9 10.5h8M9 15h8", stroke: color, strokeWidth: active ? 2 : 1.5, strokeLinecap: "round" })] }));
}
function IconMessage({ color, active }) {
    return (_jsx("svg", { width: "26", height: "26", viewBox: "0 0 26 26", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M4 6.5A2.5 2.5 0 0 1 6.5 4h13A2.5 2.5 0 0 1 22 6.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.6 4.3a.9.9 0 0 1-1.5-.67V17A2.5 2.5 0 0 1 4 14.5v-8Z", stroke: color, strokeWidth: active ? 2.1 : 1.6, strokeLinejoin: "round", fill: active ? color : "none", fillOpacity: active ? 0.12 : 0 }) }));
}
function IconMine({ color, active }) {
    return (_jsxs("svg", { width: "26", height: "26", viewBox: "0 0 26 26", fill: "none", "aria-hidden": true, children: [_jsx("circle", { cx: "13", cy: "9.2", r: "4.2", stroke: color, strokeWidth: active ? 2.1 : 1.6, fill: active ? color : "none", fillOpacity: active ? 0.12 : 0 }), _jsx("path", { d: "M5.5 21.5c1.2-3.4 3.9-5.1 7.5-5.1s6.3 1.7 7.5 5.1", stroke: color, strokeWidth: active ? 2.1 : 1.6, strokeLinecap: "round" })] }));
}
const TAB_ICONS = {
    home: IconHome,
    list: IconList,
    message: IconMessage,
    mine: IconMine,
};
const FALLBACK_ICONS = ["home", "list", "message", "mine"];
export function AppShell({ activePageId, onSwitchTab, children, device, darkNav = false, }) {
    const config = usePreviewHubConfig();
    const tabbar = config.app?.tabbar ?? [];
    const size = getAppShellSize(device);
    const navBg = darkNav ? "#111318" : "#F7F7F8";
    const navText = darkNav ? "#FFFFFF" : "#111318";
    const statusText = darkNav ? "#FFFFFF" : "#111318";
    const barText = darkNav ? "#9BA1AB" : "#8E9099";
    const activeColor = darkNav ? "#0A84FF" : "#007AFF";
    return (_jsxs("div", { style: {
            width: size.width,
            height: size.height,
            borderRadius: device?.frame === "tablet" ? 24 : 44,
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
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: "0 24px 8px",
                    fontSize: 15,
                    fontWeight: 600,
                    color: statusText,
                    background: navBg,
                    flexShrink: 0,
                    boxSizing: "border-box",
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: "-apple-system, SF Pro Display, system-ui, sans-serif",
                }, children: [_jsx("span", { children: "9:41" }), _jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6, height: 18 }, children: [_jsx("span", { style: { fontSize: 11, opacity: 0.75 }, children: "5G" }), _jsx("span", { style: { fontSize: 12, letterSpacing: 1 }, children: "\u25AE\u25AE\u25AE\u25AE" }), _jsxs("svg", { width: "24", height: "12", viewBox: "0 0 25 12", fill: "none", "aria-hidden": true, children: [_jsx("rect", { x: "0.5", y: "0.5", width: "21", height: "11", rx: "3", stroke: statusText, strokeOpacity: "0.4" }), _jsx("rect", { x: "2", y: "2", width: "16.4", height: "7", rx: "1.8", fill: statusText }), _jsx("path", { d: "M23 3.5v5a1.8 1.8 0 0 0 0-5z", fill: statusText, fillOpacity: "0.4" })] })] })] }), _jsxs("div", { style: {
                    height: NAV_BAR_H,
                    background: navBg,
                    borderBottom: darkNav ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    boxSizing: "border-box",
                    padding: "0 14px",
                }, children: [_jsx("span", { style: { width: 34, color: activeColor, fontSize: 28, fontWeight: 400, lineHeight: 1, cursor: "default" }, children: "\u2039" }), _jsx("span", { style: {
                            flex: 1,
                            textAlign: "center",
                            fontSize: 17,
                            fontWeight: 600,
                            color: navText,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }, children: tabbar.find((t) => t.pageId === activePageId)?.label ?? "App" }), _jsx("span", { style: { width: 34, color: activeColor, fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textAlign: "right", cursor: "default" }, children: "\u2022\u2022\u2022" })] }), _jsx("div", { style: { flex: 1, position: "relative", overflow: "hidden", background: "#FFFFFF" }, children: children }), tabbar.length > 0 && (_jsxs("div", { style: {
                    flexShrink: 0,
                    background: darkNav ? "rgba(17,19,24,0.96)" : "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderTop: darkNav ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                    paddingBottom: device ? 0 : HOME_INDICATOR_H,
                    boxSizing: "border-box",
                }, children: [_jsx("div", { style: {
                            display: "grid",
                            gridTemplateColumns: `repeat(${tabbar.length}, 1fr)`,
                            height: TAB_BAR_H,
                            alignItems: "center",
                            padding: "0 8px",
                            boxSizing: "border-box",
                        }, children: tabbar.map((tab, i) => {
                            const active = tab.pageId === activePageId;
                            const Icon = TAB_ICONS[tab.icon ?? ""] ?? TAB_ICONS[FALLBACK_ICONS[i % FALLBACK_ICONS.length]];
                            return (_jsxs("button", { onClick: () => onSwitchTab(tab.pageId), "aria-label": tab.label, style: {
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 2,
                                    padding: 0,
                                }, children: [Icon({ color: active ? activeColor : barText, active }), _jsx("span", { style: {
                                            fontSize: 10,
                                            fontWeight: active ? 600 : 400,
                                            color: active ? activeColor : barText,
                                            transition: "color .3s ease",
                                        }, children: tab.label })] }, tab.pageId));
                        }) }), device && (_jsx("div", { style: {
                            height: HOME_INDICATOR_H,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }, children: _jsx("span", { style: {
                                width: 134,
                                height: 4,
                                borderRadius: 2,
                                background: darkNav ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.32)",
                            } }) }))] }))] }));
}
//# sourceMappingURL=app-shell.js.map