import type { FavoriteItem, PreviewRole, PreviewSurface, RecentPage, ThemeMode } from "../types";
export interface PersistedState {
    lastRole: PreviewRole;
    lastSurface: PreviewSurface;
    lastDeviceId: string;
    lastRouteByRole: Record<PreviewRole, string>;
    theme: ThemeMode;
    favorites: FavoriteItem[];
    recentPages: RecentPage[];
}
/** 构建持久化 key：storageKeyPrefix + ":v2" */
export declare function buildStorageKey(keyPrefix: string): string;
/** 基于 config.defaultState 生成默认持久化值 */
export declare function buildDefaultPersisted(keyPrefix: string, defaults: {
    lastRole: PreviewRole;
    lastDeviceId: string;
    lastRouteByRole: Record<PreviewRole, string>;
    theme: ThemeMode;
}): PersistedState;
/** 读取 LocalStorage，合并默认值，防止旧版本字段缺失 */
export declare function loadPersistedState(keyPrefix: string, defaultPersisted: PersistedState): PersistedState;
/** 写入 LocalStorage（仅个人习惯字段） */
export declare function savePersistedState(state: PersistedState, keyPrefix: string): void;
//# sourceMappingURL=storage.d.ts.map