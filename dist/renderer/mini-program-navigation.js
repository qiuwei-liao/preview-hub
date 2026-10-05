// Preview Hub — 小程序独立导航栈（纯逻辑，无 UI）
// 小程序不是简单的 iframe src 替换：wx.navigateTo / navigateBack / switchTab
// 有独立的页面栈语义。本模块用不可变更新模拟该栈。
//
// 通过 createMiniProgramNavigator 工厂注入 tabbar 配置和页面查询函数。
// getCurrentPage / canGoBack 为纯函数，可独立使用。
// ─── 纯辅助函数（不依赖工厂注入，可独立使用） ───
/** PageDef → 导航栈条目。iframe 始终加载同源 Web 页面，故取 web.route。 */
function entryFromPage(page) {
    return {
        pageId: page.id,
        route: page.web?.route ?? page.miniProgram?.route ?? "",
        title: page.title,
    };
}
/** 从导航栈中取当前页面条目（纯函数，无需工厂） */
export function getCurrentPage(state) {
    return state.stack[state.currentIndex] ?? state.stack[0];
}
/** 栈深 > 1 时可返回（纯函数，无需工厂） */
export function canGoBack(state) {
    return state.currentIndex > 0;
}
export function createMiniProgramNavigator(tabbarPageIds, getPageById) {
    function isTabPage(pageId) {
        return tabbarPageIds.has(pageId);
    }
    function createNavigation(initialPage, initialRoute) {
        const entry = entryFromPage(initialPage);
        if (initialRoute && !initialRoute.startsWith("/pages/"))
            entry.route = initialRoute;
        return { stack: [entry], currentIndex: 0 };
    }
    function navigateTo(state, page) {
        const stack = [
            ...state.stack.slice(0, state.currentIndex + 1),
            entryFromPage(page),
        ];
        return { stack, currentIndex: stack.length - 1 };
    }
    function navigateBack(state) {
        if (state.currentIndex <= 0)
            return state;
        const stack = state.stack.slice(0, -1);
        return { stack, currentIndex: stack.length - 1 };
    }
    function switchTab(state, pageId) {
        const existing = state.stack.find((entry) => entry.pageId === pageId);
        if (existing)
            return { stack: [existing], currentIndex: 0 };
        const page = getPageById(pageId);
        if (!page)
            return state;
        return { stack: [entryFromPage(page)], currentIndex: 0 };
    }
    return {
        isTabPage,
        createNavigation,
        navigateTo,
        navigateBack,
        switchTab,
    };
}
//# sourceMappingURL=mini-program-navigation.js.map