// Preview Hub — 设备安全区与布局计算工具
// 统一管理所有设备的 safe-area、状态栏、Home Indicator 等布局计算
// 确保多设备渲染一致性，可独立开源使用
/**
 * 计算设备布局信息
 * 统一入口，确保所有渲染器使用相同的计算逻辑
 */
export function computeDeviceLayout(device) {
    const { orientation, rotatable, viewport, safeArea, dpr } = device;
    const isLandscape = orientation === "landscape" && rotatable;
    const isTablet = device.family === "tablet";
    // 有效视口：横屏交换宽高
    const effectiveViewport = isLandscape
        ? { width: viewport.height, height: viewport.width }
        : viewport;
    // 安全区
    const sa = safeArea ?? { top: 0, bottom: 0 };
    const safeAreaTop = isLandscape ? 0 : sa.top;
    const safeAreaBottom = isLandscape ? 0 : sa.bottom;
    const safeAreaLeft = isLandscape ? (sa.left ?? 44) : (sa.left ?? 0);
    const safeAreaRight = isLandscape ? (sa.right ?? 0) : (sa.right ?? 0);
    // 状态栏高度 = 顶部安全区
    const statusBarHeight = safeAreaTop;
    // Home Indicator 尺寸（iOS 标准，与原渲染器保持一致）
    // 竖屏手机：134 x 4，底部偏移 8
    // 平板/横屏：160 x 4，底部偏移 8
    const homeIndicatorWidth = isLandscape || isTablet ? 160 : 134;
    const homeIndicatorHeight = 4;
    const homeIndicatorBottomOffset = 8;
    const homeIndicatorBorderRadius = 2;
    // TabBar 高度（iOS 原生标准）
    const tabBarHeight = 49;
    const tabBarTotalHeight = tabBarHeight + safeAreaBottom;
    // iframe 实际渲染高度
    const iframeHeight = effectiveViewport.height - statusBarHeight;
    return {
        viewport: effectiveViewport,
        statusBarHeight,
        safeAreaBottom,
        safeAreaTop,
        safeAreaLeft,
        safeAreaRight,
        homeIndicator: {
            width: homeIndicatorWidth,
            height: homeIndicatorHeight,
            bottomOffset: homeIndicatorBottomOffset,
            borderRadius: homeIndicatorBorderRadius,
        },
        dpr: dpr ?? 2,
        isLandscape,
        isTablet,
        iframeHeight,
        tabBarHeight,
        tabBarTotalHeight,
    };
}
/**
 * 计算设备壳外尺寸（含边框）
 */
export function computeDeviceOuterSize(device, browserToolbarHeight = 38) {
    const layout = computeDeviceLayout(device);
    if (device.frame === "browser") {
        return {
            width: layout.viewport.width,
            height: layout.viewport.height + browserToolbarHeight,
        };
    }
    const bezel = device.bezel ?? 0;
    return {
        width: layout.viewport.width + bezel * 2,
        height: layout.viewport.height + bezel * 2,
    };
}
/**
 * 校验设备配置是否合理
 * 返回警告信息（不阻塞渲染，但提示可能的问题）
 */
export function validateDeviceConfig(device) {
    const warnings = [];
    const sa = device.safeArea;
    if (!sa) {
        warnings.push(`${device.model}: 缺少 safeArea 配置，默认使用 0`);
        return warnings;
    }
    // iPhone 系列安全区校验
    if (device.family === "mobile" && device.frame === "dynamic-island") {
        if (sa.bottom < 20 || sa.bottom > 40) {
            warnings.push(`${device.model}: safeArea.bottom=${sa.bottom} 超出 iPhone 常规范围 (20-40px)，可能导致 TabBar 位置异常`);
        }
        if (sa.top < 40 || sa.top > 60) {
            warnings.push(`${device.model}: safeArea.top=${sa.top} 超出灵动岛机型常规范围 (40-60px)`);
        }
    }
    // 打孔屏手机校验
    if (device.family === "mobile" && device.frame === "punch-hole") {
        if (sa.bottom > 20) {
            warnings.push(`${device.model}: safeArea.bottom=${sa.bottom} 对于打孔屏机型可能偏大（通常 0-20px）`);
        }
    }
    // 视口比例校验
    const ratio = device.viewport.height / device.viewport.width;
    if (device.family === "mobile" && (ratio < 1.7 || ratio > 2.2)) {
        warnings.push(`${device.model}: 视口比例 ${ratio.toFixed(2)} 偏离手机常规范围 (1.7-2.2)`);
    }
    return warnings;
}
/**
 * 预设设备安全区标准值
 * 可用于快速创建设备配置
 */
export const PRESET_SAFE_AREAS = {
    // iPhone 灵动岛机型（14 Pro及更新）
    iphoneDynamicIsland: { top: 59, bottom: 34 },
    // iPhone 刘海机型（X-14）
    iphoneNotch: { top: 44, bottom: 34 },
    // iPhone 非全面屏（SE 1/2/3、8及更早）
    iphoneClassic: { top: 20, bottom: 0 },
    // Android 三键导航
    androidThreeButton: { top: 24, bottom: 0 },
    // Android 手势导航
    androidGesture: { top: 24, bottom: 16 },
    // iPad
    ipad: { top: 20, bottom: 20 },
};
//# sourceMappingURL=device-layout.js.map