"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Preview Hub — 小程序 Surface 渲染器
// 产品模型上与 WebRenderer 分离：内部维护小程序页面栈（push/pop/back/tabSwitch），
// iframe 仍加载同源页面（通过 config.iframeBaseUrl 拼接 route）。
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listenPreviewMessages, sendToIframe } from "./bus";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
import { MiniProgramShell } from "./mini-program-shell";
import { createMiniProgramNavigator, getCurrentPage, canGoBack as canGoBackFn, } from "./mini-program-navigation";
/** experience.page → PageDef（Registry 未命中时用 experience 兜底合成） */
function pageDefFromExperience(experience, pageRegistry) {
    const found = pageRegistry.getPageById(experience.page.pageId);
    if (found)
        return found;
    return {
        id: experience.page.pageId,
        title: experience.page.route,
        web: { route: experience.page.route },
    };
}
export function MiniProgramRenderer({ experience, readOnly, onRouteChange, onReady, on401, onIframeReady, }) {
    const config = usePreviewHubConfig();
    const iframeBaseUrl = config.iframeBaseUrl ?? "";
    // 基于 config 创建 pageRegistry 和 mini-program navigator
    const pageRegistry = useMemo(() => createPageRegistry(config.pages, config.pageIdAliases), [config.pages, config.pageIdAliases]);
    const navigator = useMemo(() => {
        const tabbarPageIds = new Set((config.miniapp?.tabbar ?? []).map((t) => t.pageId));
        return createMiniProgramNavigator(tabbarPageIds, (id) => pageRegistry.getPageById(id));
    }, [config.miniapp?.tabbar, pageRegistry]);
    const iframeRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [nav, setNav] = useState(() => navigator.createNavigation(pageDefFromExperience(experience, pageRegistry), experience.page.route));
    const syncNavigationFromRoute = useCallback((route) => {
        const pageId = pageRegistry.getPageIdByRoute(route, "web", experience.role);
        const page = pageId ? pageRegistry.getPageById(pageId) : undefined;
        setNav((prev) => {
            const current = getCurrentPage(prev);
            if (current.route.split("?")[0] === route.split("?")[0])
                return prev;
            if (prev.stack[prev.currentIndex - 1]?.route === route) {
                return navigator.navigateBack(prev);
            }
            if (page && pageId && navigator.isTabPage(pageId)) {
                return navigator.switchTab(prev, pageId);
            }
            const destination = page ?? {
                id: route,
                title: "详情",
                web: { route },
            };
            return navigator.navigateTo(prev, destination);
        });
    }, [experience.role, pageRegistry, navigator]);
    // 外部 setPage → 映射为导航动作
    useEffect(() => {
        const targetPageId = experience.page.pageId;
        setNav((prev) => {
            if (getCurrentPage(prev).pageId === targetPageId)
                return prev;
            const page = pageRegistry.getPageById(targetPageId);
            if (!page)
                return prev;
            return navigator.isTabPage(targetPageId)
                ? navigator.switchTab(prev, targetPageId)
                : navigator.navigateTo(prev, page);
        });
        setLoading(true);
    }, [experience.page.pageId, pageRegistry, navigator]);
    // iframe 消息路由
    useEffect(() => {
        const unlisten = listenPreviewMessages((msg, source) => {
            if (source !== iframeRef.current?.contentWindow)
                return;
            if (msg.type === "preview:ready") {
                if (msg.route) {
                    syncNavigationFromRoute(msg.route);
                    onRouteChange?.(msg.route);
                }
                onReady?.();
            }
            else if (msg.type === "preview:route-changed") {
                if (msg.route) {
                    syncNavigationFromRoute(msg.route);
                    onRouteChange?.(msg.route);
                }
            }
            else if (msg.type === "preview:401") {
                on401?.();
            }
        });
        return unlisten;
    }, [onRouteChange, onReady, on401, syncNavigationFromRoute]);
    const current = getCurrentPage(nav);
    const src = iframeBaseUrl + current.route;
    // route 切换 → 重新加载 iframe + 上报只读
    useEffect(() => {
        const win = iframeRef.current?.contentWindow;
        if (win)
            sendToIframe(win, { type: "preview:set-readonly", enabled: readOnly });
    }, [readOnly, src, loading]);
    const handleNavigateBack = () => {
        if (canGoBackFn(nav)) {
            const next = navigator.navigateBack(nav);
            setNav(next);
            onRouteChange?.(getCurrentPage(next).route);
        }
    };
    const handleSwitchTab = (pageId) => {
        const next = navigator.switchTab(nav, pageId);
        if (next === nav)
            return;
        setNav(next);
        onRouteChange?.(getCurrentPage(next).route);
    };
    /** 小程序壳已有原生 TabBar，隐藏 iframe 内网页自带的底部导航（同源直操作 DOM）。 */
    const hideWebTabbar = () => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc)
            return;
        let style = doc.getElementById("preview-hide-web-tabbar");
        if (!style) {
            style = doc.createElement("style");
            style.id = "preview-hide-web-tabbar";
            doc.head.appendChild(style);
        }
        style.textContent =
            'nav[class*="bottom-0"][class*="z-50"], nav.fixed.inset-x-0.bottom-0.z-50 { display: none !important; }' +
                'div.fixed.inset-x-0.bottom-16.z-40 { bottom: 4px !important; }' +
                '.nextjs-toast, #devtools-indicator { display: none !important; }';
    };
    return (_jsxs(MiniProgramShell, { navigationState: nav, onNavigateBack: handleNavigateBack, onSwitchTab: handleSwitchTab, device: experience.device, children: [_jsx("iframe", { ref: iframeRef, src: src, title: current.title, onLoad: () => {
                    setLoading(false);
                    onReady?.();
                    hideWebTabbar();
                    const win = iframeRef.current?.contentWindow;
                    if (win)
                        onIframeReady?.(win);
                }, style: {
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                    background: "#f5f6f7",
                } }, src), loading && (_jsx("div", { style: {
                    position: "absolute",
                    inset: 0,
                    background: "#f5f6f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#8b949e",
                    pointerEvents: "none",
                }, children: "\u52A0\u8F7D\u4E2D\u2026" }))] }));
}
//# sourceMappingURL=mini-program-renderer.js.map