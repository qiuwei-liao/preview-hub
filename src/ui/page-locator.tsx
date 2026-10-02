"use client";

// PageLocator — 页面定位条
// 常驻展示当前预览页面的「实际路由地址 + 源文件路径」。

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { createPageRegistry } from "../registry/page";

type CopyKind = "route" | "file";

export function PageLocator() {
  const { state } = usePreviewState();
  const config = usePreviewHubConfig();
  const t = getTheme(state.theme);

  const pageRegistry = useMemo(
    () => createPageRegistry(config.pages, config.pageIdAliases),
    [config.pages, config.pageIdAliases],
  );

  // 对比模式：跟随当前激活栏；Focus 模式：主 experience
  const exp =
    state.mode === "comparison"
      ? state.comparison.activeSide === "left"
        ? state.comparison.leftExperience
        : state.comparison.rightExperience
      : state.experience;

  const pageId = exp.page.pageId;
  const page = pageRegistry.getPageById(pageId);
  const route = pageRegistry.getPageRoute(pageId, "web") ?? "—";
  const file = page?.sourceFile ?? "—";
  const sideLabel = state.mode === "comparison" ? "对比·当前栏" : "定位";

  const [copied, setCopied] = useState<CopyKind | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = async (kind: CopyKind, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(kind);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(null), 1500);
  };

  const copyButtonStyle = (active: boolean): CSSProperties => ({
    flexShrink: 0,
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    lineHeight: 1.6,
    cursor: "pointer",
    border: `1px solid ${t.chipBorder}`,
    background: active ? "#00704A" : t.chipBg,
    color: active ? "#fff" : t.sub,
  });

  const codeStyle = (flex: string): CSSProperties => ({
    flex,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 12,
    color: t.text,
    background: t.chipBg,
    border: `1px solid ${t.chipBorder}`,
    borderRadius: 6,
    padding: "1px 6px",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "4px 16px",
        fontSize: 12,
        borderTop: `1px solid ${t.barBorder}`,
        background: t.bar,
        color: t.sub,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          fontWeight: 600,
          letterSpacing: 0.5,
          opacity: 0.85,
        }}
      >
        {sideLabel}
      </span>

      <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <span style={{ flexShrink: 0, opacity: 0.7 }}>路由</span>
        <code title={route} style={codeStyle("0 1 auto")}>
          {route}
        </code>
        <button
          onClick={() => copy("route", route)}
          title="复制路由地址"
          style={copyButtonStyle(copied === "route")}
        >
          {copied === "route" ? "已复制" : "复制"}
        </button>
      </span>

      <span style={{ flexShrink: 0, opacity: 0.5 }}>│</span>

      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minWidth: 0,
          flex: "1 1 auto",
        }}
      >
        <span style={{ flexShrink: 0, opacity: 0.7 }}>文件</span>
        <code title={file} style={codeStyle("1 1 auto")}>
          {file}
        </code>
        <button
          onClick={() => copy("file", file)}
          title="复制源文件路径"
          style={copyButtonStyle(copied === "file")}
        >
          {copied === "file" ? "已复制" : "复制"}
        </button>
      </span>
    </div>
  );
}
