// Preview Hub — 对外统一导出
// 主组件
export { PreviewHub } from "./components/PreviewHub";
// Provider / Hook
export { PreviewHubProvider, usePreviewHubConfig } from "./config/context";
// 内置默认值 / 主题
export { DEFAULT_DEVICES, getTheme, THEMES, darkTheme, lightTheme } from "./config/defaults";
export { SURFACE_LABELS, SURFACE_DEVICE_FAMILIES } from "./types";
// 注册表工厂
export { createPageRegistry } from "./registry/page";
export { createDeviceRegistry } from "./registry/device";
// 会话
export { NoopAuthAdapter } from "./session/auth-adapter";
// App 载体渲染器与外壳（供自定义宿主嵌入）
export { AppRenderer } from "./renderer/app-renderer";
export { AppShell, getAppShellSize } from "./renderer/app-shell";
// 工具函数（纯逻辑，无 React 依赖）
export { sendToIframe, listenPreviewMessages, sendToHub } from "./renderer/bus";
export { enableReadOnlyGuard, disableReadOnlyGuard } from "./ui/read-only-guard";
export { buildPreviewUrl, parsePreviewUrl } from "./state/url";
//# sourceMappingURL=index.js.map