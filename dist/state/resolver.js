// Preview Hub — Resolver：Experience 合法性校验与自动降级
// 所有维度校验集中在此文件，不散布在组件中。
// 依赖通过 registries 参数注入，不直接 import 模块级注册表。
// ─── Surface × Device 合法性 ───
export function isValidSurfaceDevice(surface, device) {
    if (surface === "mini_program")
        return device.family === "mobile";
    if (surface === "app")
        return device.family === "mobile" || device.family === "tablet";
    return true; // web 允许 mobile / tablet / desktop
}
export function getDefaultDeviceForSurface(surface, devices) {
    // mini_program 仅 mobile；app 优先 mobile；web 取设备列表第一个
    if (surface === "mini_program" || surface === "app") {
        return devices.getDevicesForSurface(surface)[0] ?? devices.list()[0];
    }
    return devices.list()[0];
}
// ─── Page × Surface 路由 ───
export function getPageRoute(pageId, surface, pages) {
    const page = pages.getPageById(pageId);
    if (!page)
        return undefined;
    return surface === "web" ? page.web?.route
        : surface === "mini_program" ? page.miniProgram?.route
            : page.app?.route;
}
// ─── Role × Surface 合法性 ───
/** role 是否支持某 surface：通过该 role 在该 surface 下是否有可用页面判断 */
function roleSupportsSurface(role, surface, pages) {
    if (surface === "web")
        return true;
    // mini_program / app：该 role 下在该载体有页面才支持
    return pages.getPagesForSurface(surface, role).length > 0;
}
function pageSupportsRole(pageId, surface, role, pages) {
    return pages
        .getPagesForSurface(surface, role)
        .some((page) => page.id === pageId);
}
function routeMatchesPage(route, pageRoute) {
    if (!pageRoute)
        return false;
    return route.split("?")[0] === pageRoute.split("?")[0];
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
export function resolvePreviewExperience(input, defaults, registries) {
    const { pages, devices } = registries;
    // 1. 合并 role / surface（input 优先于 defaults）
    const role = input.role ?? defaults?.role ?? "";
    let surface = input.surface ?? defaults?.surface ?? "web";
    // 2. role 不支持 surface → 降级 web
    if (!roleSupportsSurface(role, surface, pages)) {
        surface = "web";
    }
    // 3. 解析设备
    let device = (input.deviceId ? devices.getDeviceById(input.deviceId) : undefined) ??
        defaults?.device ??
        getDefaultDeviceForSurface(surface, devices);
    // 4. surface × device 合法性修正
    if (!isValidSurfaceDevice(surface, device)) {
        device = getDefaultDeviceForSurface(surface, devices);
    }
    // 5. 解析页面
    let pageId = pages.normalizePageId(input.pageId ?? defaults?.page?.pageId ?? "") ||
        undefined;
    // 关键：若 pageId 来自 input（即调用方明确指定了页面），即使未传 route，
    // 也不能沿用 defaults 的旧 route——必须从 registry 重新解析。
    let route = input.route ?? (input.pageId ? undefined : defaults?.page?.route);
    // 只有 route 的深链或历史状态也必须恢复正确的业务标题
    if (!input.pageId && route) {
        pageId =
            pages.getPageIdByRoute(route, surface, role) ??
                pages.getPageIdByRoute(route, "web", role) ??
                pageId;
    }
    // 如果 pageId 在当前 surface 无 route，降级到第一个可用页面
    if (pageId && (!getPageRoute(pageId, surface, pages) || !pageSupportsRole(pageId, surface, role, pages))) {
        pageId = undefined;
        route = undefined;
    }
    // 无有效 pageId → 取该 surface + role 第一个可用页面
    if (!pageId) {
        const fallback = pages.getPagesForSurface(surface, role)[0];
        pageId = fallback?.id ?? "";
        route = getPageRoute(pageId, surface, pages) ?? fallback?.web?.route ?? "/";
    }
    else {
        // pageId 是稳定业务语义，route 只是当前 Surface 的投影。
        const canonicalRoute = getPageRoute(pageId, surface, pages);
        route =
            canonicalRoute && (!route || !routeMatchesPage(route, canonicalRoute))
                ? canonicalRoute
                : route ?? canonicalRoute ?? "/";
    }
    // 6. 方向
    const orientation = device.rotatable
        ? input.orientation ?? defaults?.device?.orientation ?? device.orientation
        : device.orientation;
    return {
        role,
        surface,
        device: { ...device, orientation },
        page: { pageId, route },
    };
}
//# sourceMappingURL=resolver.js.map