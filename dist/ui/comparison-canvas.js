"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// Comparison 模式画布
// 左右等宽双栏，支持任意 experience 组合。
// 注册表通过 config 创建，角色标签从 config.roles 获取。
import { useEffect, useMemo, useRef, useState } from "react";
import { SURFACE_LABELS, } from "../types";
import { getTheme } from "../config/defaults";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
import { createDeviceRegistry } from "../registry/device";
import { getPageRoute } from "../state/resolver";
import { WebRenderer, getDeviceOuterSize } from "../renderer/web-renderer";
import { MiniProgramRenderer } from "../renderer/mini-program-renderer";
import { getMiniProgramShellSize } from "../renderer/mini-program-shell";
import { AppRenderer } from "../renderer/app-renderer";
import { getAppShellSize } from "../renderer/app-shell";
function ComparisonColumn({ side, experience, readOnly, onSideChange, onRouteChange, rendererCallbacks, scale, }) {
    const isMini = experience.surface === "mini_program";
    const isApp = experience.surface === "app";
    const natural = isMini
        ? getMiniProgramShellSize(experience.device)
        : isApp
            ? getAppShellSize(experience.device)
            : getDeviceOuterSize(experience.device);
    return (_jsxs("div", { style: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
        }, children: [_jsxs("span", { style: { fontSize: 12, color: "#8b949e" }, children: [side === "left" ? "左" : "右", " \u00B7 ", SURFACE_LABELS[experience.surface], " \u00B7 ", experience.device.model] }), _jsx("div", { style: {
                    width: natural.width * scale,
                    height: natural.height * scale,
                    transition: "width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
                }, children: _jsx("div", { style: {
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        width: natural.width,
                        height: natural.height,
                        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                    }, children: isMini ? (_jsx(MiniProgramRenderer, { experience: experience, readOnly: readOnly, ...rendererCallbacks, onRouteChange: (route) => onRouteChange(side, route) })) : isApp ? (_jsx(AppRenderer, { experience: experience, readOnly: readOnly, ...rendererCallbacks, onRouteChange: (route) => onRouteChange(side, route) })) : (_jsx(WebRenderer, { experience: experience, readOnly: readOnly, ...rendererCallbacks, onRouteChange: (route) => onRouteChange(side, route) })) }) })] }));
}
export function ComparisonCanvas({ comparison, readOnly, onSideChange, onToggleSync, onRouteChange, onReady, on401, onIframeReady, theme = "dark", }) {
    const config = usePreviewHubConfig();
    const t = getTheme(theme);
    const [win, setWin] = useState(() => ({
        w: typeof window === "undefined" ? 1200 : window.innerWidth,
        h: typeof window === "undefined" ? 900 : window.innerHeight,
    }));
    const [lockScale, setLockScale] = useState(false);
    // 左右 iframe 的 contentWindow，用于滚动同步
    const leftIframeWin = useRef(null);
    const rightIframeWin = useRef(null);
    // 包装 onIframeReady，按 side 存储对应的 window
    const handleIframeReady = (side) => (win) => {
        if (side === "left")
            leftIframeWin.current = win;
        else
            rightIframeWin.current = win;
        onIframeReady?.(win);
    };
    // 滚动同步：一侧滚动时，若 sync.scroll 开启，向另一侧发送 set-scroll
    const handleScroll = (side) => (scrollTop, _scrollLeft) => {
        if (!comparison.sync.scroll)
            return;
        const targetWin = side === "left" ? rightIframeWin.current : leftIframeWin.current;
        if (targetWin) {
            targetWin.postMessage({ type: "preview:set-scroll", scrollTop }, "*");
        }
    };
    const pageRegistry = useMemo(() => createPageRegistry(config.pages, config.pageIdAliases), [config.pages, config.pageIdAliases]);
    const deviceRegistry = useMemo(() => createDeviceRegistry(config.devices), [config.devices]);
    useEffect(() => {
        const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight });
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    // 双栏各自按 half-viewport 缩放；锁定缩放时取较小值
    const scaleFor = (exp) => {
        const natural = exp.surface === "mini_program"
            ? getMiniProgramShellSize(exp.device)
            : exp.surface === "app"
                ? getAppShellSize(exp.device)
                : getDeviceOuterSize(exp.device);
        return Math.max(0.2, Math.min((win.h - 220) / natural.height, (win.w / 2 - 60) / natural.width, 0.6));
    };
    const leftScale = scaleFor(comparison.leftExperience);
    const rightScale = scaleFor(comparison.rightExperience);
    const sharedScale = Math.min(leftScale, rightScale);
    const handleRouteChange = (side, route) => {
        onRouteChange?.(route);
        const source = comparison[side === "left" ? "leftExperience" : "rightExperience"];
        // iframe 实际加载的是同源 Web 页面，优先按 Web route 反查业务页。
        const pageId = pageRegistry.getPageIdByRoute(route, "web", source.role) ??
            pageRegistry.getPageIdByRoute(route, source.surface, source.role);
        if (!pageId)
            return;
        const sourceRoute = getPageRoute(pageId, source.surface, pageRegistry) ?? route;
        onSideChange(side, {
            page: { pageId, route: sourceRoute },
        });
        // 同步页面时保持对侧 Surface 的 route 投影
        if (!comparison.sync.page)
            return;
        const otherSide = side === "left" ? "right" : "left";
        const other = comparison[otherSide === "left" ? "leftExperience" : "rightExperience"];
        const otherRoute = getPageRoute(pageId, other.surface, pageRegistry);
        if (!otherRoute)
            return;
        onSideChange(otherSide, {
            page: { pageId, route: otherRoute },
        });
    };
    const syncKeys = [
        { key: "page", label: "同步页面" },
        { key: "scroll", label: "同步滚动" },
        { key: "data", label: "同步数据" },
    ];
    return (_jsxs("div", { style: {
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 16,
            minHeight: "calc(100dvh - 56px)",
            background: t.bgGrad,
        }, children: [_jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }, children: [syncKeys.map(({ key, label }) => {
                        const on = comparison.sync[key];
                        return (_jsxs("button", { onClick: () => onToggleSync(key), style: {
                                padding: "4px 12px",
                                borderRadius: 999,
                                fontSize: 12,
                                cursor: "pointer",
                                border: `1px solid ${on ? "#07C160" : t.chipBorder}`,
                                background: on ? "rgba(7,193,96,0.18)" : t.chipBg,
                                color: on ? "#07C160" : t.btnText,
                                fontWeight: on ? 600 : 400,
                            }, children: [label, on ? " · 开" : ""] }, key));
                    }), _jsxs("button", { onClick: () => setLockScale((v) => !v), style: {
                            padding: "4px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            cursor: "pointer",
                            border: `1px solid ${lockScale ? "#07C160" : t.chipBorder}`,
                            background: lockScale ? "rgba(7,193,96,0.18)" : t.chipBg,
                            color: lockScale ? "#07C160" : t.btnText,
                            fontWeight: lockScale ? 600 : 400,
                        }, children: ["\u9501\u5B9A\u7F29\u653E", lockScale ? " · 开" : ""] })] }), _jsxs("div", { style: { display: "flex", flex: 1, gap: 20, alignItems: "flex-start" }, children: [_jsx(ComparisonColumn, { side: "left", experience: comparison.leftExperience, readOnly: readOnly, onSideChange: onSideChange, onRouteChange: handleRouteChange, rendererCallbacks: { onReady, on401, onIframeReady: handleIframeReady("left"), onScroll: handleScroll("left") }, scale: lockScale ? sharedScale : leftScale }), _jsx(ComparisonColumn, { side: "right", experience: comparison.rightExperience, readOnly: readOnly, onSideChange: onSideChange, onRouteChange: handleRouteChange, rendererCallbacks: { onReady, on401, onIframeReady: handleIframeReady("right"), onScroll: handleScroll("right") }, scale: lockScale ? sharedScale : rightScale })] })] }));
}
//# sourceMappingURL=comparison-canvas.js.map