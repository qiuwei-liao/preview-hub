// Preview Hub — Page Registry 工厂
// 基于 config.pages 和 config.pageIdAliases 创建查询函数闭包。
export function createPageRegistry(pages, aliases) {
    function normalizePageId(id) {
        if (aliases && aliases[id])
            return aliases[id];
        return id;
    }
    function getPageById(id) {
        return pages.find((p) => p.id === normalizePageId(id));
    }
    function getPagesForSurface(surface, role) {
        return pages.filter((page) => {
            const hasRoute = surface === "web" ? Boolean(page.web)
                : surface === "mini_program" ? Boolean(page.miniProgram)
                    : Boolean(page.app);
            if (!hasRoute)
                return false;
            if (role && page.roles && !page.roles.includes(role))
                return false;
            return true;
        });
    }
    function getPageRoute(pageId, surface) {
        const page = getPageById(pageId);
        if (!page)
            return undefined;
        return surface === "web" ? page.web?.route
            : surface === "mini_program" ? page.miniProgram?.route
                : page.app?.route;
    }
    function getPageIdByRoute(route, surface, role) {
        const normalized = route.split("?")[0];
        return getPagesForSurface(surface, role).find((page) => {
            const surfaceRoute = surface === "web" ? page.web?.route
                : surface === "mini_program" ? page.miniProgram?.route
                    : page.app?.route;
            return surfaceRoute?.split("?")[0] === normalized;
        })?.id;
    }
    function getPageTitle(pageId) {
        return getPageById(pageId)?.title ?? pageId;
    }
    return {
        getPageById,
        getPagesForSurface,
        getPageRoute,
        getPageIdByRoute,
        normalizePageId,
        getPageTitle,
    };
}
//# sourceMappingURL=page.js.map