"use client";

// Preview Hub — 主页面组装
// 组装：PreviewHeader + Drawers + CommandPalette + Focus/Comparison Canvas。
// 所有配置通过 usePreviewHubConfig() 获取。

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CommandPalette } from "../ui/command-palette";
import { ComparisonCanvas } from "../ui/comparison-canvas";
import { FocusCanvas } from "../ui/focus-canvas";
import { PreviewHeader } from "../ui/preview-header";
import { PreviewLoginToast } from "../ui/preview-login-toast";
import { SettingsDrawer } from "../ui/settings-drawer";
import { sendToIframe } from "../renderer/bus";
import { getTheme } from "../config/defaults";
import { usePreviewHubConfig } from "../config/context";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { usePreviewSession } from "../session/use-preview-session";
import { usePreviewState } from "../state/use-preview-state";
import type { IdentitySpec, PreviewMessage, PreviewRole } from "../types";

export interface PreviewHubContentProps {
  className?: string;
  style?: CSSProperties;
}

/** 按当前 role 取对应身份（真实登录用），从 config.identities 查找 */
function identityForRole(
  identities: IdentitySpec[] | undefined,
  role: PreviewRole,
): IdentitySpec | undefined {
  return identities?.find((i) => i.role === role) ?? identities?.[0];
}

/** 内层组件：消费 PreviewState Context，持有真实登录与 iframe 管理 */
export function PreviewHubContent({ className, style }: PreviewHubContentProps) {
  const { state, reloadKey, actions } = usePreviewState();
  const config = usePreviewHubConfig();
  const { sessionInfo, isLoggingIn, loginError, loginAs } = usePreviewSession();

  // ——— mount 守卫 ———
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // iframe 窗口注册表：hub → iframe 广播用
  const iframeWindowsRef = useRef<Set<Window>>(new Set());
  const handleIframeReady = useCallback((win: Window) => {
    iframeWindowsRef.current.add(win);
  }, []);

  const broadcastToIframes = useCallback((msg: PreviewMessage) => {
    iframeWindowsRef.current.forEach((win) => {
      try {
        if (win.closed) {
          iframeWindowsRef.current.delete(win);
          return;
        }
        sendToIframe(win, msg);
      } catch {
        // iframe 已卸载或跨域不可达，忽略
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      iframeWindowsRef.current.clear();
    };
  }, []);

  // ——— 真实登录：mount 自动登录一次；之后 role 变化即重新登录 ———
  const lastRoleRef = useRef<PreviewRole | null>(null);
  useEffect(() => {
    if (!mounted) return;
    const role = state.experience.role;
    const identity = identityForRole(config.identities, role);
    if (!identity) return; // 无身份配置则跳过真实登录

    // 首次：自动登录（未登录或角色不匹配）
    if (lastRoleRef.current === null) {
      lastRoleRef.current = role;
      const needLogin = !sessionInfo.loggedIn || sessionInfo.role !== role;
      if (needLogin) {
        loginAs(identity)
          .then(() => actions.rebuildSession())
          .catch((e) => console.error("自动登录失败", e));
      }
      return;
    }

    // 后续：role 切换 → 先真实登录拿新 token，再让 iframe 重载
    if (lastRoleRef.current !== role) {
      lastRoleRef.current = role;
      loginAs(identity)
        .then(() => actions.rebuildSession())
        .catch((e) => console.error("身份切换登录失败", e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, state.experience.role]);

  // ——— 401 统一处理 ———
  const handle401 = useCallback(async () => {
    const identity = identityForRole(config.identities, state.experience.role);
    if (!identity) return;
    try {
      await loginAs(identity);
      actions.rebuildSession();
    } catch (e) {
      console.error("重建会话失败", e);
    }
  }, [loginAs, actions, state.experience.role, config.identities]);

  // ——— 只读保护广播 ———
  useEffect(() => {
    if (!mounted) return;
    broadcastToIframes({ type: "preview:set-readonly", enabled: state.readOnly });
  }, [state.readOnly, broadcastToIframes, mounted]);

  // ——— 全局快捷键 ———
  useKeyboardShortcuts(actions, state);

  const activeIdentity = identityForRole(config.identities, state.experience.role);
  const theme = getTheme(state.theme);

  // mount 前只渲染 loading
  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0f12",
          color: "#8b949e",
          fontSize: 14,
        }}
      >
        Preview Hub 加载中...
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        minHeight: "100dvh",
        background: theme.bg,
        color: theme.text,
        ...style,
      }}
    >
      <PreviewHeader />

      {/* 抽屉 */}
      {state.drawer === "settings" && <SettingsDrawer />}
      {state.drawer === "status" && (
        <div
          onClick={actions.closeDrawer}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              minWidth: 280,
              maxWidth: 420,
              background: theme.bar,
              color: theme.text,
              border: "1px solid rgba(128,128,128,0.3)",
              borderRadius: 12,
              padding: 20,
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>状态详情</div>
            <div>环境：{state.environment.toUpperCase()}</div>
            <div>登录：{sessionInfo.loggedIn ? "已登录" : "未登录"}</div>
            <div>当前身份：{activeIdentity?.label ?? "—"}</div>
            <div>会话角色：{sessionInfo.role ?? "—"}</div>
            <div>只读保护：{state.readOnly ? "开启" : "关闭"}</div>
            <button
              onClick={actions.closeDrawer}
              style={{
                marginTop: 12,
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: "#00704A",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* ⌘K 命令面板 */}
      <CommandPalette />

      {/* 登录中 / 登录失败提示 */}
      <PreviewLoginToast
        isLoggingIn={isLoggingIn}
        identityLabel={activeIdentity?.label ?? ""}
        loginError={loginError}
      />

      {/* 主画布：reloadKey 变化时整体重挂载，强制 iframe 重载会话 */}
      <div key={reloadKey}>
        {state.mode === "focus" ? (
          <FocusCanvas
            experience={state.experience}
            readOnly={state.readOnly}
            theme={state.theme}
            onRouteChange={actions.setRoute}
            on401={handle401}
            onIframeReady={handleIframeReady}
          />
        ) : (
          <ComparisonCanvas
            comparison={state.comparison}
            readOnly={state.readOnly}
            theme={state.theme}
            onSideChange={actions.setComparisonSide}
            onToggleSync={actions.toggleComparisonSync}
            on401={handle401}
            onIframeReady={handleIframeReady}
          />
        )}
      </div>
    </div>
  );
}
