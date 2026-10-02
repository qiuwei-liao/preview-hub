"use client";

// Preview Hub — 对外主组件
// 内部自包含 Provider + StateProvider + Content，外部只需 <PreviewHub config={...} />

import type { CSSProperties } from "react";
import { PreviewHubProvider } from "../config/context";
import type { PreviewHubConfig } from "../config/types";
import { PreviewStateProvider } from "../state/use-preview-state";
import { PreviewHubContent } from "./PreviewHubContent";

export interface PreviewHubProps {
  config: PreviewHubConfig;
  className?: string;
  style?: CSSProperties;
}

export function PreviewHub({ config, className, style }: PreviewHubProps) {
  return (
    <PreviewHubProvider config={config}>
      <PreviewStateProvider>
        <PreviewHubContent className={className} style={style} />
      </PreviewStateProvider>
    </PreviewHubProvider>
  );
}
