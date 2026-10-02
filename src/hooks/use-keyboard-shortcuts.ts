"use client";

// Preview Hub — 全局快捷键 Hook
//  ⌘/Ctrl+1/2/3  切换 config.roles 中的角色
//  ⌘/Ctrl+D      循环当前 Surface 允许的下一个设备
//  ⌘/Ctrl+K      开关命令面板
//  ⌘/Ctrl+Shift+Enter  进入 / 退出对比
//  Esc            关闭 Drawer，否则退出对比

import { useEffect, useRef } from "react";
import { usePreviewHubConfig } from "../config/context";
import { createDeviceRegistry } from "../registry/device";
import type { PreviewActions } from "../state/use-preview-state";
import type { PreviewState } from "../types";

/** 命令面板开关事件：CommandPalette 监听此事件实现 ⌘K 联动 */
export const COMMAND_PALETTE_EVENT = "preview:toggle-command-palette";

function isEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function useKeyboardShortcuts(
  actions: PreviewActions,
  state: PreviewState,
): void {
  const config = usePreviewHubConfig();

  // 用 ref 持有最新 state / actions / config，避免每次状态变化都重新绑定 window listener
  const latest = useRef({ actions, state, config });
  useEffect(() => {
    latest.current = { actions, state, config };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { actions, state, config } = latest.current;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const editing = isEditingTarget(e.target);

      // ——— Esc：全局生效（即使在输入框中）———
      if (e.key === "Escape") {
        if (state.drawer) {
          actions.closeDrawer();
        } else if (state.mode === "comparison") {
          actions.exitComparison();
        }
        return;
      }

      if (!mod) return;

      // ——— ⌘K：命令面板 ———
      if (key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENT));
        return;
      }

      // ——— ⌘/Ctrl+Shift+Enter：进入 / 退出对比 ———
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        if (state.mode === "focus") {
          actions.enterComparison();
        } else {
          actions.exitComparison();
        }
        return;
      }

      // 输入框中不触发角色切换 / 设备循环
      if (editing) return;

      // ——— ⌘/Ctrl+1/2/3：按 config.roles 顺序切换角色 ———
      if (key === "1" && config.roles[0]) {
        actions.setRole(config.roles[0].id);
        return;
      }
      if (key === "2" && config.roles[1]) {
        actions.setRole(config.roles[1].id);
        return;
      }
      if (key === "3" && config.roles[2]) {
        actions.setRole(config.roles[2].id);
        return;
      }

      // ——— ⌘/Ctrl+D：循环当前 Surface 允许的下一个设备 ———
      if (key === "d") {
        e.preventDefault();
        const deviceRegistry = createDeviceRegistry(config.devices);
        const devices = deviceRegistry.getDevicesForSurface(state.experience.surface);
        if (devices.length <= 1) return;
        const idx = devices.findIndex(
          (d) => d.id === state.experience.device.id,
        );
        const next = devices[(idx + 1) % devices.length];
        actions.setDevice(next.id);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
