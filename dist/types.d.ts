export type PreviewRole = string;
export type PreviewSurface = "web" | "mini_program" | "app";
export declare const SURFACE_LABELS: Record<PreviewSurface, string>;
/** Surface 允许的设备族 */
export declare const SURFACE_DEVICE_FAMILIES: Record<PreviewSurface, DeviceFamily[]>;
export type DeviceFamily = "mobile" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";
export type DeviceFrameType = "dynamic-island" | "punch-hole" | "tablet" | "browser";
export type DeviceMaterial = "titanium" | "aluminum" | "glass" | "plastic";
export interface PreviewDevice {
    id: string;
    family: DeviceFamily;
    model: string;
    orientation: Orientation;
    viewport: {
        width: number;
        height: number;
    };
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
    dynamicIsland?: {
        width: number;
        height: number;
    };
    /** 移动端安全区（CSS px：top 避让刘海/灵动岛，bottom 避让 Home 指示条）。
        缺省时被预览页面回退到 env(safe-area-inset-*)。 */
    safeArea?: {
        top: number;
        bottom: number;
        left?: number;
        right?: number;
    };
}
export interface PageSurfaceRoute {
    route: string;
}
export interface PageDef {
    id: string;
    title: string;
    roles?: PreviewRole[];
    web?: PageSurfaceRoute;
    miniProgram?: PageSurfaceRoute;
    app?: PageSurfaceRoute;
    sourceFile?: string;
}
export interface PreviewExperience {
    role: PreviewRole;
    surface: PreviewSurface;
    device: PreviewDevice;
    page: {
        pageId: string;
        route: string;
    };
}
export type PreviewMode = "focus" | "comparison";
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
export type ThemeMode = "light" | "dark" | "system";
export type ColorFilterMode = "normal" | "grayscale" | "high-contrast" | "invert" | "protanopia" | "deuteranopia";
export declare const COLOR_FILTERS: Record<ColorFilterMode, {
    label: string;
    css: string;
}>;
export type Environment = string;
export interface IdentitySpec {
    id: string;
    role: PreviewRole;
    label: string;
    phone: string;
    code: string;
    tenantSlug?: string;
    description: string;
}
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
export type DrawerType = "settings" | "status" | null;
export interface PreviewState {
    mode: PreviewMode;
    experience: PreviewExperience;
    lastRouteByRole: Record<PreviewRole, string>;
    theme: ThemeMode;
    readOnly: boolean;
    environment: Environment;
    /** 颜色无障碍滤镜 */
    colorFilter: ColorFilterMode;
    comparison: ComparisonState;
    previousFocusExperience?: PreviewExperience;
    drawer: DrawerType;
    favorites: FavoriteItem[];
    recentPages: RecentPage[];
}
export type AuthStatus = "logged-in" | "logged-out" | "checking";
export type PreviewMessageType = "preview:ready" | "preview:route-changed" | "preview:401" | "preview:set-route" | "preview:sync-request" | "preview:sync-response" | "preview:set-readonly" | "preview:set-safe-area" | "preview:get-safe-area" | "preview:set-status-bar-theme" | "preview:get-status-bar-theme" | "preview:set-scroll" | "preview:get-scroll" | "preview:keyboard-show" | "preview:keyboard-hide";
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
export interface PreviewRenderer {
    mount(container: HTMLElement, experience: PreviewExperience): void;
    unmount(): void;
    navigate(route: string): void;
    reload(): void;
}
export interface MiniProgramNavEntry {
    pageId: string;
    route: string;
    title: string;
}
export interface MiniProgramNavigationState {
    stack: MiniProgramNavEntry[];
    currentIndex: number;
}
//# sourceMappingURL=types.d.ts.map