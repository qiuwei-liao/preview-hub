import type { ReactNode } from "react";
import type { MiniProgramNavigationState, PreviewDevice } from "../types";
export declare const MINIAPP_SHELL_DEFAULT_SIZE: {
    readonly width: 340;
    readonly height: 640;
};
/** 外壳外尺寸：未指定设备时用 340×640；指定设备时贴合设备视口宽。 */
export declare function getMiniProgramShellSize(device?: PreviewDevice): {
    width: number;
    height: number;
};
export interface MiniProgramShellProps {
    navigationState: MiniProgramNavigationState;
    onNavigateBack: () => void;
    onSwitchTab: (pageId: string) => void;
    children: ReactNode;
    /** 设备视口（决定外壳宽高）；不传则 340×640 */
    device?: PreviewDevice;
    /** 深色导航 → 白底黑图标胶囊；默认浅色导航 → 深胶囊白图标 */
    darkNav?: boolean;
}
export declare function MiniProgramShell({ navigationState, onNavigateBack, onSwitchTab, children, device, darkNav, }: MiniProgramShellProps): import("react").JSX.Element;
//# sourceMappingURL=mini-program-shell.d.ts.map