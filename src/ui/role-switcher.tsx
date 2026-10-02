"use client";

// RoleSwitcher — 角色分段切换
// 角色列表从 config.roles 获取，点击即切换。

import { getTheme } from "../config/defaults";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";

export function RoleSwitcher() {
  const { state, actions } = usePreviewState();
  const config = usePreviewHubConfig();
  const t = getTheme(state.theme);
  const current = state.experience.role;
  const roles = config.roles;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: 2,
        borderRadius: 8,
        border: `1px solid ${t.chipBorder}`,
        background: t.chipBg,
      }}
    >
      {roles.map((role) => {
        const active = role.id === current;
        return (
          <button
            key={role.id}
            onClick={() => actions.setRole(role.id)}
            title={`切换为${role.label}`}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 14,
              lineHeight: 1.2,
              cursor: "pointer",
              border: "none",
              background: active ? "#00704A" : "transparent",
              color: active ? "#fff" : t.text,
              fontWeight: active ? 600 : 400,
            }}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
