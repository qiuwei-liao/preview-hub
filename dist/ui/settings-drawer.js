"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// SettingsDrawer — 右侧滑出：外观 / 数据(只读保护) / 会话 / 设备 / 高级调试信息。
import { useState } from "react";
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { SURFACE_LABELS, COLOR_FILTERS } from "../types";
const THEME_OPTIONS = [
    { id: "light", label: "浅色" },
    { id: "dark", label: "深色" },
    { id: "system", label: "跟随系统" },
];
export function SettingsDrawer() {
    const { state, actions } = usePreviewState();
    const config = usePreviewHubConfig();
    const t = getTheme(state.theme);
    const open = state.drawer === "settings";
    const [confirmWrite, setConfirmWrite] = useState(false);
    const [debugOpen, setDebugOpen] = useState(false);
    const [customW, setCustomW] = useState("");
    const [customH, setCustomH] = useState("");
    const role = state.experience.role;
    const identity = config.identities?.find((i) => i.role === role);
    const safe = state.readOnly;
    const onToggleReadonly = () => {
        if (safe) {
            setConfirmWrite(true);
        }
        else {
            actions.setReadOnly(true);
        }
    };
    const confirmEnableWrite = () => {
        actions.setReadOnly(false);
        setConfirmWrite(false);
    };
    const sectionTitle = {
        fontSize: 11,
        fontWeight: 600,
        color: t.sub,
        letterSpacing: 0.5,
        margin: "16px 0 6px",
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { onClick: actions.closeDrawer, style: {
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity .2s ease",
                    zIndex: 110,
                } }), _jsxs("aside", { style: {
                    position: "fixed",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: 320,
                    maxWidth: "85vw",
                    background: t.bar,
                    borderLeft: `1px solid ${t.barBorder}`,
                    transform: open ? "translateX(0)" : "translateX(100%)",
                    transition: "transform .25s ease",
                    zIndex: 111,
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px",
                    overflowY: "auto",
                    boxShadow: open ? "-16px 0 40px rgba(0,0,0,0.25)" : "none",
                    pointerEvents: open ? "auto" : "none",
                }, children: [_jsx("div", { style: {
                            fontSize: 15,
                            fontWeight: 700,
                            color: t.text,
                            marginBottom: 4,
                        }, children: "Preview \u8BBE\u7F6E" }), _jsx("div", { style: sectionTitle, children: "\u5916\u89C2" }), _jsx("div", { style: {
                            display: "flex",
                            gap: 4,
                            padding: 3,
                            borderRadius: 10,
                            background: t.chipBg,
                        }, children: THEME_OPTIONS.map((opt) => {
                            const active = state.theme === opt.id;
                            return (_jsx("button", { onClick: () => actions.setTheme(opt.id), style: {
                                    flex: 1,
                                    padding: "7px 0",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    cursor: "pointer",
                                    border: "none",
                                    background: active ? "#00704A" : "transparent",
                                    color: active ? "#fff" : t.text,
                                }, children: opt.label }, opt.id));
                        }) }), _jsx("div", { style: sectionTitle, children: "\u6570\u636E" }), _jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: t.chipBg,
                        }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 14, color: t.text }, children: "\u53EA\u8BFB\u4FDD\u62A4" }), _jsx("div", { style: { fontSize: 11, color: t.sub }, children: "\u9632\u6B62\u9884\u89C8\u65F6\u8BEF\u64CD\u4F5C\u771F\u5B9E\u4E1A\u52A1\u6570\u636E" })] }), _jsx("button", { onClick: onToggleReadonly, role: "switch", "aria-checked": safe, title: safe ? "关闭只读将允许修改真实数据" : "开启只读保护", style: {
                                    width: 40,
                                    height: 22,
                                    borderRadius: 11,
                                    border: "none",
                                    cursor: "pointer",
                                    background: safe ? "#00704A" : t.chipBorder,
                                    position: "relative",
                                    transition: "background .15s",
                                }, children: _jsx("span", { style: {
                                        position: "absolute",
                                        top: 2,
                                        left: safe ? 20 : 2,
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        transition: "left .15s",
                                    } }) })] }), _jsx("div", { style: sectionTitle, children: "\u4F1A\u8BDD" }), _jsx("button", { onClick: () => actions.rebuildSession(), style: {
                            width: "100%",
                            padding: "9px 10px",
                            borderRadius: 8,
                            fontSize: 14,
                            cursor: "pointer",
                            border: `1px solid ${t.chipBorder}`,
                            background: t.chipBg,
                            color: t.text,
                        }, children: "\u91CD\u5EFA\u4F1A\u8BDD" }), _jsx("div", { style: sectionTitle, children: "\u8BBE\u5907" }), _jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }, children: [_jsx("input", { type: "number", placeholder: "\u5BBD", value: customW, onChange: (e) => setCustomW(e.target.value), style: {
                                    flex: 1,
                                    padding: "7px 10px",
                                    borderRadius: 8,
                                    border: `1px solid ${t.chipBorder}`,
                                    background: t.chipBg,
                                    color: t.text,
                                    fontSize: 13,
                                    outline: "none",
                                    width: "100%",
                                } }), _jsx("span", { style: { color: t.sub, fontSize: 13 }, children: "\u00D7" }), _jsx("input", { type: "number", placeholder: "\u9AD8", value: customH, onChange: (e) => setCustomH(e.target.value), style: {
                                    flex: 1,
                                    padding: "7px 10px",
                                    borderRadius: 8,
                                    border: `1px solid ${t.chipBorder}`,
                                    background: t.chipBg,
                                    color: t.text,
                                    fontSize: 13,
                                    outline: "none",
                                    width: "100%",
                                } })] }), _jsx("button", { onClick: () => {
                            const w = parseInt(customW, 10);
                            const h = parseInt(customH, 10);
                            if (w > 0 && h > 0)
                                actions.setCustomDevice(w, h);
                        }, style: {
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 8,
                            fontSize: 13,
                            cursor: "pointer",
                            border: "none",
                            background: "#00704A",
                            color: "#fff",
                            fontWeight: 600,
                        }, children: "\u5E94\u7528\u81EA\u5B9A\u4E49\u5C3A\u5BF8" }), _jsx("div", { style: { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }, children: [
                            { label: "SE", w: 320, h: 568 },
                            { label: "8", w: 375, h: 667 },
                            { label: "XR", w: 414, h: 896 },
                            { label: "小屏", w: 360, h: 640 },
                        ].map((p) => (_jsxs("button", { onClick: () => {
                                setCustomW(String(p.w));
                                setCustomH(String(p.h));
                                actions.setCustomDevice(p.w, p.h);
                            }, style: {
                                padding: "4px 10px",
                                borderRadius: 6,
                                fontSize: 11,
                                cursor: "pointer",
                                border: `1px solid ${t.chipBorder}`,
                                background: t.chipBg,
                                color: t.sub,
                            }, children: [p.label, " ", p.w, "\u00D7", p.h] }, p.label))) }), _jsx("div", { style: sectionTitle, children: "\u9AD8\u7EA7" }), _jsx("div", { style: { fontSize: 12, color: t.sub, marginBottom: 6 }, children: "\u989C\u8272\u6A21\u62DF" }), _jsx("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }, children: Object.keys(COLOR_FILTERS).map((mode) => {
                            const active = state.colorFilter === mode;
                            return (_jsx("button", { onClick: () => actions.setColorFilter(mode), style: {
                                    padding: "5px 10px",
                                    borderRadius: 6,
                                    fontSize: 11,
                                    cursor: "pointer",
                                    border: `1px solid ${active ? "#00704A" : t.chipBorder}`,
                                    background: active ? "rgba(0,112,74,0.15)" : t.chipBg,
                                    color: active ? "#07C160" : t.text,
                                    fontWeight: active ? 600 : 400,
                                }, children: COLOR_FILTERS[mode].label }, mode));
                        }) }), _jsxs("button", { onClick: () => setDebugOpen((v) => !v), style: {
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 10px",
                            borderRadius: 8,
                            fontSize: 14,
                            cursor: "pointer",
                            border: `1px solid ${t.chipBorder}`,
                            background: t.chipBg,
                            color: t.text,
                        }, children: [_jsx("span", { style: { flex: 1, textAlign: "left" }, children: "\u8C03\u8BD5\u4FE1\u606F" }), _jsx("span", { style: { fontSize: 11, opacity: 0.6 }, children: debugOpen ? "▾" : "▸" })] }), debugOpen && (_jsxs("div", { style: {
                            marginTop: 8,
                            padding: 10,
                            borderRadius: 8,
                            background: t.chipBg,
                            fontFamily: "monospace",
                            fontSize: 12,
                            color: t.urlText,
                            lineHeight: 1.8,
                            wordBreak: "break-all",
                        }, children: [_jsxs("div", { children: ["Environment: ", state.environment] }), _jsxs("div", { children: ["Role: ", identity?.label ?? role] }), _jsxs("div", { children: ["Renderer: ", SURFACE_LABELS[state.experience.surface]] }), _jsxs("div", { children: ["Device ID: ", state.experience.device.id] }), _jsxs("div", { children: ["Route: ", state.experience.page.route] })] }))] }), confirmWrite && (_jsx("div", { style: {
                    position: "fixed",
                    inset: 0,
                    zIndex: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.5)",
                }, children: _jsxs("div", { style: {
                        width: 360,
                        maxWidth: "90vw",
                        background: t.bar,
                        border: `1px solid ${t.chipBorder}`,
                        borderRadius: 12,
                        padding: 20,
                        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
                    }, children: [_jsx("div", { style: { fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 8 }, children: "\u5141\u8BB8\u4FEE\u6539\u771F\u5B9E\u6570\u636E\uFF1F" }), _jsx("div", { style: { fontSize: 13, color: t.sub, lineHeight: 1.6 }, children: "\u5F53\u524D\u64CD\u4F5C\u53EF\u80FD\u76F4\u63A5\u5F71\u54CD\u771F\u5B9E\u4E1A\u52A1\u6570\u636E\u3002\u5173\u95ED\u53EA\u8BFB\u4FDD\u62A4\u540E\uFF0C\u9884\u89C8\u5185\u7684\u5199\u64CD\u4F5C\u5C06\u4E0D\u518D\u88AB\u62E6\u622A\u3002" }), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }, children: [_jsx("button", { onClick: () => setConfirmWrite(false), style: {
                                        padding: "7px 14px",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        cursor: "pointer",
                                        border: `1px solid ${t.chipBorder}`,
                                        background: "transparent",
                                        color: t.text,
                                    }, children: "\u53D6\u6D88" }), _jsx("button", { onClick: confirmEnableWrite, style: {
                                        padding: "7px 14px",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        cursor: "pointer",
                                        border: "none",
                                        background: "#ef4444",
                                        color: "#fff",
                                        fontWeight: 600,
                                    }, children: "\u786E\u8BA4\u5F00\u542F" })] })] }) }))] }));
}
//# sourceMappingURL=settings-drawer.js.map