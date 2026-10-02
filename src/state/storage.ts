// Preview Hub — LocalStorage 持久化
// 只持久化个人习惯字段；comparison / drawer / previousFocusExperience 为临时状态。
// STORAGE_KEY 由 config.storageKeyPrefix 驱动；legacy migration 已删除（包内不绑定特定业务）。

import type {
  FavoriteItem,
  PreviewRole,
  PreviewSurface,
  RecentPage,
  ThemeMode,
} from "../types";

export interface PersistedState {
  lastRole: PreviewRole;
  lastSurface: PreviewSurface;
  lastDeviceId: string;
  lastRouteByRole: Record<PreviewRole, string>;
  theme: ThemeMode;
  favorites: FavoriteItem[];
  recentPages: RecentPage[];
}

function isPreviewSurface(value: unknown): value is PreviewSurface {
  return value === "web" || value === "mini_program";
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/** 构建持久化 key：storageKeyPrefix + ":v2" */
export function buildStorageKey(keyPrefix: string): string {
  return `${keyPrefix}:v2`;
}

/** 基于 config.defaultState 生成默认持久化值 */
export function buildDefaultPersisted(
  keyPrefix: string,
  defaults: {
    lastRole: PreviewRole;
    lastDeviceId: string;
    lastRouteByRole: Record<PreviewRole, string>;
    theme: ThemeMode;
  },
): PersistedState {
  return {
    lastRole: defaults.lastRole,
    lastSurface: "web",
    lastDeviceId: defaults.lastDeviceId,
    lastRouteByRole: { ...defaults.lastRouteByRole },
    theme: defaults.theme,
    favorites: [],
    recentPages: [],
  };
}

/** 读取 LocalStorage，合并默认值，防止旧版本字段缺失 */
export function loadPersistedState(
  keyPrefix: string,
  defaultPersisted: PersistedState,
): PersistedState {
  const STORAGE_KEY = buildStorageKey(keyPrefix);
  if (typeof window === "undefined") return { ...defaultPersisted };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultPersisted };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      lastRole:
        typeof parsed.lastRole === "string"
          ? parsed.lastRole
          : defaultPersisted.lastRole,
      lastSurface: isPreviewSurface(parsed.lastSurface)
        ? parsed.lastSurface
        : defaultPersisted.lastSurface,
      lastDeviceId: parsed.lastDeviceId ?? defaultPersisted.lastDeviceId,
      lastRouteByRole: {
        ...defaultPersisted.lastRouteByRole,
        ...(parsed.lastRouteByRole ?? {}),
      },
      theme: isThemeMode(parsed.theme) ? parsed.theme : defaultPersisted.theme,
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recentPages: Array.isArray(parsed.recentPages) ? parsed.recentPages : [],
    };
  } catch {
    return { ...defaultPersisted };
  }
}

/** 写入 LocalStorage（仅个人习惯字段） */
export function savePersistedState(
  state: PersistedState,
  keyPrefix: string,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(buildStorageKey(keyPrefix), JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}
