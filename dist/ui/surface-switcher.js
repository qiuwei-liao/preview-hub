"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// SurfaceSwitcher — Web / 小程序 分段切换
// 根据当前 Role 的可用页面能力过滤：若该 Role 在 mini_program 下没有任何页面，则小程序选项不可选。
import { useMemo } from "react";
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
import { SURFACE_LABELS } from "../types";
const SURFACES = ["web", "mini_program", "app"];
const MINI_GREEN = "#07C160";
const APP_BLUE = "#007AFF";
export function SurfaceSwitcher() {
    const { state, actions } = usePreviewState();
    const config = usePreviewHubConfig();
    const t = getTheme(state.theme);
    const current = state.experience.surface;
    const pageRegistry = useMemo(() => createPageRegistry(config.pages, config.pageIdAliases), [config.pages, config.pageIdAliases]);
    // 当前 Role 在 mini_program / app 下是否有可用页面
    const miniSupported = pageRegistry.getPagesForSurface("mini_program", state.experience.role).length > 0;
    const appSupported = pageRegistry.getPagesForSurface("app", state.experience.role).length > 0;
    const isDisabled = (s) => (s === "mini_program" && !miniSupported) || (s === "app" && !appSupported);
    const accentColor = (s) => s === "mini_program" ? MINI_GREEN : s === "app" ? APP_BLUE : t.text;
    return (_jsx("div", { style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            padding: 2,
            borderRadius: 8,
            border: `1px solid ${t.chipBorder}`,
            background: t.chipBg,
        }, children: SURFACES.map((s) => {
            const active = s === current;
            const disabled = isDisabled(s);
            return (_jsx("button", { disabled: disabled, onClick: () => actions.setSurface(s), title: disabled ? "当前角色不支持该载体" : `切换为${SURFACE_LABELS[s]}`, style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontSize: 14,
                    lineHeight: 1.2,
                    cursor: disabled ? "not-allowed" : "pointer",
                    border: "none",
                    opacity: disabled ? 0.45 : 1,
                    background: active ? "#00704A" : "transparent",
                    color: active ? "#fff" : accentColor(s),
                    fontWeight: active || s !== "web" ? 600 : 400,
                }, children: SURFACE_LABELS[s] }, s));
        }) }));
}
//# sourceMappingURL=surface-switcher.js.map