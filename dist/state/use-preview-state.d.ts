import type { ReactNode } from "react";
import type { DrawerType, Orientation, PreviewExperience, PreviewRole, PreviewState, PreviewSurface, ThemeMode, ColorFilterMode } from "../types";
interface PreviewStateContextValue {
    state: PreviewState;
    reloadKey: number;
    actions: PreviewActions;
}
declare function usePreviewStateInternal(): {
    state: PreviewState;
    reloadKey: number;
    actions: {
        setRole: (role: PreviewRole) => void;
        setSurface: (surface: PreviewSurface) => void;
        setDevice: (deviceId: string) => void;
        setPage: (pageId: string) => void;
        setOrientation: (orientation: Orientation) => void;
        setCustomDevice: (width: number, height: number) => void;
        enterComparison: () => void;
        exitComparison: () => void;
        setComparisonSide: (side: "left" | "right", exp: Partial<PreviewExperience>) => void;
        toggleComparisonSync: (key: "page" | "scroll" | "data") => void;
        openDrawer: (type: DrawerType) => void;
        closeDrawer: () => void;
        setTheme: (theme: ThemeMode) => void;
        setReadOnly: (readOnly: boolean) => void;
        setColorFilter: (colorFilter: ColorFilterMode) => void;
        setRoute: (route: string) => void;
        toggleFavorite: (pageId: string) => void;
        recordRecent: (pageId: string) => void;
        reload: () => void;
        rebuildSession: () => void;
    };
};
export type PreviewActions = ReturnType<typeof usePreviewStateInternal>["actions"];
export declare function PreviewStateProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function usePreviewState(): PreviewStateContextValue;
export {};
//# sourceMappingURL=use-preview-state.d.ts.map