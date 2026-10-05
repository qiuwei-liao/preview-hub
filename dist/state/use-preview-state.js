"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// Preview Hub — 状态管理 Hook（Context Provider 模式）
// 初始化：loadPersistedState() → 合并 config 默认 → 解析 URL Deep Link（优先级最高）
// 持久化：state 变化时 savePersistedState（只存个人习惯字段）
// 所有子组件通过 usePreviewState() 消费同一 Context，保证状态全局共享。
// 所有配置通过 usePreviewHubConfig() 获取，注册表在 Provider 内部创建。
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePreviewHubConfig } from "../config/context";
import { createDefaultState } from "../config/defaults";
import { createPageRegistry } from "../registry/page";
import { createDeviceRegistry } from "../registry/device";
import { getDefaultDeviceForSurface, getPageRoute, resolvePreviewExperience, } from "./resolver";
import { buildDefaultPersisted, loadPersistedState, savePersistedState, } from "./storage";
import { parsePreviewUrl } from "./url";
const MAX_RECENT = 8;
const PreviewStateContext = createContext(null);
// ─── Internal Hook（实际状态逻辑） ───
function usePreviewStateInternal() {
    const config = usePreviewHubConfig();
    const keyPrefix = config.storageKeyPrefix ?? "preview-hub";
    const previewRoutePath = config.previewRoutePath ?? "/preview";
    // 基于 config 创建注册表（闭包，不随渲染重建）
    const registries = useMemo(() => ({
        pages: createPageRegistry(config.pages, config.pageIdAliases),
        devices: createDeviceRegistry(config.devices),
    }), [config.pages, config.devices, config.pageIdAliases]);
    // 默认状态（config 驱动）
    const defaults = useMemo(() => createDefaultState(config), [config]);
    // 初始化
    const [state, setState] = useState(() => {
        // 构建默认持久化值
        const defaultPersisted = buildDefaultPersisted(keyPrefix, {
            lastRole: defaults.experience.role,
            lastDeviceId: defaults.experience.device.id,
            lastRouteByRole: defaults.lastRouteByRole,
            theme: defaults.theme,
        });
        const persisted = loadPersistedState(keyPrefix, defaultPersisted);
        // 1. 从 persisted 构建基础 experience
        let experience = resolvePreviewExperience({
            role: persisted.lastRole,
            surface: persisted.lastSurface,
            deviceId: persisted.lastDeviceId,
        }, {
            role: defaults.experience.role,
            surface: defaults.experience.surface,
            device: defaults.experience.device,
            page: {
                pageId: defaults.experience.page.pageId,
                route: persisted.lastRouteByRole[persisted.lastRole] ??
                    defaults.experience.page.route,
            },
        }, registries);
        // 2. URL Deep Link 优先级最高
        if (typeof window !== "undefined") {
            const deepLink = parsePreviewUrl(window.location.search);
            experience = resolvePreviewExperience({
                role: deepLink.role,
                surface: deepLink.surface,
                deviceId: deepLink.deviceId,
                pageId: deepLink.pageId,
                route: deepLink.route,
            }, experience, registries);
        }
        return {
            ...defaults,
            experience,
            lastRouteByRole: { ...defaults.lastRouteByRole, ...persisted.lastRouteByRole },
            theme: persisted.theme,
            favorites: persisted.favorites,
            recentPages: persisted.recentPages,
            mode: "focus",
            drawer: null,
        };
    });
    const [reloadKey, setReloadKey] = useState(0);
    // 持久化：state 变化时只写个人习惯字段
    useEffect(() => {
        const persisted = {
            lastRole: state.experience.role,
            lastSurface: state.experience.surface,
            lastDeviceId: state.experience.device.id,
            lastRouteByRole: state.lastRouteByRole,
            theme: state.theme,
            favorites: state.favorites,
            recentPages: state.recentPages,
        };
        savePersistedState(persisted, keyPrefix);
    }, [
        state.experience.role,
        state.experience.surface,
        state.experience.device.id,
        state.lastRouteByRole,
        state.theme,
        state.favorites,
        state.recentPages,
        keyPrefix,
    ]);
    // ─── Actions ───
    const setRole = useCallback((role) => {
        setState((prev) => {
            const lastRoute = prev.lastRouteByRole[role];
            const rememberedPageId = registries.pages.getPageIdByRoute(lastRoute ?? "", prev.experience.surface, role) ??
                registries.pages.getPageIdByRoute(lastRoute ?? "", "web", role) ??
                prev.experience.page.pageId;
            const resolved = resolvePreviewExperience({ role, pageId: rememberedPageId }, {
                ...prev.experience,
                page: { pageId: rememberedPageId, route: lastRoute },
            }, registries);
            return { ...prev, experience: resolved };
        });
    }, [registries]);
    const setSurface = useCallback((surface) => {
        setState((prev) => {
            const pageId = prev.experience.page.pageId;
            const resolved = resolvePreviewExperience({ surface, pageId }, prev.experience, registries);
            return { ...prev, experience: resolved };
        });
    }, [registries]);
    const setDevice = useCallback((deviceId) => {
        setState((prev) => {
            const device = registries.devices.getDeviceById(deviceId);
            if (!device)
                return prev;
            // 校验 surface 约束：mini_program 仅 mobile；app 支持 mobile/tablet；web 全部
            const surface = prev.experience.surface;
            const valid = surface === "mini_program"
                ? device.family === "mobile"
                : surface === "app"
                    ? device.family === "mobile" || device.family === "tablet"
                    : true;
            if (!valid)
                return prev;
            return {
                ...prev,
                experience: {
                    ...prev.experience,
                    device: {
                        ...device,
                        orientation: device.rotatable
                            ? prev.experience.device.orientation
                            : device.orientation,
                    },
                },
            };
        });
    }, [registries]);
    const setPage = useCallback((pageId) => {
        setState((prev) => {
            const normalizedPageId = registries.pages.normalizePageId(pageId);
            if (!registries.pages
                .getPagesForSurface(prev.experience.surface, prev.experience.role)
                .some((page) => page.id === normalizedPageId)) {
                return prev;
            }
            const route = getPageRoute(normalizedPageId, prev.experience.surface, registries.pages);
            if (!route)
                return prev;
            const experience = {
                ...prev.experience,
                page: { pageId: normalizedPageId, route },
            };
            const lastRouteByRole = {
                ...prev.lastRouteByRole,
                [prev.experience.role]: route,
            };
            const recentPages = [
                {
                    role: prev.experience.role,
                    surface: prev.experience.surface,
                    pageId: normalizedPageId,
                    timestamp: Date.now(),
                },
                ...prev.recentPages.filter((r) => !(r.pageId === normalizedPageId &&
                    r.role === prev.experience.role &&
                    r.surface === prev.experience.surface)),
            ].slice(0, MAX_RECENT);
            return { ...prev, experience, lastRouteByRole, recentPages };
        });
    }, [registries]);
    const setOrientation = useCallback((orientation) => {
        setState((prev) => {
            if (!prev.experience.device.rotatable)
                return prev;
            return {
                ...prev,
                experience: {
                    ...prev.experience,
                    device: { ...prev.experience.device, orientation },
                },
            };
        });
    }, []);
    /** 自定义设备：直接设置视口尺寸，创建临时设备 */
    const setCustomDevice = useCallback((width, height) => {
        setState((prev) => {
            const w = Math.max(240, Math.min(1200, Math.round(width)));
            const h = Math.max(320, Math.min(2000, Math.round(height)));
            const customDevice = {
                id: `custom-${w}x${h}`,
                family: "mobile",
                model: `自定义 ${w}×${h}`,
                orientation: "portrait",
                viewport: { width: w, height: h },
                frame: "punch-hole",
                bezel: 10,
                screenRadius: 32,
                frameRadius: 40,
                rotatable: true,
                material: "aluminum",
                safeArea: { top: 24, bottom: 16 },
            };
            return {
                ...prev,
                experience: { ...prev.experience, device: customDevice },
            };
        });
    }, []);
    /** iframe 内部导航上报：把技术 route 归一为当前 surface 的业务页面。 */
    const setRoute = useCallback((route) => {
        setState((prev) => {
            const pageId = registries.pages.getPageIdByRoute(route, prev.experience.surface, prev.experience.role) ??
                registries.pages.getPageIdByRoute(route, "web", prev.experience.role);
            const normalizedRoute = pageId
                ? getPageRoute(pageId, prev.experience.surface, registries.pages) ?? route
                : route;
            const recentPages = pageId
                ? [
                    {
                        role: prev.experience.role,
                        surface: prev.experience.surface,
                        pageId,
                        timestamp: Date.now(),
                    },
                    ...prev.recentPages.filter((item) => !(item.pageId === pageId &&
                        item.role === prev.experience.role &&
                        item.surface === prev.experience.surface)),
                ].slice(0, MAX_RECENT)
                : prev.recentPages;
            return {
                ...prev,
                experience: {
                    ...prev.experience,
                    page: {
                        pageId: pageId ?? prev.experience.page.pageId,
                        route: normalizedRoute,
                    },
                },
                lastRouteByRole: {
                    ...prev.lastRouteByRole,
                    [prev.experience.role]: normalizedRoute,
                },
                recentPages,
            };
        });
    }, [registries]);
    const enterComparison = useCallback(() => {
        setState((prev) => {
            // 默认比较当前 Surface 与它最有价值的对照面：Web ↔ 小程序 / App。
            // 从当前 surface 之外挑一个当前角色有可用页面的载体；都不满足则回落 web。
            const surfaces = ["web", "mini_program", "app"];
            const current = prev.experience.surface;
            const alternateSurface = surfaces.find((s) => s !== current &&
                registries.pages.getPagesForSurface(s, prev.experience.role).length > 0) ?? "web";
            const rightExperience = resolvePreviewExperience({
                role: prev.experience.role,
                surface: alternateSurface,
                pageId: prev.experience.page.pageId,
                deviceId: alternateSurface === "web" && prev.experience.surface === "web"
                    ? "pc-1440"
                    : undefined,
            }, {
                ...prev.experience,
                surface: alternateSurface,
                device: getDefaultDeviceForSurface(alternateSurface, registries.devices),
            }, registries);
            return {
                ...prev,
                mode: "comparison",
                previousFocusExperience: prev.experience,
                comparison: {
                    leftExperience: prev.experience,
                    rightExperience,
                    sync: { page: true, scroll: false, data: false },
                    activeSide: "left",
                },
            };
        });
    }, [registries]);
    const exitComparison = useCallback(() => {
        setState((prev) => {
            if (!prev.previousFocusExperience) {
                return { ...prev, mode: "focus" };
            }
            return {
                ...prev,
                mode: "focus",
                experience: prev.previousFocusExperience,
                previousFocusExperience: undefined,
            };
        });
    }, []);
    const setComparisonSide = useCallback((side, exp) => {
        setState((prev) => {
            const key = side === "left" ? "leftExperience" : "rightExperience";
            const current = prev.comparison[key];
            const next = { ...current, ...exp };
            const resolved = resolvePreviewExperience({
                role: next.role,
                surface: next.surface,
                deviceId: next.device.id,
                pageId: next.page.pageId,
                route: exp.page ? next.page.route : undefined,
                orientation: next.device.orientation,
            }, next, registries);
            return {
                ...prev,
                comparison: {
                    ...prev.comparison,
                    [key]: resolved,
                    activeSide: side,
                },
            };
        });
    }, [registries]);
    const toggleComparisonSync = useCallback((key) => {
        setState((prev) => ({
            ...prev,
            comparison: {
                ...prev.comparison,
                sync: { ...prev.comparison.sync, [key]: !prev.comparison.sync[key] },
            },
        }));
    }, []);
    const openDrawer = useCallback((type) => {
        setState((prev) => ({ ...prev, drawer: type }));
    }, []);
    const closeDrawer = useCallback(() => {
        setState((prev) => ({ ...prev, drawer: null }));
    }, []);
    const setTheme = useCallback((theme) => {
        setState((prev) => ({ ...prev, theme }));
    }, []);
    const setReadOnly = useCallback((readOnly) => {
        setState((prev) => ({ ...prev, readOnly }));
    }, []);
    const setColorFilter = useCallback((colorFilter) => {
        setState((prev) => ({ ...prev, colorFilter }));
    }, []);
    const toggleFavorite = useCallback((pageId) => {
        setState((prev) => {
            const surface = prev.experience.surface;
            const role = prev.experience.role;
            const existing = prev.favorites.find((f) => f.pageId === pageId && f.surface === surface && f.role === role);
            let favorites;
            if (existing) {
                favorites = prev.favorites.filter((f) => f.id !== existing.id);
            }
            else {
                favorites = [
                    ...prev.favorites,
                    {
                        id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        pageId,
                        surface,
                        role,
                        createdAt: Date.now(),
                    },
                ];
            }
            return { ...prev, favorites };
        });
    }, []);
    const recordRecent = useCallback((pageId) => {
        setState((prev) => {
            const recentPages = [
                {
                    role: prev.experience.role,
                    surface: prev.experience.surface,
                    pageId,
                    timestamp: Date.now(),
                },
                ...prev.recentPages.filter((r) => !(r.pageId === pageId && r.role === prev.experience.role)),
            ].slice(0, MAX_RECENT);
            return { ...prev, recentPages };
        });
    }, []);
    const reload = useCallback(() => {
        setReloadKey((k) => k + 1);
    }, []);
    const rebuildSession = useCallback(() => {
        setReloadKey((k) => k + 1);
    }, []);
    return {
        state,
        reloadKey,
        actions: {
            setRole,
            setSurface,
            setDevice,
            setPage,
            setOrientation,
            setCustomDevice,
            enterComparison,
            exitComparison,
            setComparisonSide,
            toggleComparisonSync,
            openDrawer,
            closeDrawer,
            setTheme,
            setReadOnly,
            setColorFilter,
            setRoute,
            toggleFavorite,
            recordRecent,
            reload,
            rebuildSession,
        },
    };
}
// ─── Provider ───
export function PreviewStateProvider({ children }) {
    const value = usePreviewStateInternal();
    return (_jsx(PreviewStateContext.Provider, { value: value, children: children }));
}
// ─── Consumer Hook（所有组件调用此函数，共享同一状态） ───
export function usePreviewState() {
    const ctx = useContext(PreviewStateContext);
    if (!ctx) {
        throw new Error("usePreviewState must be used within <PreviewStateProvider>");
    }
    return ctx;
}
//# sourceMappingURL=use-preview-state.js.map