"use client";

// Preview Hub — 极简顶栏
// 布局：[Preview Hub]  SurfaceSwitcher ｜ RoleSwitcher RouteSwitcher (DeviceSwitcher)   PreviewActions

import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { RoleSwitcher } from "./role-switcher";
import { SurfaceSwitcher } from "./surface-switcher";
import { RouteSwitcher } from "./route-switcher";
import { DeviceSwitcher } from "./device-switcher";
import { PreviewActions } from "./preview-actions";
import { PageLocator } from "./page-locator";

export function PreviewHeader() {
  const { state, actions } = usePreviewState();
  const t = getTheme(state.theme);
  const isFocus = state.mode === "focus";
  const envLabel = state.environment.toUpperCase();
  const safe = state.readOnly;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 90,
        background: t.bar,
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${t.barBorder}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 16px",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: t.text,
            letterSpacing: -0.2,
          }}
        >
          Preview Hub
        </span>

        <div style={{ width: 1, height: 18, background: t.barBorder }} />

        <SurfaceSwitcher />
        <span
          style={{
            fontSize: 14,
            lineHeight: 1,
            color: t.sub,
            opacity: 0.7,
            userSelect: "none",
          }}
        >
          ｜
        </span>
        <RoleSwitcher />
        <RouteSwitcher />
        {isFocus && <DeviceSwitcher />}

        <div style={{ flex: 1 }} />

        <PreviewActions />
      </div>

      {/* 页面定位条：路由 + 源文件 */}
      <PageLocator />

      {/* 底部常驻状态条：环境 · 只读 / 可写 */}
      <button
        onClick={() => actions.openDrawer("status")}
        title="查看状态详情"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 16px",
          fontSize: 11,
          cursor: "pointer",
          border: "none",
          borderTop: `1px solid ${t.barBorder}`,
          background: "transparent",
          color: t.sub,
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: safe ? "#10b981" : "#f59e0b",
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 700, letterSpacing: 0.5 }}>{envLabel}</span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span
          style={{
            color: safe ? "#10b981" : "#f59e0b",
            fontWeight: 600,
          }}
        >
          {safe ? "只读" : "可写"}
        </span>
      </button>
    </div>
  );
}
