"use client";

// Comparison 模式画布
// 左右等宽双栏，支持任意 experience 组合。
// 注册表通过 config 创建，角色标签从 config.roles 获取。

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SURFACE_LABELS,
  type ComparisonState,
  type PreviewExperience,
  type PreviewSurface,
  type ThemeMode,
} from "../types";
import { getTheme } from "../config/defaults";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";
import { createDeviceRegistry } from "../registry/device";
import { getPageRoute } from "../state/resolver";
import { WebRenderer, getDeviceOuterSize, type SurfaceRendererProps } from "../renderer/web-renderer";
import { MiniProgramRenderer } from "../renderer/mini-program-renderer";
import { getMiniProgramShellSize } from "../renderer/mini-program-shell";
import { AppRenderer } from "../renderer/app-renderer";
import { getAppShellSize } from "../renderer/app-shell";

type SyncKey = "page" | "scroll" | "data";

interface ComparisonCanvasProps {
  comparison: ComparisonState;
  readOnly: boolean;
  onSideChange: (side: "left" | "right", exp: Partial<PreviewExperience>) => void;
  onToggleSync: (key: SyncKey) => void;
  onRouteChange?: (route: string) => void;
  onReady?: () => void;
  on401?: () => void;
  onIframeReady?: (win: Window) => void;
  theme?: ThemeMode;
}

function ComparisonColumn({
  side,
  experience,
  readOnly,
  onSideChange,
  onRouteChange,
  rendererCallbacks,
  scale,
}: ColumnProps) {
  const isMini = experience.surface === "mini_program";
  const isApp = experience.surface === "app";
  const natural = isMini
    ? getMiniProgramShellSize(experience.device)
    : isApp
      ? getAppShellSize(experience.device)
      : getDeviceOuterSize(experience.device);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 12, color: "#8b949e" }}>
        {side === "left" ? "左" : "右"} · {SURFACE_LABELS[experience.surface]} · {experience.device.model}
      </span>

      {/* 设备本体（按 scale 缩放） */}
      <div
        style={{
          width: natural.width * scale,
          height: natural.height * scale,
          transition: "width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: natural.width,
            height: natural.height,
            transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {isMini ? (
            <MiniProgramRenderer
              experience={experience}
              readOnly={readOnly}
              {...rendererCallbacks}
              onRouteChange={(route) => onRouteChange(side, route)}
            />
          ) : isApp ? (
            <AppRenderer
              experience={experience}
              readOnly={readOnly}
              {...rendererCallbacks}
              onRouteChange={(route) => onRouteChange(side, route)}
            />
          ) : (
            <WebRenderer
              experience={experience}
              readOnly={readOnly}
              {...rendererCallbacks}
              onRouteChange={(route) => onRouteChange(side, route)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface ColumnProps {
  side: "left" | "right";
  experience: PreviewExperience;
  readOnly: boolean;
  onSideChange: (side: "left" | "right", exp: Partial<PreviewExperience>) => void;
  onRouteChange: (side: "left" | "right", route: string) => void;
  rendererCallbacks: Omit<SurfaceRendererProps, "experience" | "readOnly">;
  scale: number;
}

export function ComparisonCanvas({
  comparison,
  readOnly,
  onSideChange,
  onToggleSync,
  onRouteChange,
  onReady,
  on401,
  onIframeReady,
  theme = "dark",
}: ComparisonCanvasProps) {
  const config = usePreviewHubConfig();
  const t = getTheme(theme);
  const [win, setWin] = useState(() => ({
    w: typeof window === "undefined" ? 1200 : window.innerWidth,
    h: typeof window === "undefined" ? 900 : window.innerHeight,
  }));
  const [lockScale, setLockScale] = useState(false);

  // 左右 iframe 的 contentWindow，用于滚动同步
  const leftIframeWin = useRef<Window | null>(null);
  const rightIframeWin = useRef<Window | null>(null);

  // 包装 onIframeReady，按 side 存储对应的 window
  const handleIframeReady = (side: "left" | "right") => (win: Window) => {
    if (side === "left") leftIframeWin.current = win;
    else rightIframeWin.current = win;
    onIframeReady?.(win);
  };

  // 滚动同步：一侧滚动时，若 sync.scroll 开启，向另一侧发送 set-scroll
  const handleScroll = (side: "left" | "right") => (scrollTop: number, _scrollLeft: number) => {
    if (!comparison.sync.scroll) return;
    const targetWin = side === "left" ? rightIframeWin.current : leftIframeWin.current;
    if (targetWin) {
      targetWin.postMessage({ type: "preview:set-scroll", scrollTop }, "*");
    }
  };

  const pageRegistry = useMemo(
    () => createPageRegistry(config.pages, config.pageIdAliases),
    [config.pages, config.pageIdAliases],
  );
  const deviceRegistry = useMemo(
    () => createDeviceRegistry(config.devices),
    [config.devices],
  );

  useEffect(() => {
    const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 双栏各自按 half-viewport 缩放；锁定缩放时取较小值
  const scaleFor = (exp: PreviewExperience): number => {
    const natural =
      exp.surface === "mini_program"
        ? getMiniProgramShellSize(exp.device)
        : exp.surface === "app"
          ? getAppShellSize(exp.device)
          : getDeviceOuterSize(exp.device);
    return Math.max(
      0.2,
      Math.min((win.h - 220) / natural.height, (win.w / 2 - 60) / natural.width, 0.6),
    );
  };

  const leftScale = scaleFor(comparison.leftExperience);
  const rightScale = scaleFor(comparison.rightExperience);
  const sharedScale = Math.min(leftScale, rightScale);

  const handleRouteChange = (side: "left" | "right", route: string) => {
    onRouteChange?.(route);
    const source = comparison[side === "left" ? "leftExperience" : "rightExperience"];
    // iframe 实际加载的是同源 Web 页面，优先按 Web route 反查业务页。
    const pageId =
      pageRegistry.getPageIdByRoute(route, "web", source.role) ??
      pageRegistry.getPageIdByRoute(route, source.surface, source.role);
    if (!pageId) return;

    const sourceRoute = getPageRoute(pageId, source.surface, pageRegistry) ?? route;
    onSideChange(side, {
      page: { pageId, route: sourceRoute },
    });

    // 同步页面时保持对侧 Surface 的 route 投影
    if (!comparison.sync.page) return;
    const otherSide = side === "left" ? "right" : "left";
    const other = comparison[otherSide === "left" ? "leftExperience" : "rightExperience"];
    const otherRoute = getPageRoute(pageId, other.surface, pageRegistry);
    if (!otherRoute) return;
    onSideChange(otherSide, {
      page: { pageId, route: otherRoute },
    });
  };

  const syncKeys: { key: SyncKey; label: string }[] = [
    { key: "page", label: "同步页面" },
    { key: "scroll", label: "同步滚动" },
    { key: "data", label: "同步数据" },
  ];  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        minHeight: "calc(100dvh - 56px)",
        background: t.bgGrad,
      }}
    >
      {/* 同步控制条 */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {syncKeys.map(({ key, label }) => {
          const on = comparison.sync[key];
          return (
            <button
              key={key}
              onClick={() => onToggleSync(key)}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 12,
                cursor: "pointer",
                border: `1px solid ${on ? "#07C160" : t.chipBorder}`,
                background: on ? "rgba(7,193,96,0.18)" : t.chipBg,
                color: on ? "#07C160" : t.btnText,
                fontWeight: on ? 600 : 400,
              }}
            >
              {label}{on ? " · 开" : ""}
            </button>
          );
        })}
        <button
          onClick={() => setLockScale((v) => !v)}
          style={{
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 12,
            cursor: "pointer",
            border: `1px solid ${lockScale ? "#07C160" : t.chipBorder}`,
            background: lockScale ? "rgba(7,193,96,0.18)" : t.chipBg,
            color: lockScale ? "#07C160" : t.btnText,
            fontWeight: lockScale ? 600 : 400,
          }}
        >
          锁定缩放{lockScale ? " · 开" : ""}
        </button>
      </div>

      {/* 左右分栏 50/50 */}
      <div style={{ display: "flex", flex: 1, gap: 20, alignItems: "flex-start" }}>
        <ComparisonColumn
          side="left"
          experience={comparison.leftExperience}
          readOnly={readOnly}
          onSideChange={onSideChange}
          onRouteChange={handleRouteChange}
          rendererCallbacks={{ onReady, on401, onIframeReady: handleIframeReady("left"), onScroll: handleScroll("left") }}
          scale={lockScale ? sharedScale : leftScale}
        />
        <ComparisonColumn
          side="right"
          experience={comparison.rightExperience}
          readOnly={readOnly}
          onSideChange={onSideChange}
          onRouteChange={handleRouteChange}
          rendererCallbacks={{ onReady, on401, onIframeReady: handleIframeReady("right"), onScroll: handleScroll("right") }}
          scale={lockScale ? sharedScale : rightScale}
        />
      </div>
    </div>
  );
}
