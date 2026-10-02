// Preview Hub 2.0 — 核心类型定义
// 四维模型：Role / Surface / Device / Page 严格分离。
// 所有状态、Resolver、Registry、Renderer、UI 组件共享此契约。

// ─── 维度一：Role 角色 ───
// 角色由 config.roles 定义，包内不预设具体角色。
export type PreviewRole = string;

// ─── 维度二：Surface 产品载体 ───
// 载体保持固定联合（渲染器按载体分发，新增载体需新增渲染器）。
export type PreviewSurface = "web" | "mini_program";

export const SURFACE_LABELS: Record<PreviewSurface, string> = {
  web: "Web",
  mini_program: "小程序",
};

/** Surface 允许的设备族 */
export const SURFACE_DEVICE_FAMILIES: Record<PreviewSurface, DeviceFamily[]> = {
  web: ["mobile", "tablet", "desktop"],
  mini_program: ["mobile"],
};

// ─── 维度三：Device 设备 ───
export type DeviceFamily = "mobile" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";
export type DeviceFrameType = "dynamic-island" | "punch-hole" | "tablet" | "browser";
export type DeviceMaterial = "titanium" | "aluminum" | "glass" | "plastic";

export interface PreviewDevice {
  id: string;
  family: DeviceFamily;
  model: string;              // 显示名，如 "iPhone 18 Pro"
  orientation: Orientation;
  viewport: { width: number; height: number };
  frame: DeviceFrameType;
  bezel: number;
  screenRadius: number;
  frameRadius: number;
  rotatable: boolean;
  /** 设备壳材质，影响外壳渐变质感 */
  material?: DeviceMaterial;
  /** 设备像素比，影响 1px 边框和图标清晰度 */
  dpr?: number;
  /** 系统版本，如 "iOS 18" / "Android 15" */
  osVersion?: string;
  /** 灵动岛尺寸（仅 dynamic-island 机型），缺省用默认值 */
  dynamicIsland?: { width: number; height: number };
  /** 移动端安全区（CSS px：top 避让刘海/灵动岛，bottom 避让 Home 指示条）。
      缺省时被预览页面回退到 env(safe-area-inset-*)。 */
  safeArea?: { top: number; bottom: number; left?: number; right?: number };
}

// ─── 维度四：Page 业务页面 ───
export interface PageSurfaceRoute {
  route: string;
}

export interface PageDef {
  id: string;                  // 业务 pageId，如 "orders"
  title: string;               // 显示标题，如 "我的订单"
  roles?: PreviewRole[];       // 可访问角色；undefined = 全部
  web?: PageSurfaceRoute;      // Web 路由
  miniProgram?: PageSurfaceRoute; // 小程序路由
  sourceFile?: string;         // 实际渲染的源文件（相对项目根），便于定位开发
}

// ─── Experience 体验组合 ───
export interface PreviewExperience {
  role: PreviewRole;
  surface: PreviewSurface;
  device: PreviewDevice;
  page: {
    pageId: string;
    route: string;
  };
}

// ─── Mode 模式 ───
export type PreviewMode = "focus" | "comparison";

// ─── Comparison 对比状态 ───
export interface ComparisonSyncState {
  page: boolean;
  scroll: boolean;
  data: boolean;
}

export interface ComparisonState {
  leftExperience: PreviewExperience;
  rightExperience: PreviewExperience;
  sync: ComparisonSyncState;
  activeSide: "left" | "right";
}

// ─── Theme ───
export type ThemeMode = "light" | "dark" | "system";

// ─── Color Filter（无障碍颜色模拟） ───
export type ColorFilterMode = "normal" | "grayscale" | "high-contrast" | "invert" | "protanopia" | "deuteranopia";

export const COLOR_FILTERS: Record<ColorFilterMode, { label: string; css: string }> = {
  normal: { label: "正常", css: "none" },
  grayscale: { label: "灰度", css: "grayscale(100%)" },
  "high-contrast": { label: "高对比度", css: "contrast(1.5) saturate(1.3)" },
  invert: { label: "反色", css: "invert(1) hue-rotate(180deg)" },
  protanopia: { label: "红色盲", css: "sepia(0.35) hue-rotate(-25deg) saturate(0.75) contrast(1.05)" },
  deuteranopia: { label: "绿色盲", css: "sepia(0.25) hue-rotate(35deg) saturate(0.7) contrast(1.05)" },
};

// ─── Environment ───
// 环境由 config.environments 定义，包内不预设具体环境。
export type Environment = string;

// ─── 身份（登录用，保留现有能力） ───
export interface IdentitySpec {
  id: string;
  role: PreviewRole;
  label: string;
  phone: string;
  code: string;
  tenantSlug?: string;
  description: string;
}

// ─── 收藏 / 最近访问 ───
export interface FavoriteItem {
  id: string;
  pageId: string;
  surface: PreviewSurface;
  role: PreviewRole;
  createdAt: number;
}

export interface RecentPage {
  role: PreviewRole;
  surface: PreviewSurface;
  pageId: string;
  timestamp: number;
}

// ─── Drawer 状态 ───
export type DrawerType = "settings" | "status" | null;

// ─── 完整 PreviewState ───
export interface PreviewState {
  mode: PreviewMode;
  experience: PreviewExperience;
  lastRouteByRole: Record<PreviewRole, string>;
  theme: ThemeMode;
  readOnly: boolean;
  environment: Environment;
  /** 颜色无障碍滤镜 */
  colorFilter: ColorFilterMode;
  // 对比模式独立状态
  comparison: ComparisonState;
  // 进入 Comparison 前的 Focus 上下文（Esc 恢复用）
  previousFocusExperience?: PreviewExperience;
  // UI 临时状态（不持久化到 localStorage 核心）
  drawer: DrawerType;
  favorites: FavoriteItem[];
  recentPages: RecentPage[];
}

// ─── iframe 通信协议（保留现有能力） ───
export type AuthStatus = "logged-in" | "logged-out" | "checking";

export type PreviewMessageType =
  | "preview:ready"
  | "preview:route-changed"
  | "preview:401"
  | "preview:set-route"
  | "preview:sync-request"
  | "preview:sync-response"
  | "preview:set-readonly"
  | "preview:set-safe-area"
  | "preview:get-safe-area"
  | "preview:set-status-bar-theme"
  | "preview:get-status-bar-theme"
  | "preview:set-scroll"
  | "preview:get-scroll"
  | "preview:keyboard-show"
  | "preview:keyboard-hide";

export interface PreviewMessage {
  type: PreviewMessageType;
  route?: string;
  panelId?: string;
  enabled?: boolean;
  /** preview:set-safe-area 负载：设备安全区（CSS px） */
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  /** preview:set-safe-area 负载：设备像素比 */
  dpr?: number;
  /** preview:set-status-bar-theme 负载：true=深色栏(白字), false=浅色栏(黑字) */
  dark?: boolean;
  /** preview:set-scroll 负载：滚动位置 */
  scrollTop?: number;
  scrollLeft?: number;
  /** preview:keyboard-show 负载：键盘高度（px） */
  keyboardHeight?: number;
}

// ─── Renderer 抽象 ───
export interface PreviewRenderer {
  mount(container: HTMLElement, experience: PreviewExperience): void;
  unmount(): void;
  navigate(route: string): void;
  reload(): void;
}

// ─── 小程序导航栈 ───
export interface MiniProgramNavEntry {
  pageId: string;
  route: string;
  title: string;
}

export interface MiniProgramNavigationState {
  stack: MiniProgramNavEntry[];
  currentIndex: number;
}
