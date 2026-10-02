"use client";

// Preview Hub — 配置注入 Context
// 通过 PreviewHubProvider 注入配置，所有子组件用 usePreviewHubConfig() 获取。

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { PreviewHubConfig } from "./types";

const PreviewHubConfigContext = createContext<PreviewHubConfig | null>(null);

export interface PreviewHubProviderProps {
  config: PreviewHubConfig;
  children: ReactNode;
}

export function PreviewHubProvider({ config, children }: PreviewHubProviderProps) {
  return (
    <PreviewHubConfigContext.Provider value={config}>
      {children}
    </PreviewHubConfigContext.Provider>
  );
}

export function usePreviewHubConfig(): PreviewHubConfig {
  const ctx = useContext(PreviewHubConfigContext);
  if (!ctx) {
    throw new Error("usePreviewHubConfig must be used within <PreviewHubProvider>");
  }
  return ctx;
}
