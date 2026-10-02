"use client";

// DeviceSwitcher — 设备就近浮层选择
// 设备列表通过 createDeviceRegistry(config.devices) 获取。

import { useEffect, useMemo, useRef, useState } from "react";
import { getTheme } from "../config/defaults";
import { createDeviceRegistry } from "../registry/device";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { SURFACE_DEVICE_FAMILIES } from "../types";
import type { DeviceFamily, Orientation } from "../types";

const FAMILIES: DeviceFamily[] = ["mobile", "tablet", "desktop"];
const FAMILY_LABELS: Record<DeviceFamily, string> = {
  mobile: "手机",
  tablet: "平板",
  desktop: "桌面",
};

export function DeviceSwitcher() {
  const { state, actions } = usePreviewState();
  const config = usePreviewHubConfig();
  const t = getTheme(state.theme);
  const device = state.experience.device;
  const landscape = device.orientation === "landscape";
  const allowedFamilies = SURFACE_DEVICE_FAMILIES[state.experience.surface];
  const [open, setOpen] = useState(false);
  const [family, setFamily] = useState<DeviceFamily>(device.family);
  const rootRef = useRef<HTMLDivElement>(null);

  const deviceRegistry = useMemo(
    () => createDeviceRegistry(config.devices),
    [config.devices],
  );

  const selectedFamily = allowedFamilies.includes(family) ? family : device.family;
  const devices = deviceRegistry
    .getDevicesForFamily(selectedFamily)
    .filter((item) => allowedFamilies.includes(item.family));

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const chooseDevice = (deviceId: string, nextFamily: DeviceFamily) => {
    actions.setDevice(deviceId);
    setFamily(nextFamily);
    setOpen(false);
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="切换设备"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          borderRadius: 8,
          fontSize: 14,
          cursor: "pointer",
          border: `1px solid ${open ? "#00704A" : t.chipBorder}`,
          background: t.chipBg,
          color: t.text,
          lineHeight: 1.2,
        }}
      >
        <span style={{ opacity: 0.7, fontSize: 12 }}>
          {landscape ? "▭" : "▯"}
        </span>
        {device.model}
        <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="选择设备"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 120,
            width: 312,
            maxWidth: "calc(100vw - 24px)",
            padding: 10,
            border: `1px solid ${t.chipBorder}`,
            borderRadius: 12,
            background: t.bar,
            boxShadow: "0 14px 36px rgba(0,0,0,0.28)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 3,
              borderRadius: 9,
              background: t.chipBg,
            }}
          >
            {FAMILIES.map((item) => {
              const enabled = allowedFamilies.includes(item);
              const active = selectedFamily === item;
              return (
                <button
                  key={item}
                  disabled={!enabled}
                  onClick={() => enabled && setFamily(item)}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    border: "none",
                    borderRadius: 7,
                    background: active ? "#00704A" : "transparent",
                    color: active ? "#fff" : enabled ? t.text : t.sub,
                    opacity: enabled ? 1 : 0.45,
                    cursor: enabled ? "pointer" : "not-allowed",
                    fontSize: 12,
                  }}
                >
                  {FAMILY_LABELS[item]}
                </button>
              );
            })}
          </div>

          <div style={{ maxHeight: 260, overflowY: "auto", marginTop: 8 }}>
            {devices.map((item) => {
              const active = item.id === device.id;
              return (
                <button
                  key={item.id}
                  onClick={() => chooseDevice(item.id, item.family)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 9px",
                    border: "none",
                    borderRadius: 8,
                    background: active ? "rgba(0,112,74,0.12)" : "transparent",
                    color: t.text,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                  }}
                >
                  <span style={{ flex: 1 }}>{item.model}</span>
                  <span style={{ color: t.sub, fontSize: 11 }}>
                    {item.viewport.width}×{item.viewport.height}
                  </span>
                  {active && <span style={{ color: "#00704A", fontSize: 11 }}>当前</span>}
                </button>
              );
            })}
          </div>

          {device.rotatable && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px solid ${t.barBorder}`,
              }}
            >
              <span style={{ color: t.sub, fontSize: 11, marginRight: "auto" }}>方向</span>
              {(["portrait", "landscape"] as Orientation[]).map((orientation) => {
                const active = device.orientation === orientation;
                return (
                  <button
                    key={orientation}
                    onClick={() => actions.setOrientation(orientation)}
                    style={{
                      padding: "5px 9px",
                      border: "none",
                      borderRadius: 7,
                      background: active ? "#00704A" : t.chipBg,
                      color: active ? "#fff" : t.text,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    {orientation === "portrait" ? "竖屏" : "横屏"}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
