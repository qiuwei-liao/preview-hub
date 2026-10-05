"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// Focus 模式画布
// 居中渲染当前 experience：按 experience.surface 选择 WebRenderer 或 MiniProgramRenderer。
import { useEffect, useState } from "react";
import { getTheme } from "../config/defaults";
import { WebRenderer, getDeviceOuterSize } from "../renderer/web-renderer";
import { MiniProgramRenderer } from "../renderer/mini-program-renderer";
import { getMiniProgramShellSize } from "../renderer/mini-program-shell";
import { AppRenderer } from "../renderer/app-renderer";
import { getAppShellSize } from "../renderer/app-shell";
export function FocusCanvas({ experience, theme = "dark", ...rest }) {
    const t = getTheme(theme);
    const [win, setWin] = useState(() => ({
        w: typeof window === "undefined" ? 1200 : window.innerWidth,
        h: typeof window === "undefined" ? 800 : window.innerHeight,
    }));
    useEffect(() => {
        const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight });
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    const isMini = experience.surface === "mini_program";
    const isApp = experience.surface === "app";
    const natural = isMini
        ? getMiniProgramShellSize(experience.device)
        : isApp
            ? getAppShellSize(experience.device)
            : getDeviceOuterSize(experience.device);
    const scale = Math.max(0.25, Math.min((win.h - 160) / natural.height, (win.w - 80) / natural.width, 1));
    return (_jsx("div", { style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100dvh - 56px)",
            padding: 24,
            background: t.bgGrad,
        }, children: _jsx("div", { style: {
                width: natural.width * scale,
                height: natural.height * scale,
                transition: "width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
            }, children: _jsx("div", { style: {
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: natural.width,
                    height: natural.height,
                    transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                }, children: isMini ? (_jsx(MiniProgramRenderer, { experience: experience, ...rest })) : isApp ? (_jsx(AppRenderer, { experience: experience, ...rest })) : (_jsx(WebRenderer, { experience: experience, ...rest })) }) }) }));
}
//# sourceMappingURL=focus-canvas.js.map