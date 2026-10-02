// Preview Hub — Page Registry 工厂
// 基于 config.pages 和 config.pageIdAliases 创建查询函数闭包。

import type {
  PageDef,
  PreviewRole,
  PreviewSurface,
} from "../types";

export interface PageRegistry {
  getPageById: (id: string) => PageDef | undefined;
  getPagesForSurface: (surface: PreviewSurface, role?: PreviewRole) => PageDef[];
  getPageRoute: (pageId: string, surface: PreviewSurface) => string | undefined;
  getPageIdByRoute: (
    route: string,
    surface: PreviewSurface,
    role?: PreviewRole,
  ) => string | undefined;
  normalizePageId: (id: string) => string;
  getPageTitle: (pageId: string) => string;
}

export function createPageRegistry(
  pages: PageDef[],
  aliases?: Record<string, string>,
): PageRegistry {
  function normalizePageId(id: string): string {
    if (aliases && aliases[id]) return aliases[id];
    return id;
  }

  function getPageById(id: string): PageDef | undefined {
    return pages.find((p) => p.id === normalizePageId(id));
  }

  function getPagesForSurface(
    surface: PreviewSurface,
    role?: PreviewRole,
  ): PageDef[] {
    return pages.filter((page) => {
      const hasRoute =
        surface === "web" ? Boolean(page.web) : Boolean(page.miniProgram);
      if (!hasRoute) return false;
      if (role && page.roles && !page.roles.includes(role)) return false;
      return true;
    });
  }

  function getPageRoute(
    pageId: string,
    surface: PreviewSurface,
  ): string | undefined {
    const page = getPageById(pageId);
    if (!page) return undefined;
    return surface === "mini_program" ? page.miniProgram?.route : page.web?.route;
  }

  function getPageIdByRoute(
    route: string,
    surface: PreviewSurface,
    role?: PreviewRole,
  ): string | undefined {
    const normalized = route.split("?")[0];
    return getPagesForSurface(surface, role).find((page) => {
      const surfaceRoute =
        surface === "web" ? page.web?.route : page.miniProgram?.route;
      return surfaceRoute?.split("?")[0] === normalized;
    })?.id;
  }

  function getPageTitle(pageId: string): string {
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
