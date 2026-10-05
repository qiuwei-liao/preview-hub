import type { ReactNode } from "react";
import type { PreviewDevice } from "../types";
export declare const APP_SHELL_DEFAULT_SIZE: {
    readonly width: 390;
    readonly height: 780;
};
/** 外壳外尺寸：未指定设备时用 390×780；指定设备时贴合设备视口宽。 */
export declare function getAppShellSize(device?: PreviewDevice): {
    width: number;
    height: number;
};
export interface AppShellProps {
    activePageId: string;
    onSwitchTab: (pageId: string) => void;
    children: ReactNode;
    /** 设备视口（决定外壳宽高）；不传则 390×780 */
    device?: PreviewDevice;
    /** 深色导航 → 深底白字；默认浅色（iOS 浅色 App 界面） */
    darkNav?: boolean;
}
export declare function AppShell({ activePageId, onSwitchTab, children, device, darkNav, }: AppShellProps): import("react").JSX.Element;
//# sourceMappingURL=app-shell.d.ts.map