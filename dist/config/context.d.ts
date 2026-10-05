import type { ReactNode } from "react";
import type { PreviewHubConfig } from "./types";
export interface PreviewHubProviderProps {
    config: PreviewHubConfig;
    children: ReactNode;
}
export declare function PreviewHubProvider({ config, children }: PreviewHubProviderProps): import("react").JSX.Element;
export declare function usePreviewHubConfig(): PreviewHubConfig;
//# sourceMappingURL=context.d.ts.map