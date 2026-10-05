import type { PreviewDevice, PreviewExperience } from "../types";
/** 有效视口：横屏交换宽高（desktop 不可旋转，恒原值） */
export declare function effectiveViewport(device: PreviewDevice): {
    width: number;
    height: number;
};
/** 设备壳外尺寸（含边框 / 浏览器地址栏），供 Canvas 计算缩放 */
export declare function getDeviceOuterSize(device: PreviewDevice): {
    width: number;
    height: number;
};
export interface SurfaceRendererProps {
    experience: PreviewExperience;
    readOnly: boolean;
    onRouteChange?: (route: string) => void;
    onReady?: () => void;
    on401?: () => void;
    /** iframe 加载完成时上报 contentWindow，供 hub 注册广播 */
    onIframeReady?: (win: Window) => void;
    /** iframe 内滚动位置变化时上报（对比模式同步用） */
    onScroll?: (scrollTop: number, scrollLeft: number) => void;
}
export declare function WebRenderer({ experience, readOnly, onRouteChange, onReady, on401, onIframeReady, onScroll, }: SurfaceRendererProps): import("react").JSX.Element;
//# sourceMappingURL=web-renderer.d.ts.map