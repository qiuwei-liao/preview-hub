"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { PreviewHubProvider } from "../config/context";
import { PreviewStateProvider } from "../state/use-preview-state";
import { PreviewHubContent } from "./PreviewHubContent";
export function PreviewHub({ config, className, style }) {
    return (_jsx(PreviewHubProvider, { config: config, children: _jsx(PreviewStateProvider, { children: _jsx(PreviewHubContent, { className: className, style: style }) }) }));
}
//# sourceMappingURL=PreviewHub.js.map