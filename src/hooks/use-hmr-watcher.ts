"use client";

// Preview Hub — Next.js HMR 实时监听 Hook
//
// 直接连接 dev server 的 webpack-hmr WebSocket，监听编译完成事件，
// 代码变化时自动触发回调（用于自动刷新 iframe）。
//
// 工作原理：
//   Next.js / Turbopack dev server 在 /_next/webpack-hmr 建立 WebSocket，
//   每次文件保存后重新编译，编译完成时会发送消息。我们监听这个 WebSocket，
//   收到编译完成事件后触发 onUpdate 回调，让 WebRenderer 自动刷新 iframe。
//
// 优势：
//   - 不依赖 iframe 内的 HMR 是否生效（iframe 缓存/跨域问题都不影响）
//   - 编译完成即刷新，延迟极低（通常 < 500ms）
//   - 自动重连，dev server 重启后自动恢复
//   - 防抖处理，避免连续保存时频繁刷新

import { useEffect, useRef, useCallback, useReducer } from "react";

interface UseHmrWatcherOptions {
  /** dev server 基础 URL，如 http://localhost:3333 */
  baseUrl: string;
  /** 编译完成时的回调（防抖后触发） */
  onUpdate: () => void;
  /** 是否启用监听，默认 true */
  enabled?: boolean;
  /** 防抖延迟（ms），默认 800ms，避免连续保存时频繁刷新 */
  debounceMs?: number;
}

/**
 * 监听 Next.js dev server 的 HMR 编译事件
 *
 * @returns { connected: boolean; lastUpdate: number | null }
 */
export function useHmrWatcher({
  baseUrl,
  onUpdate,
  enabled = true,
  debounceMs = 800,
}: UseHmrWatcherOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const [connected, setConnected] = useRefState(false);
  const [lastUpdate, setLastUpdate] = useRefState<number | null>(null);

  // 保持 onUpdate 最新引用
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // 触发更新（防抖）
  const triggerUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setLastUpdate(Date.now());
      onUpdateRef.current();
    }, debounceMs);
  }, [debounceMs, setLastUpdate]);

  // 连接 WebSocket
  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      // 将 http:// 转换为 ws://，https:// 转换为 wss://
      const wsUrl = baseUrl.replace(/^http/, "ws") + "/_next/webpack-hmr";
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Next.js / Turbopack HMR 消息类型：
          // - { action: "built", ... } — 编译完成
          // - { action: "sync", ... } — 同步构建 ID
          // - { action: "invalid" } — 有文件变化，开始重新编译
          // - { action: "reload" } — 需要 full reload
          if (
            data.action === "built" ||
            data.action === "reload" ||
            data.type === "built" ||
            data.type === "reload"
          ) {
            triggerUpdate();
          }
        } catch {
          // 非 JSON 消息，忽略
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // 自动重连（5 秒后）
        if (enabled) {
          reconnectTimerRef.current = setTimeout(connect, 5000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // 连接失败，5 秒后重试
      if (enabled) {
        reconnectTimerRef.current = setTimeout(connect, 5000);
      }
    }
  }, [baseUrl, enabled, triggerUpdate, setConnected]);

  // 初始化连接
  useEffect(() => {
    if (!enabled) return;

    // 延迟 1 秒连接，避免页面加载初期就建立连接
    const initTimer = setTimeout(connect, 1000);

    return () => {
      clearTimeout(initTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [enabled, connect]);

  return { connected, lastUpdate };
}

/** 简易的 ref-based state，避免不必要的重渲染 */
function useRefState<T>(initial: T): [T, (v: T) => void] {
  const ref = useRef(initial);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);
  const setValue = useCallback((v: T) => {
    ref.current = v;
    forceRender();
  }, []);
  return [ref.current, setValue];
}
