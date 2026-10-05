import type { PageDef, PreviewRole, PreviewSurface } from "../types";
export interface PageRegistry {
    getPageById: (id: string) => PageDef | undefined;
    getPagesForSurface: (surface: PreviewSurface, role?: PreviewRole) => PageDef[];
    getPageRoute: (pageId: string, surface: PreviewSurface) => string | undefined;
    getPageIdByRoute: (route: string, surface: PreviewSurface, role?: PreviewRole) => string | undefined;
    normalizePageId: (id: string) => string;
    getPageTitle: (pageId: string) => string;
}
export declare function createPageRegistry(pages: PageDef[], aliases?: Record<string, string>): PageRegistry;
//# sourceMappingURL=page.d.ts.map