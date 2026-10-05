import type { PreviewActions } from "../state/use-preview-state";
import type { PreviewState } from "../types";
/** 命令面板开关事件：CommandPalette 监听此事件实现 ⌘K 联动 */
export declare const COMMAND_PALETTE_EVENT = "preview:toggle-command-palette";
export declare function useKeyboardShortcuts(actions: PreviewActions, state: PreviewState): void;
//# sourceMappingURL=use-keyboard-shortcuts.d.ts.map