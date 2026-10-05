import type { PageRegistry } from "../registry/page";
import type { DeviceRegistry } from "../registry/device";
import type { Orientation, PreviewDevice, PreviewExperience, PreviewRole, PreviewSurface } from "../types";
/** Resolver 所需的注册表集合（由调用方创建并传入） */
export interface ResolverRegistries {
    pages: PageRegistry;
    devices: DeviceRegistry;
}
export declare function isValidSurfaceDevice(surface: PreviewSurface, device: PreviewDevice): boolean;
export declare function getDefaultDeviceForSurface(surface: PreviewSurface, devices: DeviceRegistry): PreviewDevice;
export declare function getPageRoute(pageId: string, surface: PreviewSurface, pages: PageRegistry): string | undefined;
export interface ResolveInput {
    role?: PreviewRole;
    surface?: PreviewSurface;
    deviceId?: string;
    pageId?: string;
    route?: string;
    orientation?: Orientation;
}
/**
 * 按优先级解析 Experience：
 * 1. 显式传入（Deep Link / 业务页面）
 * 2. defaults（上次状态 / lastRouteByRole）
 * 3. 系统默认值
 *
 * 自动修正非法组合：
 * - mini_program + desktop/tablet → 降级 mobile 默认设备
 * - pageId 在当前 surface 无 route → 降级该 surface 第一个可用页面
 * - role 不支持 surface → surface 降级 web
 */
export declare function resolvePreviewExperience(input: ResolveInput, defaults: Partial<PreviewExperience> | undefined, registries: ResolverRegistries): PreviewExperience;
//# sourceMappingURL=resolver.d.ts.map