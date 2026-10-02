"use client";

// Preview Hub — 会话 React Hook
// 通过 config.authAdapter 执行登录，订阅会话变化事件。

import { useState, useEffect, useCallback } from "react";
import {
  loginAsIdentity,
  getSessionDisplayInfo,
} from "./session-manager";
import { NoopAuthAdapter } from "./auth-adapter";
import type { SessionDisplayInfo } from "./auth-adapter";
import { usePreviewHubConfig } from "../config/context";
import type { IdentitySpec } from "../types";

export function usePreviewSession() {
  const config = usePreviewHubConfig();
  const adapter = config.authAdapter ?? NoopAuthAdapter;
  const sessionChangeEvent = config.sessionChangeEvent ?? "preview-hub:session-changed";

  const [sessionInfo, setSessionInfo] = useState<SessionDisplayInfo>(() =>
    getSessionDisplayInfo(adapter),
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 订阅会话变化：优先用 adapter.subscribe()，否则监听自定义事件 + storage 事件
  useEffect(() => {
    const handler = () => setSessionInfo(getSessionDisplayInfo(adapter));

    let unsubscribe: (() => void) | undefined;
    if (adapter.subscribe) {
      unsubscribe = adapter.subscribe(handler);
    } else {
      window.addEventListener(sessionChangeEvent, handler);
      window.addEventListener("storage", handler);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      } else {
        window.removeEventListener(sessionChangeEvent, handler);
        window.removeEventListener("storage", handler);
      }
    };
  }, [adapter, sessionChangeEvent]);

  const loginAs = useCallback(
    async (identity: IdentitySpec): Promise<SessionDisplayInfo> => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const info = await loginAsIdentity(adapter, identity);
        setSessionInfo(info);
        return info;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "登录失败";
        setLoginError(msg);
        throw e;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [adapter],
  );

  const refreshInfo = useCallback(() => {
    setSessionInfo(getSessionDisplayInfo(adapter));
  }, [adapter]);

  return { sessionInfo, isLoggingIn, loginError, loginAs, refreshInfo };
}
