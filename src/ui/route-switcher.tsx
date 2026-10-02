"use client";

// RouteSwitcher — 页面就近浮层选择
// 页面列表通过 createPageRegistry(config.pages).getPagesForSurface() 获取。

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
import type { PageDef } from "../types";

export function RouteSwitcher() {
  const { state, actions } = usePreviewState();
  const config = usePreviewHubConfig();
  const t = getTheme(state.theme);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const pageRegistry = useMemo(
    () => createPageRegistry(config.pages, config.pageIdAliases),
    [config.pages, config.pageIdAliases],
  );

  const title = pageRegistry.getPageTitle(state.experience.page.pageId);
  const surface = state.experience.surface;
  const role = state.experience.role;
  const currentPageId = state.experience.page.pageId;

  const allPages = useMemo(
    () => pageRegistry.getPagesForSurface(surface, role),
    [pageRegistry, surface, role],
  );

  const recentPages = useMemo(
    () =>
      state.recentPages
        .filter((r) => r.role === role && r.surface === surface)
        .map((r) => pageRegistry.getPageById(r.pageId))
        .filter((p): p is PageDef => Boolean(p)),
    [state.recentPages, role, surface, pageRegistry],
  );

  const favoritePages = useMemo(
    () =>
      state.favorites
        .filter((f) => f.role === role && f.surface === surface)
        .map((f) => pageRegistry.getPageById(f.pageId))
        .filter((p): p is PageDef => Boolean(p)),
    [state.favorites, role, surface, pageRegistry],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
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

  const isFav = (pageId: string) =>
    state.favorites.some(
      (f) => f.pageId === pageId && f.role === role && f.surface === surface,
    );

  const go = (pageId: string) => {
    actions.setPage(pageId);
    setOpen(false);
  };

  const rowStyle = (active: boolean): CSSProperties => ({
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

  const Row = ({ page }: { page: PageDef }) => {
    const active = page.id === currentPageId;
    return (
      <div
        style={{ display: "flex", alignItems: "center", gap: 2 }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = t.chipBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = active
            ? "rgba(0,112,74,0.12)"
            : "transparent";
        }}
      >
        <button style={rowStyle(active)} onClick={() => go(page.id)}>
          <span style={{ flex: 1 }}>{page.title}</span>
          {active && (
            <span style={{ fontSize: 11, color: "#00704A", fontWeight: 600 }}>
              当前
            </span>
          )}
        </button>
        <button
          onClick={() => actions.toggleFavorite(page.id)}
          title={isFav(page.id) ? "取消收藏" : "收藏"}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
            color: isFav(page.id) ? "#fbbf24" : t.sub,
            padding: "4px 6px",
          }}
        >
          {isFav(page.id) ? "★" : "☆"}
        </button>
      </div>
    );
  };

  const sectionTitleStyle = (): CSSProperties => ({
    fontSize: 11,
    fontWeight: 600,
    color: t.sub,
    padding: "12px 10px 4px",
    letterSpacing: 0.5,
  });

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="浏览 / 搜索页面"
        style={{
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
        }}
      >
        {title}
        <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="选择页面"
          style={{
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
          }}
        >
          <input
            autoFocus={open}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索页面"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 14,
              border: `1px solid ${t.chipBorder}`,
              background: t.chipBg,
              color: t.text,
              outline: "none",
            }}
          />

          <div style={{ maxHeight: 320, overflowY: "auto", marginTop: 8 }}>
            {q ? (
              visiblePages.length === 0 ? (
                <div style={{ fontSize: 13, color: t.sub, padding: "16px 10px" }}>
                  无匹配页面
                </div>
              ) : (
                visiblePages.map((p) => <Row key={p.id} page={p} />)
              )
            ) : (
              <>
                {recentPages.length > 0 && (
                  <>
                    <div style={sectionTitleStyle()}>最近</div>
                    {recentPages.map((p) => (
                      <Row key={`recent-${p.id}`} page={p} />
                    ))}
                  </>
                )}

                {favoritePages.length > 0 && (
                  <>
                    <div style={sectionTitleStyle()}>收藏</div>
                    {favoritePages.map((p) => (
                      <Row key={`fav-${p.id}`} page={p} />
                    ))}
                  </>
                )}

                <div style={sectionTitleStyle()}>全部页面</div>
                {visiblePages.map((p) => (
                  <Row key={p.id} page={p} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
