"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// DeviceSwitcher — 设备就近浮层选择
// 设备列表通过 createDeviceRegistry(config.devices) 获取。
import { useEffect, useMemo, useRef, useState } from "react";
import { getTheme } from "../config/defaults";
import { createDeviceRegistry } from "../registry/device";
import { usePreviewState } from "../state/use-preview-state";
import { usePreviewHubConfig } from "../config/context";
import { SURFACE_DEVICE_FAMILIES } from "../types";
const FAMILIES = ["mobile", "tablet", "desktop"];
const FAMILY_LABELS = {
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
    const [family, setFamily] = useState(device.family);
    const rootRef = useRef(null);
    const deviceRegistry = useMemo(() => createDeviceRegistry(config.devices), [config.devices]);
    const selectedFamily = allowedFamilies.includes(family) ? family : device.family;
    const devices = deviceRegistry
        .getDevicesForFamily(selectedFamily)
        .filter((item) => allowedFamilies.includes(item.family));
    useEffect(() => {
        if (!open)
            return;
        const handlePointerDown = (event) => {
            const target = event.target;
            if (!(target instanceof Node) || !rootRef.current?.contains(target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape")
                setOpen(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);
    const chooseDevice = (deviceId, nextFamily) => {
        actions.setDevice(deviceId);
        setFamily(nextFamily);
        setOpen(false);
    };
    return (_jsxs("div", { ref: rootRef, style: { position: "relative" }, children: [_jsxs("button", { onClick: () => setOpen((value) => !value), "aria-expanded": open, "aria-haspopup": "dialog", title: "\u5207\u6362\u8BBE\u5907", style: {
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
                }, children: [_jsx("span", { style: { opacity: 0.7, fontSize: 12 }, children: landscape ? "▭" : "▯" }), device.model, _jsx("span", { style: { fontSize: 10, opacity: 0.6 }, children: "\u25BE" })] }), open && (_jsxs("div", { role: "dialog", "aria-label": "\u9009\u62E9\u8BBE\u5907", style: {
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
                }, children: [_jsx("div", { style: {
                            display: "flex",
                            gap: 4,
                            padding: 3,
                            borderRadius: 9,
                            background: t.chipBg,
                        }, children: FAMILIES.map((item) => {
                            const enabled = allowedFamilies.includes(item);
                            const active = selectedFamily === item;
                            return (_jsx("button", { disabled: !enabled, onClick: () => enabled && setFamily(item), style: {
                                    flex: 1,
                                    padding: "7px 0",
                                    border: "none",
                                    borderRadius: 7,
                                    background: active ? "#00704A" : "transparent",
                                    color: active ? "#fff" : enabled ? t.text : t.sub,
                                    opacity: enabled ? 1 : 0.45,
                                    cursor: enabled ? "pointer" : "not-allowed",
                                    fontSize: 12,
                                }, children: FAMILY_LABELS[item] }, item));
                        }) }), _jsx("div", { style: { maxHeight: 260, overflowY: "auto", marginTop: 8 }, children: devices.map((item) => {
                            const active = item.id === device.id;
                            return (_jsxs("button", { onClick: () => chooseDevice(item.id, item.family), style: {
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
                                }, children: [_jsx("span", { style: { flex: 1 }, children: item.model }), _jsxs("span", { style: { color: t.sub, fontSize: 11 }, children: [item.viewport.width, "\u00D7", item.viewport.height] }), active && _jsx("span", { style: { color: "#00704A", fontSize: 11 }, children: "\u5F53\u524D" })] }, item.id));
                        }) }), device.rotatable && (_jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: `1px solid ${t.barBorder}`,
                        }, children: [_jsx("span", { style: { color: t.sub, fontSize: 11, marginRight: "auto" }, children: "\u65B9\u5411" }), ["portrait", "landscape"].map((orientation) => {
                                const active = device.orientation === orientation;
                                return (_jsx("button", { onClick: () => actions.setOrientation(orientation), style: {
                                        padding: "5px 9px",
                                        border: "none",
                                        borderRadius: 7,
                                        background: active ? "#00704A" : t.chipBg,
                                        color: active ? "#fff" : t.text,
                                        cursor: "pointer",
                                        fontSize: 12,
                                    }, children: orientation === "portrait" ? "竖屏" : "横屏" }, orientation));
                            })] }))] }))] }));
}
//# sourceMappingURL=device-switcher.js.map