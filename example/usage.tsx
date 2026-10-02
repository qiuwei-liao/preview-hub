// 在你的 Next.js App Router 里挂载 PreviewHub
// 文件位置：app/preview/page.tsx

"use client";

import { PreviewHub } from "@preview-hub/core";
import { minimalConfig } from "./minimal-config";

export default function PreviewPage() {
  // 整个工作台就这一行：传入配置即可
  return <PreviewHub config={minimalConfig} />;
}

// 可选：如果你的应用需要登录态，用 PreviewHubProvider 包裹根布局
// 并传入你自己的 AuthAdapter（见 README 5.3 节）
