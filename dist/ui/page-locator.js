"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// PageLocator — 页面定位条
// 常驻展示当前预览页面的「实际路由地址 + 源文件路径」。
import { useEffect, useMemo, useRef, useState } from "react";
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
export function PageLocator() {
    const { state } = usePreviewState();
    const config = usePreviewHubConfig();
    const t = getTheme(state.theme);
    const pageRegistry = useMemo(() => createPageRegistry(config.pages, config.pageIdAliases), [config.pages, config.pageIdAliases]);
    // 对比模式：跟随当前激活栏；Focus 模式：主 experience
    const exp = state.mode === "comparison"
        ? state.comparison.activeSide === "left"
            ? state.comparison.leftExperience
            : state.comparison.rightExperience
        : state.experience;
    const pageId = exp.page.pageId;
    const page = pageRegistry.getPageById(pageId);
    const route = pageRegistry.getPageRoute(pageId, "web") ?? "—";
    const file = page?.sourceFile ?? "—";
    const sideLabel = state.mode === "comparison" ? "对比·当前栏" : "定位";
    const [copied, setCopied] = useState(null);
    const timerRef = useRef(null);
    useEffect(() => () => {
        if (timerRef.current)
            window.clearTimeout(timerRef.current);
    }, []);
    const copy = async (kind, text) => {
        try {
            await navigator.clipboard.writeText(text);
        }
        catch {
            return;
        }
        setCopied(kind);
        if (timerRef.current)
            window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopied(null), 1500);
    };
    const copyButtonStyle = (active) => ({
        flexShrink: 0,
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 11,
        lineHeight: 1.6,
        cursor: "pointer",
        border: `1px solid ${t.chipBorder}`,
        background: active ? "#00704A" : t.chipBg,
        color: active ? "#fff" : t.sub,
    });
    const codeStyle = (flex) => ({
        flex,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: 12,
        color: t.text,
        background: t.chipBg,
        border: `1px solid ${t.chipBorder}`,
        borderRadius: 6,
        padding: "1px 6px",
    });
    return (_jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "4px 16px",
            fontSize: 12,
            borderTop: `1px solid ${t.barBorder}`,
            background: t.bar,
            color: t.sub,
        }, children: [_jsx("span", { style: {
                    flexShrink: 0,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    opacity: 0.85,
                }, children: sideLabel }), _jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, children: [_jsx("span", { style: { flexShrink: 0, opacity: 0.7 }, children: "\u8DEF\u7531" }), _jsx("code", { title: route, style: codeStyle("0 1 auto"), children: route }), _jsx("button", { onClick: () => copy("route", route), title: "\u590D\u5236\u8DEF\u7531\u5730\u5740", style: copyButtonStyle(copied === "route"), children: copied === "route" ? "已复制" : "复制" })] }), _jsx("span", { style: { flexShrink: 0, opacity: 0.5 }, children: "\u2502" }), _jsxs("span", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    minWidth: 0,
                    flex: "1 1 auto",
                }, children: [_jsx("span", { style: { flexShrink: 0, opacity: 0.7 }, children: "\u6587\u4EF6" }), _jsx("code", { title: file, style: codeStyle("1 1 auto"), children: file }), _jsx("button", { onClick: () => copy("file", file), title: "\u590D\u5236\u6E90\u6587\u4EF6\u8DEF\u5F84", style: copyButtonStyle(copied === "file"), children: copied === "file" ? "已复制" : "复制" })] })] }));
}
//# sourceMappingURL=page-locator.js.map