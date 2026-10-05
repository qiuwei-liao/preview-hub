// Preview Hub — LocalStorage 持久化
// 只持久化个人习惯字段；comparison / drawer / previousFocusExperience 为临时状态。
// STORAGE_KEY 由 config.storageKeyPrefix 驱动；legacy migration 已删除（包内不绑定特定业务）。
function isPreviewSurface(value) {
    return value === "web" || value === "mini_program" || value === "app";
}
function isThemeMode(value) {
    return value === "light" || value === "dark" || value === "system";
}
/** 构建持久化 key：storageKeyPrefix + ":v2" */
export function buildStorageKey(keyPrefix) {
    return `${keyPrefix}:v2`;
}
/** 基于 config.defaultState 生成默认持久化值 */
export function buildDefaultPersisted(keyPrefix, defaults) {
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
export function loadPersistedState(keyPrefix, defaultPersisted) {
    const STORAGE_KEY = buildStorageKey(keyPrefix);
    if (typeof window === "undefined")
        return { ...defaultPersisted };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return { ...defaultPersisted };
        const parsed = JSON.parse(raw);
        return {
            lastRole: typeof parsed.lastRole === "string"
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
    }
    catch {
        return { ...defaultPersisted };
    }
}
/** 写入 LocalStorage（仅个人习惯字段） */
export function savePersistedState(state, keyPrefix) {
    if (typeof window === "undefined")
        return;
    try {
        localStorage.setItem(buildStorageKey(keyPrefix), JSON.stringify(state));
    }
    catch {
        // ignore quota errors
    }
}
//# sourceMappingURL=storage.js.map