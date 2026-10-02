// Preview Hub — 内置默认值
// 内置默认设备集、主题 tokens、默认状态工厂。
// 业务数据（IDENTITIES / DEMO_SCRIPT / ENVIRONMENTS 文案）不在此文件，由接入层注入。

import type { PreviewDevice, PreviewState } from "../types";
import type { PreviewHubConfig } from "./types";

// ─── 内置默认设备集（10 款） ───

export const DEFAULT_DEVICES: PreviewDevice[] = [
  {
    id: "iphone-18-pro",
    family: "mobile",
    model: "iPhone 18 Pro",
    orientation: "portrait",
    viewport: { width: 393, height: 852 },
    frame: "dynamic-island",
    bezel: 12,
    screenRadius: 55,
    frameRadius: 64,
    rotatable: true,
    material: "titanium",
    dpr: 3,
    osVersion: "iOS 18",
    dynamicIsland: { width: 126, height: 37 },
    safeArea: { top: 59, bottom: 34 },
  },
  {
    id: "iphone-18-pro-max",
    family: "mobile",
    model: "iPhone 18 Pro Max",
    orientation: "portrait",
    viewport: { width: 430, height: 932 },
    frame: "dynamic-island",
    bezel: 13,
    screenRadius: 55,
    frameRadius: 66,
    rotatable: true,
    material: "titanium",
    dpr: 3,
    osVersion: "iOS 18",
    dynamicIsland: { width: 126, height: 37 },
    safeArea: { top: 59, bottom: 34 },
  },
  {
    id: "iphone-se",
    family: "mobile",
    model: "iPhone SE",
    orientation: "portrait",
    viewport: { width: 375, height: 667 },
    frame: "punch-hole",
    bezel: 14,
    screenRadius: 22,
    frameRadius: 32,
    rotatable: true,
    material: "aluminum",
    dpr: 2,
    osVersion: "iOS 17",
    safeArea: { top: 20, bottom: 0 },
  },
  {
    id: "android-360",
    family: "mobile",
    model: "Android 360",
    orientation: "portrait",
    viewport: { width: 360, height: 800 },
    frame: "punch-hole",
    bezel: 10,
    screenRadius: 38,
    frameRadius: 46,
    rotatable: true,
    material: "aluminum",
    dpr: 2,
    osVersion: "Android 14",
    safeArea: { top: 24, bottom: 16 },
  },
  {
    id: "samsung-s25",
    family: "mobile",
    model: "Samsung S25",
    orientation: "portrait",
    viewport: { width: 360, height: 780 },
    frame: "punch-hole",
    bezel: 10,
    screenRadius: 40,
    frameRadius: 48,
    rotatable: true,
    material: "glass",
    dpr: 3,
    osVersion: "Android 15",
    safeArea: { top: 24, bottom: 16 },
  },
  {
    id: "pixel-9",
    family: "mobile",
    model: "Pixel 9",
    orientation: "portrait",
    viewport: { width: 412, height: 892 },
    frame: "punch-hole",
    bezel: 10,
    screenRadius: 42,
    frameRadius: 50,
    rotatable: true,
    material: "aluminum",
    dpr: 2.625,
    osVersion: "Android 15",
    safeArea: { top: 24, bottom: 16 },
  },
  {
    id: "ipad-11",
    family: "tablet",
    model: 'iPad 11"',
    orientation: "portrait",
    viewport: { width: 834, height: 1194 },
    frame: "tablet",
    bezel: 16,
    screenRadius: 12,
    frameRadius: 20,
    rotatable: true,
    material: "aluminum",
    dpr: 2,
    osVersion: "iPadOS 18",
    safeArea: { top: 20, bottom: 20 },
  },
  {
    id: "ipad-pro-13",
    family: "tablet",
    model: 'iPad Pro 13"',
    orientation: "portrait",
    viewport: { width: 1032, height: 1376 },
    frame: "tablet",
    bezel: 18,
    screenRadius: 14,
    frameRadius: 24,
    rotatable: true,
    material: "aluminum",
    dpr: 2,
    osVersion: "iPadOS 18",
    safeArea: { top: 20, bottom: 20 },
  },
  {
    id: "pc-1440",
    family: "desktop",
    model: "PC 1440",
    orientation: "landscape",
    viewport: { width: 1440, height: 900 },
    frame: "browser",
    bezel: 0,
    screenRadius: 0,
    frameRadius: 8,
    rotatable: false,
  },
  {
    id: "macbook-14",
    family: "desktop",
    model: 'MacBook 14"',
    orientation: "landscape",
    viewport: { width: 1512, height: 982 },
    frame: "browser",
    bezel: 0,
    screenRadius: 0,
    frameRadius: 8,
    rotatable: false,
  },
  {
    id: "desktop-1920",
    family: "desktop",
    model: "Desktop 1920",
    orientation: "landscape",
    viewport: { width: 1920, height: 1080 },
    frame: "browser",
    bezel: 0,
    screenRadius: 0,
    frameRadius: 8,
    rotatable: false,
  },
  {
    id: "desktop-2560",
    family: "desktop",
    model: "Desktop 2560",
    orientation: "landscape",
    viewport: { width: 2560, height: 1440 },
    frame: "browser",
    bezel: 0,
    screenRadius: 0,
    frameRadius: 8,
    rotatable: false,
  },
];

// ─── 主题 tokens ───

export interface ThemeTokens {
  bg: string;
  bgGrad: string;
  bar: string;
  barBorder: string;
  text: string;
  sub: string;
  btnText: string;
  btnTextHover: string;
  chipBg: string;
  chipBorder: string;
  frameBorder: string;
  frameShadow: string;
  urlText: string;
  scrollbar: string;
}

export const darkTheme: ThemeTokens = {
  bg: "#0d0f12",
  bgGrad: "linear-gradient(160deg,#101216,#1b1f27 60%,#0d0f12)",
  bar: "rgba(16,18,22,0.95)",
  barBorder: "rgba(255,255,255,0.08)",
  text: "#e6edf3",
  sub: "#8b949e",
  btnText: "#c3ccd6",
  btnTextHover: "#e6edf3",
  chipBg: "rgba(255,255,255,0.06)",
  chipBorder: "rgba(255,255,255,0.12)",
  frameBorder: "#3d4148",
  frameShadow:
    "0 0 0 2px #3d4148, 0 0 0 5px rgba(0,0,0,0.55), 0 40px 80px rgba(0,0,0,0.6)",
  urlText: "#a5b4c2",
  scrollbar: "#2d333b",
};

export const lightTheme: ThemeTokens = {
  bg: "#f4f5f7",
  bgGrad: "linear-gradient(160deg,#fafbfc,#eef0f3 60%,#e2e5ea)",
  bar: "rgba(255,255,255,0.96)",
  barBorder: "rgba(17,24,39,0.1)",
  text: "#1a1d21",
  sub: "#6b7280",
  btnText: "#374151",
  btnTextHover: "#111827",
  chipBg: "rgba(17,24,39,0.05)",
  chipBorder: "rgba(17,24,39,0.14)",
  frameBorder: "#9aa4b2",
  frameShadow:
    "0 0 0 2px #c6ccd4, 0 0 0 5px rgba(0,0,0,0.18), 0 40px 80px rgba(0,0,0,0.28)",
  urlText: "#475569",
  scrollbar: "#c9ced6",
};

// system 在浏览器中跟随系统偏好；SSR 阶段使用 dark，避免首帧 hydration 不一致。
export const THEMES: Record<"light" | "dark" | "system", ThemeTokens> = {
  dark: darkTheme,
  light: lightTheme,
  system: darkTheme,
};

export function getTheme(
  theme: "light" | "dark" | "system",
): ThemeTokens {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? darkTheme
      : lightTheme;
  }
  return THEMES[theme] ?? THEMES.dark;
}

// ─── 默认状态工厂 ───

/**
 * 基于 config 生成默认 PreviewState。
 * - 默认 role 取 config.roles[0].id
 * - 默认 page 取 config.pages[0]
 * - 默认 device 取 DEFAULT_DEVICES[0]（或 config.devices[0]）
 * - 其余字段从 config.defaultState 覆盖
 */
export function createDefaultState(config: PreviewHubConfig): PreviewState {
  const ds = config.defaultState ?? {};
  const devices = config.devices && config.devices.length > 0 ? config.devices : DEFAULT_DEVICES;
  const defaultRole = ds.role ?? config.roles[0]?.id ?? "merchant";
  const defaultSurface = ds.surface ?? "web";
  const defaultDevice =
    devices.find((d) => d.id === ds.deviceId) ?? devices[0] ?? DEFAULT_DEVICES[0];
  const defaultPage =
    config.pages.find((p) => p.id === ds.pageId) ?? config.pages[0];
  const defaultPageRoute =
    (defaultSurface === "mini_program"
      ? defaultPage?.miniProgram?.route
      : defaultPage?.web?.route) ?? defaultPage?.web?.route ?? "/";

  const experience = {
    role: defaultRole,
    surface: defaultSurface,
    device: defaultDevice,
    page: {
      pageId: defaultPage?.id ?? "",
      route: ds.pageId && defaultPage ? defaultPageRoute : defaultPageRoute,
    },
  };

  const comparisonDevice =
    devices.find((d) => d.id === "pc-1440") ??
    devices.find((d) => d.family === "desktop") ??
    devices[0];

  return {
    mode: "focus",
    experience,
    lastRouteByRole: ds.lastRouteByRole ?? {},
    theme: ds.theme ?? "dark",
    readOnly: ds.readOnly ?? true,
    environment: ds.environment ?? "dev",
    colorFilter: "normal",
    comparison: {
      leftExperience: experience,
      rightExperience: {
        role: experience.role,
        surface: "web",
        device: comparisonDevice,
        page: { ...experience.page },
      },
      sync: { page: true, scroll: false, data: false },
      activeSide: "left",
    },
    drawer: null,
    favorites: [],
    recentPages: [],
  };
}
