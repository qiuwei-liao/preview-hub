import type { SessionDisplayInfo } from "./auth-adapter";
import type { IdentitySpec } from "../types";
export declare function usePreviewSession(): {
    sessionInfo: SessionDisplayInfo;
    isLoggingIn: boolean;
    loginError: string | null;
    loginAs: (identity: IdentitySpec) => Promise<SessionDisplayInfo>;
    refreshInfo: () => void;
};
//# sourceMappingURL=use-preview-session.d.ts.map