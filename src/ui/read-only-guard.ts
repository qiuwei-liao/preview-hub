// Preview Hub V1 — 只读保护工具（iframe 内侧）
// 在 iframe 内部拦截危险操作点击，弹出自定义确认层，防止误写入真实数据。
// 不使用 window.confirm（iframe 内可能被浏览器拦截），全部用 DOM 动态创建。

/** 危险操作关键词（按钮文本匹配） */
export const DANGEROUS_KEYWORDS = [
  "删除",
  "提交",
  "确认付款",
  "创建订单",
  "确认删除",
  "支付",
  "结算",
  "发货",
];

/** 向上查找最近的可交互元素（button / a / [role=button]） */
function findInteractiveElement(
  target: EventTarget | null,
): HTMLElement | null {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    if (
      el.tagName === "BUTTON" ||
      el.tagName === "A" ||
      el.getAttribute("role") === "button"
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

/** 判断一个点击事件的目标是否为危险操作按钮 */
export function isDangerousClick(target: EventTarget | null): boolean {
  const el = findInteractiveElement(target);
  if (!el) return false;
  const text = (el.textContent || "").trim();
  if (!text) return false;
  return DANGEROUS_KEYWORDS.some((kw) => text.includes(kw));
}

// ---- 内部状态 ----

let bypassNext = false;
let overlayEl: HTMLDivElement | null = null;
let clickHandler: ((event: MouseEvent) => void) | null = null;
let enabled = false;

/** 创建并显示自定义确认层 */
function showConfirmDialog(onContinue: () => void, onCancel: () => void): void {
  // 先清理可能存在的旧层
  removeOverlay();

  // 遮罩
  const mask = document.createElement("div");
  mask.style.cssText = [
    "position:fixed",
    "inset:0",
    "background:rgba(0,0,0,0.6)",
    "z-index:99999",
    "display:flex",
    "align-items:center",
    "justify-content:center",
  ].join(";");

  // 对话框
  const dialog = document.createElement("div");
  dialog.style.cssText = [
    "width:320px",
    "background:#1e1e24",
    "border-radius:12px",
    "padding:20px",
    "box-shadow:0 8px 32px rgba(0,0,0,0.4)",
  ].join(";");

  // 标题
  const title = document.createElement("div");
  title.style.cssText =
    "color:#fff;font-size:14px;font-weight:bold;margin-bottom:8px;";
  title.textContent = "预览保护";

  // 正文
  const body = document.createElement("div");
  body.style.cssText =
    "color:#999;font-size:12px;line-height:1.6;margin-bottom:16px;";
  body.textContent = "当前处于 Preview Hub，此操作将写入真实数据";

  // 按钮容器
  const btnRow = document.createElement("div");
  btnRow.style.cssText =
    "display:flex;gap:8px;justify-content:flex-end;";

  // 取消按钮
  const cancelBtn = document.createElement("button");
  cancelBtn.style.cssText = [
    "padding:6px 16px",
    "border-radius:6px",
    "border:none",
    "background:#3a3a42",
    "color:#ccc",
    "font-size:12px",
    "cursor:pointer",
  ].join(";");
  cancelBtn.textContent = "取消";
  cancelBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeOverlay();
    onCancel();
  });

  // 继续按钮
  const continueBtn = document.createElement("button");
  continueBtn.style.cssText = [
    "padding:6px 16px",
    "border-radius:6px",
    "border:none",
    "background:#e53e3e",
    "color:#fff",
    "font-size:12px",
    "cursor:pointer",
  ].join(";");
  continueBtn.textContent = "继续";
  continueBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeOverlay();
    onContinue();
  });

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(continueBtn);
  dialog.appendChild(title);
  dialog.appendChild(body);
  dialog.appendChild(btnRow);
  mask.appendChild(dialog);
  document.body.appendChild(mask);
  overlayEl = mask;
}

/** 移除确认层 */
function removeOverlay(): void {
  if (overlayEl && overlayEl.parentNode) {
    overlayEl.parentNode.removeChild(overlayEl);
  }
  overlayEl = null;
}

/**
 * 启用只读保护。
 * 在 document 上注册捕获阶段 click 监听，危险操作弹确认层。
 * @returns 取消函数（移除监听 + 清理确认层）
 */
export function enableReadOnlyGuard(): () => void {
  if (enabled) return () => disableReadOnlyGuard();
  enabled = true;
  bypassNext = false;

  clickHandler = (event: MouseEvent) => {
    // 一次性放行：用户在确认层点了「继续」后重发的点击
    if (bypassNext) {
      bypassNext = false;
      return;
    }

    if (isDangerousClick(event.target)) {
      event.preventDefault();
      event.stopPropagation();

      const originalTarget = event.target as HTMLElement;
      showConfirmDialog(
        // onContinue：放行原点击
        () => {
          bypassNext = true;
          // 重新派发一次点击事件到原目标
          const rect = originalTarget.getBoundingClientRect();
          const clickEvt = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
          });
          originalTarget.dispatchEvent(clickEvt);
        },
        // onCancel：什么都不做
        () => {},
      );
    }
  };

  document.addEventListener("click", clickHandler, true);

  return () => disableReadOnlyGuard();
}

/** 禁用只读保护：移除监听并清理确认层 */
export function disableReadOnlyGuard(): void {
  if (!enabled) return;
  enabled = false;

  if (clickHandler) {
    document.removeEventListener("click", clickHandler, true);
    clickHandler = null;
  }

  removeOverlay();
  bypassNext = false;
}
