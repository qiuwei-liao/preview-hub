/** 危险操作关键词（按钮文本匹配） */
export declare const DANGEROUS_KEYWORDS: string[];
/** 判断一个点击事件的目标是否为危险操作按钮 */
export declare function isDangerousClick(target: EventTarget | null): boolean;
/**
 * 启用只读保护。
 * 在 document 上注册捕获阶段 click 监听，危险操作弹确认层。
 * @returns 取消函数（移除监听 + 清理确认层）
 */
export declare function enableReadOnlyGuard(): () => void;
/** 禁用只读保护：移除监听并清理确认层 */
export declare function disableReadOnlyGuard(): void;
//# sourceMappingURL=read-only-guard.d.ts.map