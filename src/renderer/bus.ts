// Preview Hub — postMessage 通信工具
// iframe（被预览页面）↔ hub（Preview Hub 页面）双向通信。

import type { PreviewMessage } from "../types";

export const PREVIEW_MESSAGE_TARGET = "*";

/** 在 iframe 内调用：向 hub 父窗口发消息 */
export function sendToHub(msg: PreviewMessage): void {
  if (typeof window === "undefined") return;
  if (window.parent === window) return; // 不在 iframe 中
  window.parent.postMessage(msg, PREVIEW_MESSAGE_TARGET);
}

/** 在 hub 内调用：向指定 iframe 窗口发消息 */
export function sendToIframe(win: Window, msg: PreviewMessage): void {
  win.postMessage(msg, PREVIEW_MESSAGE_TARGET);
}

/** 类型守卫：判断 data 是否为合法的 preview 消息 */
export function isPreviewMessage(data: unknown): data is PreviewMessage {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.type !== "string") return false;
  return obj.type.startsWith("preview:");
}

/**
 * 注册 window message 监听，只处理通过 isPreviewMessage 校验的消息。
 * 返回取消监听函数。
 */
export function listenPreviewMessages(
  handler: (msg: PreviewMessage, source: Window | null) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = (event: MessageEvent) => {
    const data = event.data;
    if (!isPreviewMessage(data)) return;
    handler(data, event.source as Window | null);
  };

  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
