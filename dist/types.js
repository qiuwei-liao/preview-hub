// Preview Hub 2.0 — 核心类型定义
// 四维模型：Role / Surface / Device / Page 严格分离。
// 所有状态、Resolver、Registry、Renderer、UI 组件共享此契约。
export const SURFACE_LABELS = {
    web: "Web",
    mini_program: "小程序",
    app: "App",
};
/** Surface 允许的设备族 */
export const SURFACE_DEVICE_FAMILIES = {
    web: ["mobile", "tablet", "desktop"],
    mini_program: ["mobile"],
    app: ["mobile", "tablet"],
};
export const COLOR_FILTERS = {
    normal: { label: "正常", css: "none" },
    grayscale: { label: "灰度", css: "grayscale(100%)" },
    "high-contrast": { label: "高对比度", css: "contrast(1.5) saturate(1.3)" },
    invert: { label: "反色", css: "invert(1) hue-rotate(180deg)" },
    protanopia: { label: "红色盲", css: "sepia(0.35) hue-rotate(-25deg) saturate(0.75) contrast(1.05)" },
    deuteranopia: { label: "绿色盲", css: "sepia(0.25) hue-rotate(35deg) saturate(0.7) contrast(1.05)" },
};
//# sourceMappingURL=types.js.map