interface UseHmrWatcherOptions {
    /** dev server 基础 URL，如 http://localhost:3333 */
    baseUrl: string;
    /** 编译完成时的回调（防抖后触发） */
    onUpdate: () => void;
    /** 是否启用监听，默认 true */
    enabled?: boolean;
    /** 防抖延迟（ms），默认 800ms，避免连续保存时频繁刷新 */
    debounceMs?: number;
}
/**
 * 监听 Next.js dev server 的 HMR 编译事件
 *
 * @returns { connected: boolean; lastUpdate: number | null }
 */
export declare function useHmrWatcher({ baseUrl, onUpdate, enabled, debounceMs, }: UseHmrWatcherOptions): {
    connected: boolean;
    lastUpdate: number | null;
};
export {};
//# sourceMappingURL=use-hmr-watcher.d.ts.map