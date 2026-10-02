# Contributing to Preview Hub

感谢你对 Preview Hub 的兴趣。这是一个**独立、可复用、零业务依赖**的开源预览工作台。

## 开发环境

```bash
# 在仓库根目录
pnpm install
pnpm --filter @preview-hub/core typecheck
pnpm --filter @preview-hub/core build
```

在宿主应用里联调：

```bash
pnpm dev:web   # 打开 /preview 路由
```

## 代码约定

- **零业务依赖**：`src/` 内**禁止** import 任何宿主业务代码。所有业务差异通过 `PreviewHubConfig` 从外部注入。
- **目录即职责**：
  - `components/` — 顶层组合组件（`PreviewHub`、`PreviewHubContent`）
  - `config/` — 配置类型、Provider、默认值
  - `renderer/` — iframe / 小程序渲染器
  - `state/` — URL / 存储 / 状态 hook（纯逻辑，可单测）
  - `registry/` — 页面与设备注册表工厂
  - `session/` — 会话与身份
  - `ui/` — 通用 UI 组件（不包含业务）
  - `hooks/` — 通用 React hooks
  - `utils/` — 纯函数工具
- **测试**：纯逻辑模块（state/url、state/resolver、renderer/bus）必须配 `*.test.ts`，放在同目录 `__tests__/` 下。
- **类型**：对外导出类型必须从 `src/index.ts` 统一出口，不要让外部深路径 import。

## 发版流程

1. 更新 `CHANGELOG.md`
2. `npm version patch|minor|major`
3. `npm publish --access public`
4. 版本由独立仓库维护，宿主项目通过 npm / workspace 依赖引用。

## 提交信息

沿用仓库中文 conventional commits：`feat: / fix: / refactor: / docs:`。
