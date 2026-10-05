import type { PreviewDevice } from "../types";
/**
 * 设备布局信息
 * 所有尺寸单位为 CSS 像素（px）
 */
export interface DeviceLayout {
    /** 有效视口（横屏已交换宽高） */
    viewport: {
        width: number;
        height: number;
    };
    /** 状态栏高度（横屏为 0） */
    statusBarHeight: number;
    /** 底部安全区（Home Indicator 避让高度，横屏为 0） */
    safeAreaBottom: number;
    /** 顶部安全区（状态栏高度，横屏为 0） */
    safeAreaTop: number;
    /** 横屏左右安全区（灵动岛/摄像头避让） */
    safeAreaLeft: number;
    safeAreaRight: number;
    /** Home Indicator 尺寸 */
    homeIndicator: {
        width: number;
        height: number;
        /** 距离屏幕底部的距离 */
        bottomOffset: number;
        /** 圆角半径 */
        borderRadius: number;
    };
    /** 设备像素比 */
    dpr: number;
    /** 是否横屏 */
    isLandscape: boolean;
    /** 是否平板 */
    isTablet: boolean;
    /** iframe 实际渲染高度（视口高度 - 状态栏高度） */
    iframeHeight: number;
    /** TabBar 推荐高度（iOS 原生标准 49px） */
    tabBarHeight: number;
    /** TabBar 总高度（含安全区） */
    tabBarTotalHeight: number;
}
/**
 * 计算设备布局信息
 * 统一入口，确保所有渲染器使用相同的计算逻辑
 */
export declare function computeDeviceLayout(device: PreviewDevice): DeviceLayout;
/**
 * 计算设备壳外尺寸（含边框）
 */
export declare function computeDeviceOuterSize(device: PreviewDevice, browserToolbarHeight?: number): {
    width: number;
    height: number;
};
/**
 * 校验设备配置是否合理
 * 返回警告信息（不阻塞渲染，但提示可能的问题）
 */
export declare function validateDeviceConfig(device: PreviewDevice): string[];
/**
 * 预设设备安全区标准值
 * 可用于快速创建设备配置
 */
export declare const PRESET_SAFE_AREAS: {
    readonly iphoneDynamicIsland: {
        readonly top: 59;
        readonly bottom: 34;
    };
    readonly iphoneNotch: {
        readonly top: 44;
        readonly bottom: 34;
    };
    readonly iphoneClassic: {
        readonly top: 20;
        readonly bottom: 0;
    };
    readonly androidThreeButton: {
        readonly top: 24;
        readonly bottom: 0;
    };
    readonly androidGesture: {
        readonly top: 24;
        readonly bottom: 16;
    };
    readonly ipad: {
        readonly top: 20;
        readonly bottom: 20;
    };
};
//# sourceMappingURL=device-layout.d.ts.map