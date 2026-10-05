import type { MiniProgramNavEntry, MiniProgramNavigationState, PageDef } from "../types";
/** 从导航栈中取当前页面条目（纯函数，无需工厂） */
export declare function getCurrentPage(state: MiniProgramNavigationState): MiniProgramNavEntry;
/** 栈深 > 1 时可返回（纯函数，无需工厂） */
export declare function canGoBack(state: MiniProgramNavigationState): boolean;
export interface MiniProgramNavigator {
    isTabPage: (pageId: string) => boolean;
    createNavigation: (initialPage: PageDef, initialRoute?: string) => MiniProgramNavigationState;
    navigateTo: (state: MiniProgramNavigationState, page: PageDef) => MiniProgramNavigationState;
    navigateBack: (state: MiniProgramNavigationState) => MiniProgramNavigationState;
    switchTab: (state: MiniProgramNavigationState, pageId: string) => MiniProgramNavigationState;
}
export declare function createMiniProgramNavigator(tabbarPageIds: ReadonlySet<string>, getPageById: (id: string) => PageDef | undefined): MiniProgramNavigator;
//# sourceMappingURL=mini-program-navigation.d.ts.map