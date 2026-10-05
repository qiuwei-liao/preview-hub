"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Preview Hub — ⌘K 命令面板
// 命令项基于 config 动态生成（页面、角色、设备）。
import { useEffect, useMemo, useRef, useState } from "react";
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
import { COMMAND_PALETTE_EVENT } from "../hooks/use-keyboard-shortcuts";
import { SURFACE_LABELS } from "../types";
export function CommandPalette() {
    const { state, actions } = usePreviewState();
    const config = usePreviewHubConfig();
    const t = getTheme(state.theme);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const pageRegistry = useMemo(() => createPageRegistry(config.pages, config.pageIdAliases), [config.pages, config.pageIdAliases]);
    // ——— 监听全局 ⌘K 开关事件 ———
    useEffect(() => {
        const handler = () => {
            setOpen((v) => !v);
            setQuery("");
            setActiveIndex(0);
        };
        window.addEventListener(COMMAND_PALETTE_EVENT, handler);
        return () => window.removeEventListener(COMMAND_PALETTE_EVENT, handler);
    }, []);
    // ——— 打开后聚焦搜索框 ———
    useEffect(() => {
        if (open) {
            const id = window.setTimeout(() => inputRef.current?.focus(), 0);
            return () => window.clearTimeout(id);
        }
    }, [open]);
    // ——— 构建命令列表 ———
    const commands = useMemo(() => {
        const list = [];
        const role = state.experience.role;
        // 角色
        config.roles.forEach((r, idx) => {
            list.push({
                id: `role-${r.id}`,
                label: `切换到 ${r.label}`,
                hint: r.id === role ? "当前" : "⌘" + (idx + 1),
                run: () => actions.setRole(r.id),
            });
        });
        // 载体
        ;
        Object.keys(SURFACE_LABELS).forEach((s) => {
            list.push({
                id: `surface-${s}`,
                label: `切换到 ${SURFACE_LABELS[s]}`,
                hint: s === state.experience.surface ? "当前" : undefined,
                run: () => actions.setSurface(s),
            });
        });
        // 页面（按当前 surface + role 过滤）
        pageRegistry.getPagesForSurface(state.experience.surface, role).forEach((p) => {
            list.push({
                id: `page-${p.id}`,
                label: `打开页面：${p.title}`,
                hint: p.id === state.experience.page.pageId ? "当前" : undefined,
                run: () => actions.setPage(p.id),
            });
        });
        // 对比
        if (state.mode === "focus") {
            list.push({
                id: "enter-comparison",
                label: "进入对比模式",
                hint: "⌘⇧Enter",
                run: () => actions.enterComparison(),
            });
        }
        else {
            list.push({
                id: "exit-comparison",
                label: "退出对比模式",
                hint: "⌘⇧Enter",
                run: () => actions.exitComparison(),
            });
        }
        // 会话 / 设置
        list.push({
            id: "rebuild-session",
            label: "重建会话（重新登录）",
            run: () => actions.rebuildSession(),
        });
        list.push({
            id: "open-settings",
            label: "打开设置",
            run: () => actions.openDrawer("settings"),
        });
        return list;
    }, [state, actions, config.roles, pageRegistry]);
    // ——— 搜索过滤 ———
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return commands;
        return commands.filter((c) => c.label.toLowerCase().includes(q));
    }, [commands, query]);
    // 过滤结果变化时复位高亮
    useEffect(() => {
        setActiveIndex(0);
    }, [query]);
    const close = () => setOpen(false);
    // ——— 打开期间：capture 阶段拦截键盘 ———
    useEffect(() => {
        if (!open)
            return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                e.preventDefault();
                close();
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex((i) => Math.max(i - 1, 0));
                return;
            }
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                const cmd = filtered[activeIndex];
                if (cmd) {
                    cmd.run();
                    close();
                }
            }
        };
        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [open, filtered, activeIndex]);
    if (!open)
        return null;
    return (_jsx("div", { onMouseDown: (e) => {
            if (e.target === e.currentTarget)
                close();
        }, style: {
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "15vh",
        }, children: _jsxs("div", { style: {
                width: "min(560px, 90vw)",
                background: t.bar,
                border: `1px solid ${t.chipBorder}`,
                borderRadius: 12,
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                overflow: "hidden",
            }, children: [_jsx("input", { ref: inputRef, value: query, onChange: (e) => setQuery(e.target.value), placeholder: "\u8F93\u5165\u547D\u4EE4\u6216\u641C\u7D22\u9875\u9762\u2026\uFF08\u2318K\uFF09", style: {
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        fontSize: 14,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        color: t.text,
                        borderBottom: `1px solid ${t.chipBorder}`,
                    } }), _jsxs("div", { style: { maxHeight: 320, overflowY: "auto" }, children: [filtered.length === 0 && (_jsx("div", { style: { padding: "16px", fontSize: 13, color: t.sub }, children: "\u65E0\u5339\u914D\u547D\u4EE4" })), filtered.map((cmd, i) => (_jsxs("button", { onMouseEnter: () => setActiveIndex(i), onClick: () => {
                                cmd.run();
                                close();
                            }, style: {
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                textAlign: "left",
                                padding: "9px 16px",
                                fontSize: 13,
                                border: "none",
                                cursor: "pointer",
                                background: i === activeIndex ? "#00704A" : "transparent",
                                color: i === activeIndex ? "#fff" : t.text,
                            }, children: [_jsx("span", { style: { flex: 1 }, children: cmd.label }), cmd.hint && (_jsx("span", { style: {
                                        fontSize: 11,
                                        opacity: 0.65,
                                        marginLeft: 12,
                                    }, children: cmd.hint }))] }, cmd.id)))] })] }) }));
}
//# sourceMappingURL=command-palette.js.map