"use client";

// Preview Actions — [对比]/[退出对比] + [••• 设置]

import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";

export function PreviewActions() {
  const { state, actions } = usePreviewState();
  const t = getTheme(state.theme);
  const isFocus = state.mode === "focus";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={() => (isFocus ? actions.enterComparison() : actions.exitComparison())}
        title={isFocus ? "进入双栏对比" : "退出对比"}
        style={{
          padding: "5px 12px",
          borderRadius: 8,
          fontSize: 14,
          cursor: "pointer",
          border: "none",
          lineHeight: 1.2,
          background: isFocus ? "#00704A" : t.chipBg,
          color: isFocus ? "#fff" : t.text,
          fontWeight: isFocus ? 600 : 400,
        }}
      >
        {isFocus ? "对比" : "退出对比"}
      </button>

      <button
        onClick={() => actions.openDrawer("settings")}
        title="Preview 设置"
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          fontSize: 16,
          cursor: "pointer",
          border: `1px solid ${t.chipBorder}`,
          background: t.chipBg,
          color: t.text,
          lineHeight: 1,
        }}
      >
        •••
      </button>
    </div>
  );
}
