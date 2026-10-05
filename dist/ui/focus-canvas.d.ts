import type { PreviewExperience, ThemeMode } from "../types";
import { type SurfaceRendererProps } from "../renderer/web-renderer";
interface FocusCanvasProps extends SurfaceRendererProps {
    experience: PreviewExperience;
    theme?: ThemeMode;
}
export declare function FocusCanvas({ experience, theme, ...rest }: FocusCanvasProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=focus-canvas.d.ts.map