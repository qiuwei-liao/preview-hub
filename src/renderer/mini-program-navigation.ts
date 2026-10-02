// Preview Hub — 小程序独立导航栈（纯逻辑，无 UI）
// 小程序不是简单的 iframe src 替换：wx.navigateTo / navigateBack / switchTab
// 有独立的页面栈语义。本模块用不可变更新模拟该栈。
//
// 通过 createMiniProgramNavigator 工厂注入 tabbar 配置和页面查询函数。
// getCurrentPage / canGoBack 为纯函数，可独立使用。

import type {
  MiniProgramNavEntry,
  MiniProgramNavigationState,
  PageDef,
} from "../types";

// ─── 纯辅助函数（不依赖工厂注入，可独立使用） ───

/** PageDef → 导航栈条目。iframe 始终加载同源 Web 页面，故取 web.route。 */
function entryFromPage(page: PageDef): MiniProgramNavEntry {
  return {
    pageId: page.id,
    route: page.web?.route ?? page.miniProgram?.route ?? "",
    title: page.title,
  };
}

/** 从导航栈中取当前页面条目（纯函数，无需工厂） */
export function getCurrentPage(
  state: MiniProgramNavigationState,
): MiniProgramNavEntry {
  return state.stack[state.currentIndex] ?? state.stack[0];
}

/** 栈深 > 1 时可返回（纯函数，无需工厂） */
export function canGoBack(state: MiniProgramNavigationState): boolean {
  return state.currentIndex > 0;
}

// ─── 工厂接口 ───

export interface MiniProgramNavigator {
  isTabPage: (pageId: string) => boolean;
  createNavigation: (
    initialPage: PageDef,
    initialRoute?: string,
  ) => MiniProgramNavigationState;
  navigateTo: (
    state: MiniProgramNavigationState,
    page: PageDef,
  ) => MiniProgramNavigationState;
  navigateBack: (
    state: MiniProgramNavigationState,
  ) => MiniProgramNavigationState;
  switchTab: (
    state: MiniProgramNavigationState,
    pageId: string,
  ) => MiniProgramNavigationState;
}

export function createMiniProgramNavigator(
  tabbarPageIds: ReadonlySet<string>,
  getPageById: (id: string) => PageDef | undefined,
): MiniProgramNavigator {
  function isTabPage(pageId: string): boolean {
    return tabbarPageIds.has(pageId);
  }

  function createNavigation(
    initialPage: PageDef,
    initialRoute?: string,
  ): MiniProgramNavigationState {
    const entry = entryFromPage(initialPage);
    if (initialRoute && !initialRoute.startsWith("/pages/")) entry.route = initialRoute;
    return { stack: [entry], currentIndex: 0 };
  }

  function navigateTo(
    state: MiniProgramNavigationState,
    page: PageDef,
  ): MiniProgramNavigationState {
    const stack = [
      ...state.stack.slice(0, state.currentIndex + 1),
      entryFromPage(page),
    ];
    return { stack, currentIndex: stack.length - 1 };
  }

  function navigateBack(
    state: MiniProgramNavigationState,
  ): MiniProgramNavigationState {
    if (state.currentIndex <= 0) return state;
    const stack = state.stack.slice(0, -1);
    return { stack, currentIndex: stack.length - 1 };
  }

  function switchTab(
    state: MiniProgramNavigationState,
    pageId: string,
  ): MiniProgramNavigationState {
    const existing = state.stack.find((entry) => entry.pageId === pageId);
    if (existing) return { stack: [existing], currentIndex: 0 };
    const page = getPageById(pageId);
    if (!page) return state;
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
