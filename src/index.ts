// Preview Hub — 对外统一导出

// 主组件
export { PreviewHub } from "./components/PreviewHub";
export type { PreviewHubProps } from "./components/PreviewHub";

// Provider / Hook
export { PreviewHubProvider, usePreviewHubConfig } from "./config/context";

// 配置类型
export type {
  PreviewHubConfig,
  AuthAdapter,
  SessionDisplayInfo,
  RoleDef,
  SurfaceDef,
  EnvironmentSpec,
  MiniappConfig,
  MiniappPage,
  MiniappTabBarItem,
  DefaultStateConfig,
} from "./config/types";

// 内置默认值 / 主题
export { DEFAULT_DEVICES, getTheme, THEMES, darkTheme, lightTheme } from "./config/defaults";
export type { ThemeTokens } from "./config/defaults";

// 核心类型
export type {
  PreviewRole,
  PreviewSurface,
  PreviewDevice,
  PageDef,
  PageSurfaceRoute,
  PreviewExperience,
  PreviewState,
  PreviewMode,
  ComparisonState,
  ThemeMode,
  IdentitySpec,
  PreviewMessage,
  PreviewMessageType,
  PreviewRenderer,
  DeviceFamily,
  Orientation,
} from "./types";
export { SURFACE_LABELS, SURFACE_DEVICE_FAMILIES } from "./types";

// 注册表工厂
export { createPageRegistry } from "./registry/page";
export type { PageRegistry } from "./registry/page";
export { createDeviceRegistry } from "./registry/device";
export type { DeviceRegistry } from "./registry/device";

// 会话
export { NoopAuthAdapter } from "./session/auth-adapter";

// 工具函数（纯逻辑，无 React 依赖）
export { sendToIframe, listenPreviewMessages, sendToHub } from "./renderer/bus";
export { enableReadOnlyGuard, disableReadOnlyGuard } from "./ui/read-only-guard";
export { buildPreviewUrl, parsePreviewUrl } from "./state/url";
