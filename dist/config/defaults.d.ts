import type { PreviewDevice, PreviewState } from "../types";
import type { PreviewHubConfig } from "./types";
export declare const DEFAULT_DEVICES: PreviewDevice[];
export interface ThemeTokens {
    bg: string;
    bgGrad: string;
    bar: string;
    barBorder: string;
    text: string;
    sub: string;
    btnText: string;
    btnTextHover: string;
    chipBg: string;
    chipBorder: string;
    frameBorder: string;
    frameShadow: string;
    urlText: string;
    scrollbar: string;
}
export declare const darkTheme: ThemeTokens;
export declare const lightTheme: ThemeTokens;
export declare const THEMES: Record<"light" | "dark" | "system", ThemeTokens>;
export declare function getTheme(theme: "light" | "dark" | "system"): ThemeTokens;
/**
 * 基于 config 生成默认 PreviewState。
 * - 默认 role 取 config.roles[0].id
 * - 默认 page 取 config.pages[0]
 * - 默认 device 取 DEFAULT_DEVICES[0]（或 config.devices[0]）
 * - 其余字段从 config.defaultState 覆盖
 */
export declare function createDefaultState(config: PreviewHubConfig): PreviewState;
//# sourceMappingURL=defaults.d.ts.map