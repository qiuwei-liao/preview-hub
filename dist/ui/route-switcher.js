"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// RouteSwitcher — 页面就近浮层选择
// 页面列表通过 createPageRegistry(config.pages).getPagesForSurface() 获取。
import { useEffect, useMemo, useRef, useState } from "react";
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
export function RouteSwitcher() {
    const { state, actions } = usePreviewState();
    const config = usePreviewHubConfig();
    const t = getTheme(state.theme);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const rootRef = useRef(null);
    const pageRegistry = useMemo(() => createPageRegistry(config.pages, config.pageIdAliases), [config.pages, config.pageIdAliases]);
    const title = pageRegistry.getPageTitle(state.experience.page.pageId);
    const surface = state.experience.surface;
    const role = state.experience.role;
    const currentPageId = state.experience.page.pageId;
    const allPages = useMemo(() => pageRegistry.getPagesForSurface(surface, role), [pageRegistry, surface, role]);
    const recentPages = useMemo(() => state.recentPages
        .filter((r) => r.role === role && r.surface === surface)
        .map((r) => pageRegistry.getPageById(r.pageId))
        .filter((p) => Boolean(p)), [state.recentPages, role, surface, pageRegistry]);
    const favoritePages = useMemo(() => state.favorites
        .filter((f) => f.role === role && f.surface === surface)
        .map((f) => pageRegistry.getPageById(f.pageId))
        .filter((p) => Boolean(p)), [state.favorites, role, surface, pageRegistry]);
    useEffect(() => {
        if (!open)
            return;
        const handlePointerDown = (event) => {
            const target = event.target;
            if (!(target instanceof Node) || !rootRef.current?.contains(target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape")
                setOpen(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);
    const q = query.trim().toLowerCase();
    const visiblePages = q
        ? allPages.filter((p) => p.title.toLowerCase().includes(q))
        : allPages;
    const isFav = (pageId) => state.favorites.some((f) => f.pageId === pageId && f.role === role && f.surface === surface);
    const go = (pageId) => {
        actions.setPage(pageId);
        setOpen(false);
    };
    const rowStyle = (active) => ({
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        fontSize: 14,
        cursor: "pointer",
        border: "none",
        textAlign: "left",
        background: active ? "rgba(0,112,74,0.12)" : "transparent",
        color: t.text,
    });
    const Row = ({ page }) => {
        const active = page.id === currentPageId;
        return (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 2 }, onMouseEnter: (e) => {
                if (!active)
                    e.currentTarget.style.background = t.chipBg;
            }, onMouseLeave: (e) => {
                e.currentTarget.style.background = active
                    ? "rgba(0,112,74,0.12)"
                    : "transparent";
            }, children: [_jsxs("button", { style: rowStyle(active), onClick: () => go(page.id), children: [_jsx("span", { style: { flex: 1 }, children: page.title }), active && (_jsx("span", { style: { fontSize: 11, color: "#00704A", fontWeight: 600 }, children: "\u5F53\u524D" }))] }), _jsx("button", { onClick: () => actions.toggleFavorite(page.id), title: isFav(page.id) ? "取消收藏" : "收藏", style: {
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 14,
                        color: isFav(page.id) ? "#fbbf24" : t.sub,
                        padding: "4px 6px",
                    }, children: isFav(page.id) ? "★" : "☆" })] }));
    };
    const sectionTitleStyle = () => ({
        fontSize: 11,
        fontWeight: 600,
        color: t.sub,
        padding: "12px 10px 4px",
        letterSpacing: 0.5,
    });
    return (_jsxs("div", { ref: rootRef, style: { position: "relative" }, children: [_jsxs("button", { onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-haspopup": "dialog", title: "\u6D4F\u89C8 / \u641C\u7D22\u9875\u9762", style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 8,
                    fontSize: 14,
                    cursor: "pointer",
                    border: `1px solid ${open ? "#00704A" : t.chipBorder}`,
                    background: t.chipBg,
                    color: t.text,
                    lineHeight: 1.2,
                }, children: [title, _jsx("span", { style: { fontSize: 10, opacity: 0.6 }, children: "\u25BE" })] }), open && (_jsxs("div", { role: "dialog", "aria-label": "\u9009\u62E9\u9875\u9762", style: {
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    zIndex: 120,
                    width: 320,
                    maxWidth: "calc(100vw - 24px)",
                    padding: 10,
                    border: `1px solid ${t.chipBorder}`,
                    borderRadius: 12,
                    background: t.bar,
                    boxShadow: "0 14px 36px rgba(0,0,0,0.28)",
                }, children: [_jsx("input", { autoFocus: open, value: query, onChange: (e) => setQuery(e.target.value), placeholder: "\u641C\u7D22\u9875\u9762", style: {
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "8px 10px",
                            borderRadius: 8,
                            fontSize: 14,
                            border: `1px solid ${t.chipBorder}`,
                            background: t.chipBg,
                            color: t.text,
                            outline: "none",
                        } }), _jsx("div", { style: { maxHeight: 320, overflowY: "auto", marginTop: 8 }, children: q ? (visiblePages.length === 0 ? (_jsx("div", { style: { fontSize: 13, color: t.sub, padding: "16px 10px" }, children: "\u65E0\u5339\u914D\u9875\u9762" })) : (visiblePages.map((p) => _jsx(Row, { page: p }, p.id)))) : (_jsxs(_Fragment, { children: [recentPages.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { style: sectionTitleStyle(), children: "\u6700\u8FD1" }), recentPages.map((p) => (_jsx(Row, { page: p }, `recent-${p.id}`)))] })), favoritePages.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { style: sectionTitleStyle(), children: "\u6536\u85CF" }), favoritePages.map((p) => (_jsx(Row, { page: p }, `fav-${p.id}`)))] })), _jsx("div", { style: sectionTitleStyle(), children: "\u5168\u90E8\u9875\u9762" }), visiblePages.map((p) => (_jsx(Row, { page: p }, p.id)))] })) })] }))] }));
}
//# sourceMappingURL=route-switcher.js.map