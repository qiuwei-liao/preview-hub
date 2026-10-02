"use client";

// SettingsDrawer — 右侧滑出：外观 / 数据(只读保护) / 会话 / 设备 / 高级调试信息。

import { useState } from "react";
import type { CSSProperties } from "react";
import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { SURFACE_LABELS, COLOR_FILTERS } from "../types";
import type { ThemeMode, ColorFilterMode } from "../types";

const THEME_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "浅色" },
  { id: "dark", label: "深色" },
  { id: "system", label: "跟随系统" },
];

export function SettingsDrawer() {
  const { state, actions } = usePreviewState();
  const config = usePreviewHubConfig();
  const t = getTheme(state.theme);
  const open = state.drawer === "settings";

  const [confirmWrite, setConfirmWrite] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [customW, setCustomW] = useState("");
  const [customH, setCustomH] = useState("");

  const role = state.experience.role;
  const identity = config.identities?.find((i) => i.role === role);
  const safe = state.readOnly;

  const onToggleReadonly = () => {
    if (safe) {
      setConfirmWrite(true);
    } else {
      actions.setReadOnly(true);
    }
  };

  const confirmEnableWrite = () => {
    actions.setReadOnly(false);
    setConfirmWrite(false);
  };

  const sectionTitle: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: t.sub,
    letterSpacing: 0.5,
    margin: "16px 0 6px",
  };

  return (
    <>
      <div
        onClick={actions.closeDrawer}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .2s ease",
          zIndex: 110,
        }}
      />

      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 320,
          maxWidth: "85vw",
          background: t.bar,
          borderLeft: `1px solid ${t.barBorder}`,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .25s ease",
          zIndex: 111,
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          overflowY: "auto",
          boxShadow: open ? "-16px 0 40px rgba(0,0,0,0.25)" : "none",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: t.text,
            marginBottom: 4,
          }}
        >
          Preview 设置
        </div>

        {/* 外观 */}
        <div style={sectionTitle}>外观</div>
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 3,
            borderRadius: 10,
            background: t.chipBg,
          }}
        >
          {THEME_OPTIONS.map((opt) => {
            const active = state.theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => actions.setTheme(opt.id)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: "pointer",
                  border: "none",
                  background: active ? "#00704A" : "transparent",
                  color: active ? "#fff" : t.text,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* 数据 */}
        <div style={sectionTitle}>数据</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 8,
            background: t.chipBg,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: t.text }}>只读保护</div>
            <div style={{ fontSize: 11, color: t.sub }}>
              防止预览时误操作真实业务数据
            </div>
          </div>
          <button
            onClick={onToggleReadonly}
            role="switch"
            aria-checked={safe}
            title={safe ? "关闭只读将允许修改真实数据" : "开启只读保护"}
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              border: "none",
              cursor: "pointer",
              background: safe ? "#00704A" : t.chipBorder,
              position: "relative",
              transition: "background .15s",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: safe ? 20 : 2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                transition: "left .15s",
              }}
            />
          </button>
        </div>

        {/* 会话 */}
        <div style={sectionTitle}>会话</div>
        <button
          onClick={() => actions.rebuildSession()}
          style={{
            width: "100%",
            padding: "9px 10px",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            border: `1px solid ${t.chipBorder}`,
            background: t.chipBg,
            color: t.text,
          }}
        >
          重建会话
        </button>

        {/* 设备 */}
        <div style={sectionTitle}>设备</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <input
            type="number"
            placeholder="宽"
            value={customW}
            onChange={(e) => setCustomW(e.target.value)}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 8,
              border: `1px solid ${t.chipBorder}`,
              background: t.chipBg,
              color: t.text,
              fontSize: 13,
              outline: "none",
              width: "100%",
            }}
          />
          <span style={{ color: t.sub, fontSize: 13 }}>×</span>
          <input
            type="number"
            placeholder="高"
            value={customH}
            onChange={(e) => setCustomH(e.target.value)}
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: 8,
              border: `1px solid ${t.chipBorder}`,
              background: t.chipBg,
              color: t.text,
              fontSize: 13,
              outline: "none",
              width: "100%",
            }}
          />
        </div>
        <button
          onClick={() => {
            const w = parseInt(customW, 10);
            const h = parseInt(customH, 10);
            if (w > 0 && h > 0) actions.setCustomDevice(w, h);
          }}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            fontSize: 13,
            cursor: "pointer",
            border: "none",
            background: "#00704A",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          应用自定义尺寸
        </button>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {[
            { label: "SE", w: 320, h: 568 },
            { label: "8", w: 375, h: 667 },
            { label: "XR", w: 414, h: 896 },
            { label: "小屏", w: 360, h: 640 },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setCustomW(String(p.w));
                setCustomH(String(p.h));
                actions.setCustomDevice(p.w, p.h);
              }}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                cursor: "pointer",
                border: `1px solid ${t.chipBorder}`,
                background: t.chipBg,
                color: t.sub,
              }}
            >
              {p.label} {p.w}×{p.h}
            </button>
          ))}
        </div>

        {/* 高级 */}
        <div style={sectionTitle}>高级</div>

        {/* 颜色无障碍滤镜 */}
        <div style={{ fontSize: 12, color: t.sub, marginBottom: 6 }}>颜色模拟</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
          {(Object.keys(COLOR_FILTERS) as ColorFilterMode[]).map((mode) => {
            const active = state.colorFilter === mode;
            return (
              <button
                key={mode}
                onClick={() => actions.setColorFilter(mode)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: "pointer",
                  border: `1px solid ${active ? "#00704A" : t.chipBorder}`,
                  background: active ? "rgba(0,112,74,0.15)" : t.chipBg,
                  color: active ? "#07C160" : t.text,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {COLOR_FILTERS[mode].label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setDebugOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: "8px 10px",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            border: `1px solid ${t.chipBorder}`,
            background: t.chipBg,
            color: t.text,
          }}
        >
          <span style={{ flex: 1, textAlign: "left" }}>调试信息</span>
          <span style={{ fontSize: 11, opacity: 0.6 }}>
            {debugOpen ? "▾" : "▸"}
          </span>
        </button>

        {debugOpen && (
          <div
            style={{
              marginTop: 8,
              padding: 10,
              borderRadius: 8,
              background: t.chipBg,
              fontFamily: "monospace",
              fontSize: 12,
              color: t.urlText,
              lineHeight: 1.8,
              wordBreak: "break-all",
            }}
          >
            <div>Environment: {state.environment}</div>
            <div>Role: {identity?.label ?? role}</div>
            <div>Renderer: {SURFACE_LABELS[state.experience.surface]}</div>
            <div>Device ID: {state.experience.device.id}</div>
            <div>Route: {state.experience.page.route}</div>
          </div>
        )}
      </aside>

      {/* 关闭只读二次确认弹窗 */}
      {confirmWrite && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              width: 360,
              maxWidth: "90vw",
              background: t.bar,
              border: `1px solid ${t.chipBorder}`,
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 8 }}
            >
              允许修改真实数据？
            </div>
            <div style={{ fontSize: 13, color: t.sub, lineHeight: 1.6 }}>
              当前操作可能直接影响真实业务数据。关闭只读保护后，预览内的写操作将不再被拦截。
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmWrite(false)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: "pointer",
                  border: `1px solid ${t.chipBorder}`,
                  background: "transparent",
                  color: t.text,
                }}
              >
                取消
              </button>
              <button
                onClick={confirmEnableWrite}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: "pointer",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                确认开启
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
