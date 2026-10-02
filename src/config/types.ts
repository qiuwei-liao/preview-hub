// Preview Hub — 配置类型定义
// 所有业务数据通过 PreviewHubConfig 注入，包内零业务依赖。

import type {
  IdentitySpec,
  PageDef,
  PreviewDevice,
  PreviewRole,
  PreviewSurface,
  ThemeMode,
} from "../types";

/** 角色定义 */
export interface RoleDef {
  id: PreviewRole;
  label: string;          // 显示名，如 "C端"
  description?: string;
}

/** 载体定义 */
export interface SurfaceDef {
  id: PreviewSurface;
  label: string;          // "Web" / "小程序"
}

/** 环境定义 */
export interface EnvironmentSpec {
  id: string;
  label: string;
  apiOrigin: string;
  description: string;
}

/** 小程序页面配置 */
export interface MiniappPage {
  id: string;
  label: string;
  /** 同源路由（真实页面） */
  url: string;
  caption: string;
  spec: string[];
}

export interface MiniappTabBarItem {
  pageId: string;
  label: string;
}

export interface MiniappConfig {
  pages: MiniappPage[];
  tabbar: MiniappTabBarItem[];
}

/** 认证适配器 —— 接入方实现，包内不依赖任何业务 auth */
export interface AuthAdapter {
  /** 用身份配置执行登录（含角色切换），返回会话展示信息 */
  login(identity: IdentitySpec): Promise<SessionDisplayInfo>;
  /** 读取当前会话展示信息 */
  getSession(): SessionDisplayInfo;
  /** 是否已登录 */
  isLoggedIn(): boolean;
  /** 可选：订阅会话变化，返回取消订阅函数 */
  subscribe?(callback: () => void): () => void;
}

export interface SessionDisplayInfo {
  loggedIn: boolean;
  phone?: string;
  role?: PreviewRole;
  roleLabel?: string;
  shopName?: string;
  loggedInAt?: number;
}

/** 默认状态配置（部分覆盖内置默认） */
export interface DefaultStateConfig {
  role?: PreviewRole;
  surface?: PreviewSurface;
  deviceId?: string;
  pageId?: string;
  theme?: ThemeMode;
  readOnly?: boolean;
  environment?: string;
  lastRouteByRole?: Record<PreviewRole, string>;
}

/** Preview Hub 完整配置 */
export interface PreviewHubConfig {
  /** 页面注册表（必填） */
  pages: PageDef[];
  /** 角色定义（必填） */
  roles: RoleDef[];
  /** 设备注册表（可选，不传用内置默认 10 款设备） */
  devices?: PreviewDevice[];
  /** 身份列表（可选，用于真实登录切换；不传则隐藏登录相关 UI） */
  identities?: IdentitySpec[];
  /** 小程序配置（可选，不传则隐藏小程序载体） */
  miniapp?: MiniappConfig;
  /** 环境列表（可选，默认 [{id:"dev",label:"DEV",...}]） */
  environments?: EnvironmentSpec[];
  /** iframe 基地址，默认 ""（同源相对路径）；跨域预览时填目标源 */
  iframeBaseUrl?: string;
  /** 认证适配器（可选，不传则不执行真实登录，仅静态展示） */
  authAdapter?: AuthAdapter;
  /** localStorage key 前缀，默认 "preview-hub" */
  storageKeyPrefix?: string;
  /** 预览路由路径（用于 buildPreviewUrl），默认 "/preview" */
  previewRoutePath?: string;
  /** 会话变化自定义事件名，默认 "preview-hub:session-changed" */
  sessionChangeEvent?: string;
  /** 默认状态（可选，部分覆盖） */
  defaultState?: DefaultStateConfig;
  /** 页面 ID 别名（可选，如 { home: "me" }） */
  pageIdAliases?: Record<string, string>;
}
