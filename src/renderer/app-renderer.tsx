"use client";

// Preview Hub — App Surface 渲染器
// 产品模型：原生 App 内嵌 WebView。单页 iframe（route 变化重建），
// 底部 TabBar 由 config.app.tabbar 驱动，导航即换页（无小程序页面栈语义）。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PageDef, PreviewExperience } from "../types";
import { listenPreviewMessages, sendToIframe } from "./bus";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
import type { SurfaceRendererProps } from "./web-renderer";
import { AppShell } from "./app-shell";

/** experience.page → PageDef（Registry 未命中时用 experience 兜底合成） */
function pageDefFromExperience(
  experience: PreviewExperience,
  pageRegistry: ReturnType<typeof createPageRegistry>,
): PageDef {
  const found = pageRegistry.getPageById(experience.page.pageId);
  if (found) return found;
  return {
    id: experience.page.pageId,
    title: experience.page.route,
    web: { route: experience.page.route },
    app: { route: experience.page.route },
  };
}

export function AppRenderer({
  experience,
  readOnly,
  onRouteChange,
  onReady,
  on401,
  onIframeReady,
}: SurfaceRendererProps) {
  const config = usePreviewHubConfig();
  const iframeBaseUrl = config.iframeBaseUrl ?? "";

  const pageRegistry = useMemo(
    () => createPageRegistry(config.pages, config.pageIdAliases),
    [config.pages, config.pageIdAliases],
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  // 当前 WebView 路由：跟随外部 experience 变化，TabBar 点击时本地更新并上报
  const [route, setRoute] = useState(experience.page.route);
  useEffect(() => {
    setRoute(experience.page.route);
  }, [experience.page.route]);

  const current = pageDefFromExperience(experience, pageRegistry);
  const src = iframeBaseUrl + route;

  // 只读指令同步给 iframe
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (win) sendToIframe(win, { type: "preview:set-readonly", enabled: readOnly });
  }, [readOnly, src, loading]);

  // iframe 消息路由
  useEffect(() => {
    const unlisten = listenPreviewMessages((msg, source) => {
      if (source !== iframeRef.current?.contentWindow) return;
      if (msg.type === "preview:ready") {
        if (msg.route) {
          setRoute(msg.route);
          onRouteChange?.(msg.route);
        }
        onReady?.();
      } else if (msg.type === "preview:route-changed") {
        if (msg.route) {
          setRoute(msg.route);
          onRouteChange?.(msg.route);
        }
      } else if (msg.type === "preview:401") {
        on401?.();
      }
    });
    return unlisten;
  }, [onRouteChange, onReady, on401]);

  const handleSwitchTab = useCallback(
    (pageId: string) => {
      const page = pageRegistry.getPageById(pageId);
      const target = page?.app?.route;
      if (!target || target === route) return;
      setRoute(target);
      setLoading(true);
      onRouteChange?.(target);
    },
    [pageRegistry, route, onRouteChange],
  );

  return (
    <AppShell
      activePageId={current.id}
      device={experience.device}
      onSwitchTab={handleSwitchTab}
    >
      <iframe
        key={src}
        ref={iframeRef}
        src={src}
        title={current.title}
        onLoad={() => {
          setLoading(false);
          onReady?.();
          const win = iframeRef.current?.contentWindow;
          if (win) onIframeReady?.(win);
        }}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          background: "#ffffff",
        }}
      />
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#f5f6f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#8b949e",
            pointerEvents: "none",
          }}
        >
          加载中…
        </div>
      )}
    </AppShell>
  );
}
