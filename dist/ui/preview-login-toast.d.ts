export interface PreviewLoginToastProps {
    /** 是否正在自动登录 / 切换身份 */
    isLoggingIn: boolean;
    /** 当前身份展示名（如「南京鲜肉测试店 · 老板」） */
    identityLabel: string;
    /** 登录失败信息；null/undefined 表示无错误 */
    loginError?: string | null;
}
/**
 * Preview Hub 右上角登录状态浮层：
 * - 登录中（蓝色）/ 登录失败（红色）二选一展示。
 * 注意：沿用 Preview Hub 自有深色主题内联色值，不接入主站语义 token。
 */
export declare function PreviewLoginToast({ isLoggingIn, identityLabel, loginError, }: PreviewLoginToastProps): import("react").JSX.Element | null;
//# sourceMappingURL=preview-login-toast.d.ts.map