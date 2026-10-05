import { type ComparisonState, type PreviewExperience, type ThemeMode } from "../types";
type SyncKey = "page" | "scroll" | "data";
interface ComparisonCanvasProps {
    comparison: ComparisonState;
    readOnly: boolean;
    onSideChange: (side: "left" | "right", exp: Partial<PreviewExperience>) => void;
    onToggleSync: (key: SyncKey) => void;
    onRouteChange?: (route: string) => void;
    onReady?: () => void;
    on401?: () => void;
    onIframeReady?: (win: Window) => void;
    theme?: ThemeMode;
}
export declare function ComparisonCanvas({ comparison, readOnly, onSideChange, onToggleSync, onRouteChange, onReady, on401, onIframeReady, theme, }: ComparisonCanvasProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=comparison-canvas.d.ts.map