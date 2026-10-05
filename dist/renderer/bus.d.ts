import type { PreviewMessage } from "../types";
export declare const PREVIEW_MESSAGE_TARGET = "*";
/** 在 iframe 内调用：向 hub 父窗口发消息 */
export declare function sendToHub(msg: PreviewMessage): void;
/** 在 hub 内调用：向指定 iframe 窗口发消息 */
export declare function sendToIframe(win: Window, msg: PreviewMessage): void;
/** 类型守卫：判断 data 是否为合法的 preview 消息 */
export declare function isPreviewMessage(data: unknown): data is PreviewMessage;
/**
 * 注册 window message 监听，只处理通过 isPreviewMessage 校验的消息。
 * 返回取消监听函数。
 */
export declare function listenPreviewMessages(handler: (msg: PreviewMessage, source: Window | null) => void): () => void;
//# sourceMappingURL=bus.d.ts.map