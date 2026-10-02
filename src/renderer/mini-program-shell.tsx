"use client";

// Preview Hub — 小程序视觉外壳（只负责外观，不负责页面运行）
// 状态栏(38) + 导航栏(44) + 微信官方胶囊(87) + 页面内容(children) + TabBar + Safe Area。
// TabBar 数据从 config.miniapp.tabbar 获取。

import type { ReactNode } from "react";
import type {
  MiniProgramNavigationState,
  PreviewDevice,
} from "../types";
import { usePreviewHubConfig } from "../config/context";
import { getCurrentPage } from "./mini-program-navigation";

// ——— 固定尺寸 ———
export const MINIAPP_SHELL_DEFAULT_SIZE = { width: 340, height: 640 } as const;
const STATUS_BAR_H = 38;
const NAV_BAR_H = 44;

/** 外壳外尺寸：未指定设备时用 340×640；指定设备时贴合设备视口宽。 */
export function getMiniProgramShellSize(device?: PreviewDevice): {
  width: number;
  height: number;
} {
  if (!device) return { ...MINIAPP_SHELL_DEFAULT_SIZE };
  const viewport =
    device.orientation === "landscape" && device.rotatable
      ? { width: device.viewport.height, height: device.viewport.width }
      : device.viewport;
  return {
    width: viewport.width,
    height: viewport.height,
  };
}

// ——— 官方胶囊图标（menu.svg / exit.svg 原样路径）———
function IconMenu({ color }: { color: string }) {
  return (
    <svg width="22" height="7" viewBox="0 0 45 15" style={{ display: "block" }}>
      <path
        d="M10 8A5 5 0 1 1-.001 7.999 5 5 0 0 1 10 8zm12.5-8a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM40 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}

function IconExit({ color }: { color: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 52 52" style={{ display: "block" }}>
      <path
        d="M26 52C11.64 52 0 40.36 0 26S11.64 0 26 0s26 11.64 26 26-11.64 26-26 26zm0-6.118c10.98 0 19.882-8.901 19.882-19.882 0-10.98-8.901-19.882-19.882-19.882C15.02 6.118 6.118 15.019 6.118 26c0 10.98 8.901 19.882 19.882 19.882zM35 26a9.001 9.001 0 1 1-18.002-.002A9.001 9.001 0 0 1 35 26z"
        fill={color}
        fillRule="nonzero"
      />
    </svg>
  );
}

export interface MiniProgramShellProps {
  navigationState: MiniProgramNavigationState;
  onNavigateBack: () => void;
  onSwitchTab: (pageId: string) => void;
  children: ReactNode;
  /** 设备视口（决定外壳宽高）；不传则 340×640 */
  device?: PreviewDevice;
  /** 深色导航 → 白底黑图标胶囊；默认浅色导航 → 深胶囊白图标 */
  darkNav?: boolean;
}

export function MiniProgramShell({
  navigationState,
  onNavigateBack,
  onSwitchTab,
  children,
  device,
  darkNav = false,
}: MiniProgramShellProps) {
  const config = usePreviewHubConfig();
  const tabbar = config.miniapp?.tabbar ?? [];
  const current = getCurrentPage(navigationState);
  const size = getMiniProgramShellSize(device);

  // 胶囊深浅规则
  const capsuleBg = darkNav ? "#FFFFFF" : "rgba(0,0,0,0.15)";
  const capsuleBorder = darkNav
    ? "rgba(0,0,0,0.1)"
    : "rgba(255,255,255,0.25)";
  const capsuleIcon = darkNav ? "#1A1A1A" : "#FFFFFF";
  const capsuleSep = darkNav ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)";

  const navBg = darkNav ? "#1A1A1A" : "#FFFFFF";
  const navText = darkNav ? "#FFFFFF" : "#1A1A1A";
  const statusText = darkNav ? "#FFFFFF" : "#1A1A1A";

  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        borderRadius: 44,
        border: "2px solid #2a2e35",
        background: "#0d0f12",
        boxShadow:
          "0 0 0 6px #1c1f26, 0 24px 60px rgba(0,0,0,0.55)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* 状态栏：9:41 + 5G + 信号 */}
      <div
        style={{
          height: STATUS_BAR_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          fontSize: 12,
          fontWeight: 600,
          color: statusText,
          background: navBg,
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        <span>9:41</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, opacity: 0.8 }}>5G</span>
          <span style={{ fontSize: 12 }}>▮▮▮▮</span>
        </span>
      </div>

      {/* 导航栏：返回(栈深>1) + 标题 + 官方胶囊 */}
      <div
        style={{
          height: NAV_BAR_H,
          background: navBg,
          borderBottom: darkNav
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        {/* 左：返回按钮（栈深 > 1 才显示） */}
        <div style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {navigationState.currentIndex > 0 && (
            <button
              onClick={onNavigateBack}
              aria-label="返回"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: navText,
                fontSize: 18,
                lineHeight: 1,
                padding: 4,
              }}
            >
              ‹
            </button>
          )}
        </div>

        {/* 中：页面标题 */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 15,
            fontWeight: 600,
            color: navText,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {current.title}
        </div>

        {/* 右：微信官方胶囊 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: 87,
            borderRadius: 27,
            border: `1px solid ${capsuleBorder}`,
            background: capsuleBg,
            lineHeight: 1,
            fontSize: 0,
            boxSizing: "border-box",
            flexShrink: 0,
            marginRight: 6,
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              height: 30,
              alignItems: "center",
              justifyContent: "center",
              padding: "6.4px 0",
              boxSizing: "border-box",
            }}
          >
            <IconMenu color={capsuleIcon} />
          </div>
          <span
            style={{
              display: "inline-block",
              minWidth: 1,
              height: 17.2,
              background: capsuleSep,
            }}
          />
          <div
            style={{
              display: "flex",
              flex: 1,
              height: 30,
              alignItems: "center",
              justifyContent: "center",
              padding: "6.4px 0",
              boxSizing: "border-box",
            }}
          >
            <IconExit color={capsuleIcon} />
          </div>
        </div>
      </div>

      {/* 页面内容区：iframe 由 Renderer 注入 */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#FFFFFF" }}>
        {children}
      </div>

      {/* TabBar：从 config.miniapp.tabbar 渲染 */}
      {tabbar.length > 0 && (
        <div
          style={{
            flexShrink: 0,
            paddingBottom: 34,
            boxSizing: "border-box",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${tabbar.length}, 1fr)`,
              height: 50,
              alignItems: "center",
              padding: "0 8px",
              boxSizing: "border-box",
            }}
          >
            {tabbar.map((tab) => {
              const active = current.pageId === tab.pageId;
              return (
                <button
                  key={tab.pageId}
                  onClick={() => onSwitchTab(tab.pageId)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#07C160" : "#6b7280",
                      transition: "color .3s ease",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
