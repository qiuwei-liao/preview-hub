import type { PreviewRole, PreviewSurface } from "../types";
export interface PreviewUrlParams {
    role?: PreviewRole;
    surface?: PreviewSurface;
    pageId?: string;
    deviceId?: string;
    route?: string;
}
/** 构建 Deep Link URL；previewRoutePath 默认为 "/preview" */
export declare function buildPreviewUrl(params: PreviewUrlParams, previewRoutePath?: string): string;
/** 解析 URL query（location.search）为 Partial state；兼容旧参数名 deviceId */
export declare function parsePreviewUrl(search: string): Partial<PreviewUrlParams>;
//# sourceMappingURL=url.d.ts.map