# Preview Hub 最小接入示例

这是一个**不依赖任何宿主业务**的最小接入示例。复制这个目录到你的 Next.js 项目里，按注释改路径即可跑通。

## 目录

```
example/
├── minimal-config.ts   # 最小配置：2 个角色 + 3 个页面 + 1 个环境 + App 载体
└── usage.tsx           # 怎么在你的 app 里挂载 PreviewHub
```

## 三步跑通

### 1. 安装

```bash
pnpm add @qiuwei-liao/preview-hub
```

### 2. 写配置（参考 `minimal-config.ts`）

定义你的页面、角色、环境，传入 `PreviewHubConfig`。

### 3. 挂载组件（参考 `usage.tsx`）

在你的 Next.js App Router 里加一个 `/preview` 路由：

```tsx
// app/preview/page.tsx
import { PreviewHub } from "@qiuwei-liao/preview-hub";
import { minimalConfig } from "./minimal-config";

export default function PreviewPage() {
  return <PreviewHub config={minimalConfig} />;
}
```

打开 `http://localhost:3000/preview`，即可看到多角色、多设备切换的预览工作台。

## 注意

- 本目录**不会被 build**，只是给接入方复制参考的模板。
- iframe 里加载的是你自己的页面，需要你的应用路由和配置里的 `route` 对得上。
