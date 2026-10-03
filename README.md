# Preview Hub

> 多角色 · 多设备 · 多载体的页面预览工作台，以可配置方式接入任意 React / Next.js 项目。

![license](https://img.shields.io/badge/license-MIT-blue)
![status](https://img.shields.io/badge/status-beta-orange)

**独立开源项目**：本包零业务依赖，可独立接入任意宿主项目使用。业务接入方式见下方快速开始，[`example/`](./example/) 提供最小可复制模板。贡献流程见 [CONTRIBUTING.md](./CONTRIBUTING.md)，版本记录见 [CHANGELOG.md](./CHANGELOG.md)。

---

## 目录

1. [项目简介](#1-项目简介)
2. [架构说明](#2-架构说明)
3. [快速开始](#3-快速开始)
4. [配置项参考](#4-配置项参考)
5. [接入示例](#5-接入示例)
6. [API 参考](#6-api-参考)
7. [目录结构](#7-目录结构)
8. [已知边界](#8-已知边界)
9. [开源许可](#9-开源许可)

---

## 1. 项目简介

**Preview Hub** 是一个面向前端团队的页面预览工作台（Preview Workbench）。它把"我现在要以哪个身份、在哪种设备上、在哪种载体里、看哪个页面"这四个维度的切换，收敛到一个统一的工作台界面里，让开发者在开发联调阶段不必反复手工改代码、切账号、改 User-Agent。

### 它解决什么问题

在多角色、多端、多载体的业务系统里，开发者经常遇到这些痛点：

- **切身份靠手动登录登出**：要从 C 端用户切到商家视角，得退出当前账号、重新输手机号验证码，再切租户——一次切换几分钟。
- **多设备预览要开多个浏览器窗口**：要看 iPhone 上的效果，得开 Chrome DevTools 切 Device Toolbar；要看 Pad，又得调另一套尺寸。
- **Web 与小程序两套壳**：小程序里有胶囊按钮、有 tabbar、有导航栈，Web 里没有，靠人肉脑内模拟经常漏 UI。
- **预览时误点了"提交订单""删除商品"**：在预览环境里触发真实写操作，污染数据甚至误操作线上。

Preview Hub 把以上四件事做成一个工作台：

- **横排切换角色 / 载体**，一键在 C 端 / B 端 / 平台视角之间切换，触发对应身份的真实登录。
- **浮层选择设备 / 页面**，内置十余款主流手机 / Pad / 桌面尺寸，点击即换壳。
- **iframe 内嵌真实页面**，通过 postMessage 与被预览页面通信，路由变化、401、只读状态全部双向同步。
- **只读保护**：在只读模式下，iframe 内侧自动拦截危险操作点击，弹出自定义确认层，防止误写。

### 核心特性

- **四维预览模型**：角色（Role）× 载体（Surface）× 设备（Device）× 页面（Page）组合成一次完整的预览体验（PreviewExperience）。
- **真实登录与会话管理**：通过可注入的 `AuthAdapter` 适配任意业务的登录体系，支持 401 自动重建会话。
- **iframe 同源通信协议**：`preview:ready` / `preview:route-changed` / `preview:401` / `preview:set-readonly` 等消息类型，被预览页面只需接入轻量桥接即可。
- **只读保护**：在 iframe 内侧通过 DOM 事件拦截危险按钮点击，配合自定义确认层，零业务侵入。
- **双画布模式**：focus 单页聚焦 / comparison 双栏对比，支持并排预览不同角色或不同页面。
- **⌘K 命令面板 + 快捷键**：⌘K 唤起命令面板，⌘1-3 快速切换角色。
- **主题与持久化**：深 / 浅 / 跟随系统三档主题；个人偏好（最近选的角色、设备、页面、只读开关）写入 localStorage，刷新不丢。
- **零业务依赖**：包内不硬编码任何业务数据（角色名、路由、手机号、文案），全部通过 `PreviewHubConfig` 注入。

---

## 2. 架构说明

### 2.1 四维预览模型

Preview Hub 的核心是把"一次预览"抽象成四个正交维度的组合，最终落到一个 **PreviewExperience** 对象上。

| 维度 | 含义 | 取值来源 |
|---|---|---|
| **Role（角色）** | 当前以哪种身份视角预览，例如 C 端用户、商家、平台管理员。决定了登录身份、可见页面集、默认路由。 | `config.roles`，接入方定义；包内不预设任何角色。 |
| **Surface（载体）** | 被预览页面跑在哪种壳里。当前支持 `web`（裸浏览器）、`mini_program`（小程序壳模拟）与 `app`（iOS 原生 App 壳模拟）。 | 固定联合 `"web" \| "mini_program" \| "app"`，新增载体需新增渲染器。 |
| **Device（设备）** | 视口尺寸与设备族（phone / pad / desktop），决定 iframe 外层壳的宽高、安全区、状态栏样式。 | 内置 10 款主流设备，可通过 `config.devices` 覆盖或追加。 |
| **Page（页面）** | 当前预览的具体页面，带路由路径、源文件位置、适用载体等元信息。 | `config.pages`，接入方注册。 |

四个维度组合后即得到一次完整预览：

```ts
interface PreviewExperience {
  role: PreviewRole;          // string
  surface: PreviewSurface;    // "web" | "mini_program" | "app"
  deviceId: string;
  pageId: string;
}
```

切换任一维度时，**resolver** 会校验该组合是否合法（例如某页面只在 mini_program 下可用、某角色没有某设备），不合法时自动降级到最近的合法组合。

### 2.2 iframe 同源通信机制

Preview Hub 工作台本身和被预览页面跑在同一个 Origin 下（默认），中间通过 `<iframe>` 隔离，两边用 **`window.postMessage`** 通信。

消息总线位于 `renderer/bus.ts`，对外暴露三个工具函数：

- `sendToIframe(iframe, message)` —— 工作台 → 被预览页面。
- `sendToHub(message)` —— 被预览页面 → 工作台。
- `listenPreviewMessages(handler)` —— 在任一侧监听双向消息。

主要消息类型（`PreviewMessageType`）：

| 消息类型 | 方向 | 载荷 | 用途 |
|---|---|---|---|
| `preview:ready` | iframe → hub | `{ pathname }` | 被预览页面挂载完成，上报当前路由。 |
| `preview:route-changed` | iframe → hub | `{ pathname }` | 被预览页面内部路由跳转，工作台同步更新页面定位条。 |
| `preview:401` | iframe → hub | — | 被预览页面检测到未登录 / 会话过期，工作台触发登录重建流程。 |
| `preview:set-readonly` | hub → iframe | `{ readonly: boolean }` | 工作台切换只读开关，iframe 内侧据此启用 / 关闭危险操作拦截。 |
| `preview:navigate` | hub → iframe | `{ pathname }` | 工作台切换页面，命令 iframe 跳转到目标路由。 |

> 跨域预览时，`config.iframeBaseUrl` 填入目标 Origin，postMessage 会自动带上 targetOrigin；被预览页面需要在自己一侧接入对应的 Preview Bridge（通常是一个薄组件，调用 `sendToHub` / `listenPreviewMessages`）。

### 2.3 只读保护机制

只读保护分两层：

1. **工作台侧（hub）**：用户点击只读开关后，工作台通过 `preview:set-readonly` 消息把状态推给 iframe，同时本地状态持久化到 localStorage。
2. **iframe 内侧（被预览页面）**：由 `enableReadOnlyGuard()` 安装一个全局 DOM 拦截器——在捕获阶段拦截 `click` 事件，命中"危险元素"（按钮 / 表单提交 / 链接到写操作路由等）时阻止默认行为与冒泡，并弹出一层自定义确认遮罩，提示"当前为只读预览，操作已被拦截"。

这套机制是**纯 DOM** 的，不依赖任何业务框架；被预览页面只需在挂载时调用一次 `enableReadOnlyGuard()`，在卸载时调用 `disableReadOnlyGuard()`。它与业务代码完全解耦。

### 2.4 配置注入架构

包内所有组件都不直接 import 业务数据，而是通过 **React Context** 拿到配置。整体组件层级如下：

```
<PreviewHub config={...} />                  ← 对外主组件，一行接入
  └── <PreviewHubProvider value={config}>    ← 注入配置，所有后代 usePreviewHubConfig() 可读
        └── <PreviewStateProvider>           ← 预览状态（role/surface/device/page/theme/...）
              ├── <PreviewHeader />          ← 顶栏：角色 / 载体分段切换
              ├── <SurfaceSwitcher />       ← 载体切换
              ├── <RoleSwitcher />           ← 角色切换
              ├── <DeviceSwitcher />         ← 设备浮层
              ├── <RouteSwitcher />          ← 页面浮层
              ├── <PageLocator />            ← 路由 + 源文件 + 复制
              ├── <PreviewActions />         ← 只读开关 / 登录 / 环境
              ├── <CommandPalette />         ← ⌘K 命令面板
              ├── <SettingsDrawer />        ← 主题 / 环境
              ├── <FocusCanvas />            ← 单页聚焦画布
              ├── <ComparisonCanvas />       ← 双栏对比画布
              ├── <WebRenderer />            ← Web 渲染器（设备壳 + iframe）
              ├── <MiniProgramRenderer />    ← 小程序渲染器（壳 + iframe + 导航栈）
              └── <AppRenderer />            ← App 渲染器（iOS 原生壳 + iframe + TabBar）
```

设计要点：

- **Provider + Context** 而非 props 层层透传：包内有 17+ 个交互组件，逐组件传 props 会变成灾难。
- **`PreviewHub` 自包含**：外部只需要 `<PreviewHub config={...} />` 一行，Provider、State、Content 全部内部组装。
- **高级用户可单独使用 Provider**：在 PreviewHub 组件外部（例如业务侧的"移动端预览"入口按钮），也可以用 `PreviewHubProvider` + `usePreviewHubConfig()` 读取同一份配置。
- **零业务依赖红线**：包内任何文件不得出现 `@/` 路径别名 import，不得 import 业务 auth / session / api 模块，不得硬编码业务数据。

### 2.5 会话与登录

登录流程由 `AuthAdapter` 接口抽象，包内只负责编排（切换角色 → 调用 adapter.login → 刷新 UI → 通知 iframe），真正的登录实现（调用哪个后端、怎么存 token、怎么切租户）全部由接入方在 `config.authAdapter` 里实现。

`NoopAuthAdapter` 是包内置的空实现（未登录、不触发任何请求），用于接入方尚未实现登录时的兜底。

---

## 3. 快速开始

### 3.1 安装

Preview Hub 发布为 `@qiuwei-liao/preview-hub`，要求 React ≥ 19；Next.js ≥ 14 为可选 peerDependency（仅当你在 Next.js 项目中使用时需要）。

```bash
# pnpm
pnpm add @qiuwei-liao/preview-hub

# npm
npm install @qiuwei-liao/preview-hub

# yarn
yarn add @qiuwei-liao/preview-hub
```

### 3.2 最小接入示例（Next.js App Router）

最小可用的 Preview Hub 只需要两样东西：**页面注册表 `pages`** 和 **角色定义 `roles`**。其余配置全部走默认值。

**第 1 步：创建一个配置文件** `preview-hub/config.ts`：

```typescript
import type { PreviewHubConfig } from "@qiuwei-liao/preview-hub";

export const previewHubConfig: PreviewHubConfig = {
  // 必填：注册你要预览的页面
  pages: [
    {
      id: "home",
      title: "首页",
      web: { route: "/" },
      sourceFile: "src/app/page.tsx",
    },
    {
      id: "orders",
      title: "我的订单",
      roles: ["customer"],           // 仅 C 端可见
      web: { route: "/orders" },
      sourceFile: "src/app/orders/page.tsx",
    },
    {
      id: "merchant-dashboard",
      title: "商家后台",
      roles: ["merchant"],           // 仅商家可见
      web: { route: "/merchant" },
      sourceFile: "src/app/merchant/page.tsx",
    },
  ],

  // 必填：定义角色分段
  roles: [
    { id: "customer", label: "C端", description: "消费者视角" },
    { id: "merchant", label: "B端", description: "商家视角" },
  ],
};
```

**第 2 步：新建一个路由页面** `app/preview/page.tsx`：

```tsx
"use client";

import { PreviewHub } from "@qiuwei-liao/preview-hub";
import { previewHubConfig } from "@/preview-hub/config";

export default function PreviewPage() {
  return <PreviewHub config={previewHubConfig} />;
}
```

打开 `/preview`，即可看到顶栏的角色分段、右侧的设备 / 页面浮层、以及 iframe 里加载的真实页面。此时：

- 不传 `authAdapter` → 登录相关 UI 自动隐藏，工作台为静态预览。
- 不传 `miniapp` → 小程序载体自动隐藏，只显示 Web。
- 不传 `devices` → 内置 10 款主流设备可用。

下一步请阅读 [接入示例](#5-接入示例) 了解如何接入真实登录、小程序载体与 iframe 内侧桥接。

---

## 4. 配置项参考

所有行为通过单个 `PreviewHubConfig` 对象注入。完整定义位于 `src/config/types.ts`。

### 4.1 `PreviewHubConfig` 全字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|---|---|:-:|---|---|
| `pages` | `PageDef[]` | ✅ | — | 页面注册表。每项见 [4.2](#42-pagedef-页面定义)。 |
| `roles` | `RoleDef[]` | ✅ | — | 角色列表，决定顶栏分段与登录身份集合。 |
| `devices` | `PreviewDevice[]` | ❌ | 内置 10 款 | 自定义设备集；不传则使用 `DEFAULT_DEVICES`。 |
| `identities` | `IdentitySpec[]` | ❌ | — | 身份列表，用于真实登录切换；不传则隐藏登录相关 UI。 |
| `miniapp` | `MiniappConfig` | ❌ | — | 小程序载体配置；不传则隐藏小程序载体。 |
| `app` | `AppConfig` | ❌ | — | App 载体配置（底部 TabBar）；不传则隐藏 App 载体。 |
| `environments` | `EnvironmentSpec[]` | ❌ | `[{id:"dev",label:"DEV",...}]` | 环境列表（DEV / STAGING / PROD 等）。 |
| `iframeBaseUrl` | `string` | ❌ | `""` | iframe src 前缀；空串 = 同源相对路径；跨域预览填目标 Origin。 |
| `authAdapter` | `AuthAdapter` | ❌ | — | 认证适配器；不传则不执行真实登录。 |
| `storageKeyPrefix` | `string` | ❌ | `"preview-hub"` | localStorage key 前缀；同域多实例需区分。 |
| `previewRoutePath` | `string` | ❌ | `"/preview"` | 预览路由路径，用于 `buildPreviewUrl`。 |
| `sessionChangeEvent` | `string` | ❌ | `"preview-hub:session-changed"` | 会话变化自定义事件名。 |
| `defaultState` | `DefaultStateConfig` | ❌ | — | 默认状态部分覆盖（角色 / 载体 / 设备 / 页面 / 主题 / 只读 / 环境）。 |
| `pageIdAliases` | `Record<string, string>` | ❌ | — | 页面 ID 别名，例如 `{ home: "me" }`。 |

### 4.2 `PageDef` 页面定义

```typescript
interface PageDef {
  id: string;                     // 业务 pageId，如 "orders"
  title: string;                  // 显示标题，如 "我的订单"
  roles?: PreviewRole[];          // 可访问角色；undefined = 全部
  web?: { route: string };        // Web 路由
  miniProgram?: { route: string };// 小程序路由
  app?: { route: string };        // App 路由（原生 App 壳内加载）
  sourceFile?: string;            // 源文件位置（相对项目根），用于页面定位条
}
```

### 4.3 `RoleDef` / `EnvironmentSpec` / `MiniappConfig`

```typescript
interface RoleDef {
  id: PreviewRole;          // string，由你定义
  label: string;            // 显示名，如 "C端"
  description?: string;
}

interface EnvironmentSpec {
  id: string;
  label: string;
  apiOrigin: string;
  description: string;
}

interface MiniappConfig {
  pages: {
    id: string;
    label: string;
    url: string;           // 同源路由（真实 Web 页面）
    caption: string;
    spec: string[];
  }[];
  tabbar: { pageId: string; label: string }[];
}
```

### 4.4 `DefaultStateConfig`

```typescript
interface DefaultStateConfig {
  role?: PreviewRole;
  surface?: PreviewSurface;      // "web" | "mini_program" | "app"
  deviceId?: string;
  pageId?: string;
  theme?: ThemeMode;             // "light" | "dark" | "system"
  readOnly?: boolean;
  environment?: string;
  lastRouteByRole?: Record<PreviewRole, string>;
}
```

> 未配置的字段由 `createDefaultState(config)` 推导：默认角色取 `roles[0].id`，默认页面取 `pages[0]`，默认设备取 `devices[0]`（或 `DEFAULT_DEVICES[0]`）。

---

## 5. 接入示例

### 5.1 注入页面注册表

把你项目中需要预览的页面全部登记到 `config.pages`。每个页面通过 `web.route`、`miniProgram.route` 与 `app.route` 分别声明在三种载体下的路径；不支持的载体不传即可。

```typescript
import type { PageDef } from "@qiuwei-liao/preview-hub";

export const pages: PageDef[] = [
  {
    id: "home",
    title: "首页",
    web: { route: "/" },
    miniProgram: { route: "/m/home" },
    app: { route: "/" },
    sourceFile: "src/app/page.tsx",
  },
  {
    id: "orders",
    title: "我的订单",
    roles: ["customer"],                 // 只有 customer 角色能看到
    web: { route: "/orders" },
    miniProgram: { route: "/m/orders" },
    app: { route: "/orders" },
    sourceFile: "src/app/orders/page.tsx",
  },
  {
    id: "merchant-dashboard",
    title: "商家后台",
    roles: ["merchant"],                 // 只有 merchant 角色能看到
    web: { route: "/merchant" },         // 商家后台没有小程序版 / App 版
    sourceFile: "src/app/merchant/page.tsx",
  },
];
```

要点：

- `roles` 省略 = 所有角色可见。
- `sourceFile` 用于顶栏的"页面定位条"，点击可复制相对路径。
- 想给某个页面起别名（例如旧链接 `/home` 实际指向 `me`），在 `config.pageIdAliases` 里配 `{ home: "me" }`。

### 5.2 注入身份列表

身份列表用于"一键切换登录身份"。每项对应一个可登录的测试账号：

```typescript
import type { IdentitySpec } from "@qiuwei-liao/preview-hub";

export const identities: IdentitySpec[] = [
  {
    id: "customer-default",
    role: "customer",
    label: "C端-普通用户",
    phone: "13800000001",
    code: "000000",                       // 测试验证码
    tenantSlug: "demo",
    description: "默认消费者账号",
  },
  {
    id: "merchant-demo",
    role: "merchant",
    label: "B端-演示商家",
    phone: "13800000002",
    code: "000000",
    tenantSlug: "demo",
    description: "演示店铺运营者",
  },
];
```

> 手机号 / 验证码仅作为 UI 展示与传给 `AuthAdapter.login(identity)` 的入参；真正怎么登录由你实现的 adapter 决定。

### 5.3 实现 `AuthAdapter`

Preview Hub 不绑定任何业务登录系统。你需要实现 `AuthAdapter` 接口，把工作台的"切换身份"动作桥接到你自己的登录逻辑上。

```typescript
import type { AuthAdapter, SessionDisplayInfo } from "@qiuwei-liao/preview-hub";
import type { IdentitySpec } from "@qiuwei-liao/preview-hub";
import {
  loginWithPhoneCode,        // 你自己的业务登录函数
  switchRole,                // 你自己的切角色函数
  getCurrentSession,         // 你自己的会话读取
  isLoggedIn as bizIsLoggedIn,
} from "@/lib/auth";

export const myAuthAdapter: AuthAdapter = {
  // 工作台选择身份后调用：用 identity 里的手机号 / 验证码 / 租户登录
  async login(identity: IdentitySpec): Promise<SessionDisplayInfo> {
    const session = await loginWithPhoneCode({
      phone: identity.phone,
      code: identity.code,
      tenantSlug: identity.tenantSlug,
    });

    // 如果身份指定了角色，且与当前登录角色不同，切过去
    if (identity.role && session.role !== identity.role) {
      await switchRole(identity.role);
    }

    return {
      loggedIn: true,
      phone: session.phone,
      role: identity.role,
      roleLabel: identity.label,
      shopName: session.shopName,
      loggedInAt: Date.now(),
    };
  },

  // 工作台读取当前会话（用于顶栏展示）
  getSession(): SessionDisplayInfo {
    const s = getCurrentSession();
    if (!s) return { loggedIn: false };
    return {
      loggedIn: true,
      phone: s.phone,
      role: s.role,
      roleLabel: s.roleLabel,
      shopName: s.shopName,
    };
  },

  isLoggedIn(): boolean {
    return bizIsLoggedIn();
  },

  // 可选：订阅会话变化（登出 / 401 / 切租户），返回取消订阅函数
  subscribe(callback: () => void): () => void {
    window.addEventListener("app:session-changed", callback);
    window.addEventListener("storage", callback);
    return () => {
      window.removeEventListener("app:session-changed", callback);
      window.removeEventListener("storage", callback);
    };
  },
};
```

然后在 config 里挂上：

```typescript
export const previewHubConfig: PreviewHubConfig = {
  pages,
  roles: [/* ... */],
  identities,
  authAdapter: myAuthAdapter,
  // ...其余配置
};
```

> 如果暂时不需要真实登录，不传 `authAdapter` 即可；包内置的 `NoopAuthAdapter` 会作为兜底，工作台自动隐藏登录相关 UI。

### 5.4 配置小程序载体

传 `config.miniapp` 即可解锁"小程序"载体。**注意：小程序壳里加载的依然是同源 Web 页面**（`url` 字段填真实路由），包外会叠加胶囊按钮 + tabbar + 导航栈模拟小程序外观。

```typescript
import type { PreviewHubConfig } from "@qiuwei-liao/preview-hub";

export const previewHubConfig: PreviewHubConfig = {
  // ...pages / roles / identities ...
  miniapp: {
    pages: [
      {
        id: "home",
        label: "首页",
        url: "/m/home",              // 同源路由，iframe 实际加载这个
        caption: "首页",
        spec: ["iphone-18-pro"],
      },
      {
        id: "orders",
        label: "订单",
        url: "/m/orders",
        caption: "我的订单",
        spec: ["iphone-18-pro"],
      },
      {
        id: "me",
        label: "我的",
        url: "/m/me",
        caption: "个人中心",
        spec: ["iphone-18-pro"],
      },
    ],
    tabbar: [
      { pageId: "home", label: "首页" },
      { pageId: "orders", label: "订单" },
      { pageId: "me", label: "我的" },
    ],
  },
};
```

### 5.5 配置 App 载体

传 `config.app` 即可解锁"App"载体。**注意：App 壳里加载的依然是同源 Web 页面**（`route` 填真实路由），包外会叠加 iOS 原生风格的导航栏 + 底部 TabBar + Home 指示条模拟原生 App 外观。

```typescript
import type { PreviewHubConfig } from "@qiuwei-liao/preview-hub";

export const previewHubConfig: PreviewHubConfig = {
  // ...pages / roles / identities ...
  // 页面需要在 PageDef 里声明 app.route（见 5.1）
  app: {
    tabbar: [
      { pageId: "home", label: "首页", icon: "home" },
      { pageId: "orders", label: "订单", icon: "list" },
      { pageId: "me", label: "我的", icon: "mine" },
    ],
  },
};
```

> TabBar 图标 `icon` 可选 `"home" | "list" | "message" | "mine"`（内置极简 SVG），缺省按 tab 顺序分配。App 载体支持 mobile / tablet 设备族，不提供桌面浏览器壳。

### 5.6 在 iframe 内侧接入 Preview Bridge

工作台通过 postMessage 与被预览页面通信。**包本身不提供 `PreviewBridge` 组件**（因为它依赖 `next/navigation`，是 Next.js 特定的桥接）；你需要在自己的 Next.js 项目里写一个薄组件，组合包导出的 `sendToHub` / `listenPreviewMessages` / `enableReadOnlyGuard` 即可。

最小实现示例（放在你项目的 `components/preview-bridge.tsx`）：

```tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  sendToHub,
  listenPreviewMessages,
  enableReadOnlyGuard,
  disableReadOnlyGuard,
} from "@qiuwei-liao/preview-hub";

export function PreviewBridge() {
  const pathname = usePathname();
  const router = useRouter();

  // 1. 挂载完成 & 路由变化时，上报给工作台
  useEffect(() => {
    sendToHub({ type: "preview:ready", route: pathname });
  }, [pathname]);

  // 2. 监听工作台下发的消息：跳转 / 只读开关
  useEffect(() => {
    const unlisten = listenPreviewMessages((msg) => {
      switch (msg.type) {
        case "preview:set-route":
          if (msg.route) router.push(msg.route);
          break;
        case "preview:set-readonly":
          if (msg.enabled) enableReadOnlyGuard();
          else disableReadOnlyGuard();
          break;
      }
    });
    return unlisten;
  }, [router]);

  return null;
}
```

然后在你的根布局（或被预览页面的布局）里挂上 `<PreviewBridge />`。这样工作台切换页面时 iframe 会跟着跳转，只读开关也会在 iframe 内侧生效。

> 如果你不用 Next.js，把 `usePathname` / `useRouter` 换成对应框架的路由 API 即可，消息协议字段不变。

---

## 6. API 参考

所有导出均从包根入口 `@qiuwei-liao/preview-hub` 导入。完整清单见 `src/index.ts`。

### 6.1 主组件 `PreviewHub`

```tsx
import { PreviewHub } from "@qiuwei-liao/preview-hub";

<PreviewHub config={myConfig} className="fixed inset-0" style={{ background: "#000" }} />
```

```typescript
interface PreviewHubProps {
  config: PreviewHubConfig;   // 完整配置
  className?: string;         // 透传到根容器
  style?: React.CSSProperties;
}
```

`PreviewHub` 内部自包含 `PreviewHubProvider` + `PreviewStateProvider` + `PreviewHubContent`，外部只需传 `config`。

### 6.2 Provider 与 Hook

#### `PreviewHubProvider`

```tsx
import { PreviewHubProvider } from "@qiuwei-liao/preview-hub";

<PreviewHubProvider config={myConfig}>
  {/* 在 PreviewHub 外部、需要读取同一份配置的业务组件 */}
</PreviewHubProvider>
```

```typescript
interface PreviewHubProviderProps {
  config: PreviewHubConfig;
  children: ReactNode;
}
```

> 典型用途：在 Preview Hub 页面之外（例如业务侧的"移动端预览"入口按钮）读取同一份 config，生成 Deep Link。

#### `usePreviewHubConfig()`

在 `PreviewHubProvider` 子树内读取当前配置。**必须在 Provider 内部使用**，否则抛错。

```typescript
import { usePreviewHubConfig } from "@qiuwei-liao/preview-hub";

function MyEntryButton() {
  const config = usePreviewHubConfig();
  // config.roles / config.pages / ...
}
```

### 6.3 iframe 通信工具（`renderer/bus`）

```typescript
import {
  sendToIframe,
  sendToHub,
  listenPreviewMessages,
} from "@qiuwei-liao/preview-hub";
```

| 函数 | 签名 | 调用位置 | 说明 |
|---|---|---|---|
| `sendToHub` | `(msg: PreviewMessage) => void` | iframe 内 | 向父窗口（工作台）发消息。 |
| `sendToIframe` | `(win: Window, msg: PreviewMessage) => void` | 工作台内 | 向指定 iframe 窗口发消息。 |
| `listenPreviewMessages` | `(handler: (msg, source) => void) => () => void` | 任一侧 | 注册消息监听，返回取消监听函数。 |

`PreviewMessage` 结构：

```typescript
interface PreviewMessage {
  type: PreviewMessageType;   // 见下表
  route?: string;
  panelId?: string;
  enabled?: boolean;
}

type PreviewMessageType =
  | "preview:ready"
  | "preview:route-changed"
  | "preview:401"
  | "preview:set-route"
  | "preview:sync-request"
  | "preview:sync-response"
  | "preview:set-readonly";
```

### 6.4 只读保护工具（`ui/read-only-guard`）

```typescript
import { enableReadOnlyGuard, disableReadOnlyGuard } from "@qiuwei-liao/preview-hub";
```

| 函数 | 签名 | 说明 |
|---|---|---|
| `enableReadOnlyGuard` | `() => () => void` | 在当前 document 上注册捕获阶段 click 监听，命中危险按钮时弹自定义确认层；返回取消函数。 |
| `disableReadOnlyGuard` | `() => void` | 移除监听并清理确认层。 |

> 危险按钮由按钮文本匹配内置关键词（删除 / 提交 / 确认付款 / 创建订单 / 支付 / 结算 / 发货 / 确认删除），见 `DANGEROUS_KEYWORDS`。

### 6.5 URL 工具（`state/url`）

```typescript
import { buildPreviewUrl, parsePreviewUrl } from "@qiuwei-liao/preview-hub";
```

```typescript
interface PreviewUrlParams {
  role?: string;
  surface?: "web" | "mini_program" | "app";
  pageId?: string;
  deviceId?: string;
  route?: string;
}

// 构建 Deep Link；previewRoutePath 默认 "/preview"
buildPreviewUrl(params: PreviewUrlParams, previewRoutePath?: string): string

// 解析 location.search，兼容 device / deviceId 两种参数名
parsePreviewUrl(search: string): Partial<PreviewUrlParams>
```

示例：

```typescript
buildPreviewUrl({ role: "customer", surface: "web", pageId: "orders" });
// => "/preview?role=customer&surface=web&pageId=orders"
```

### 6.6 注册表工厂

#### `createPageRegistry(pages, aliases?)`

```typescript
import { createPageRegistry } from "@qiuwei-liao/preview-hub";
import type { PageRegistry } from "@qiuwei-liao/preview-hub";

const registry = createPageRegistry(pages, { home: "me" });

registry.getPageById("orders");            // PageDef | undefined
registry.getPagesForSurface("web", "customer");  // PageDef[]
registry.getPageRoute("orders", "web");    // "/orders" | undefined
registry.getPageIdByRoute("/orders", "web"); // "orders" | undefined
registry.normalizePageId("home");          // "me"（走别名）
registry.getPageTitle("orders");           // "我的订单"
```

#### `createDeviceRegistry(devices?)`

```typescript
import { createDeviceRegistry } from "@qiuwei-liao/preview-hub";
import type { DeviceRegistry } from "@qiuwei-liao/preview-hub";

const devices = createDeviceRegistry(/* 不传则用 DEFAULT_DEVICES */);

devices.getDeviceById("iphone-18-pro");
devices.getDevicesForFamily("mobile");
devices.getDevicesForSurface("mini_program");   // 只返回 mobile
devices.getDevicesForSurface("app");            // 返回 mobile + tablet
devices.list();
```

### 6.7 内置默认值与主题

```typescript
import {
  DEFAULT_DEVICES,   // PreviewDevice[]，内置 10 款设备
  THEMES,           // Record<"light"|"dark"|"system", ThemeTokens>
  darkTheme,         // ThemeTokens
  lightTheme,       // ThemeTokens
  getTheme,          // (theme) => ThemeTokens（system 跟随 prefers-color-scheme）
} from "@qiuwei-liao/preview-hub";
import type { ThemeTokens } from "@qiuwei-liao/preview-hub";
```

另外导出两个常量：

- `SURFACE_LABELS`：`{ web: "Web", mini_program: "小程序", app: "App" }`
- `SURFACE_DEVICE_FAMILIES`：`{ web: ["mobile","tablet","desktop"], mini_program: ["mobile"], app: ["mobile","tablet"] }`

### 6.8 会话

```typescript
import { NoopAuthAdapter } from "@qiuwei-liao/preview-hub";
```

`NoopAuthAdapter` 是空实现的 `AuthAdapter`：`login` 返回未登录、`isLoggedIn()` 恒为 `false`。当你不想接入真实登录时，可以显式传入它作为占位。

### 6.9 类型导出清单

从包根可导入以下类型（`import type { ... }`）：

- **配置相关**：`PreviewHubConfig`、`AuthAdapter`、`SessionDisplayInfo`、`RoleDef`、`SurfaceDef`、`EnvironmentSpec`、`MiniappConfig`、`MiniappPage`、`MiniappTabBarItem`、`AppConfig`、`AppTabBarItem`、`DefaultStateConfig`
- **核心模型**：`PreviewRole`、`PreviewSurface`、`PreviewDevice`、`PageDef`、`PageSurfaceRoute`、`PreviewExperience`、`PreviewState`、`PreviewMode`、`ComparisonState`、`ThemeMode`、`IdentitySpec`、`PreviewMessage`、`PreviewMessageType`、`PreviewRenderer`、`DeviceFamily`、`Orientation`
- **注册表**：`PageRegistry`、`DeviceRegistry`
- **主题**：`ThemeTokens`
- **组件 Props**：`PreviewHubProps`

---

## 7. 目录结构

包内源码位于 `packages/preview-hub/src/`，按职责划分如下：

```
packages/preview-hub/
├── package.json              # name: "@qiuwei-liao/preview-hub"，type: module，exports 指向 src/index.ts
├── tsconfig.json             # 继承根 tsconfig
├── README.md                 # 本文档
├── LICENSE                   # MIT
└── src/
    ├── index.ts              # 对外统一导出（主组件 / Provider / Hook / 类型 / 工具函数）
    ├── types.ts              # 核心类型：四维模型、状态、消息协议、渲染器抽象
    │
    ├── config/               # 配置层
    │   ├── types.ts          #   PreviewHubConfig、AuthAdapter、RoleDef、MiniappConfig 等类型
    │   ├── defaults.ts       #   内置默认设备集、默认主题 tokens、默认状态工厂
    │   └── context.tsx       #   PreviewHubProvider + usePreviewHubConfig()
    │
    ├── registry/             # 注册表（纯逻辑工厂，基于 config 生成查询函数）
    │   ├── page.ts           #   页面注册表：getPageById / getPagesForSurface / getPageRoute ...
    │   └── device.ts         #   设备注册表：getDeviceById / getDevicesForFamily ...
    │
    ├── session/              # 会话层（通过 AuthAdapter 解耦业务登录）
    │   ├── auth-adapter.ts   #   AuthAdapter 接口 + NoopAuthAdapter 空实现
    │   ├── session-manager.ts # 会话管理（调用 authAdapter，无业务 import）
    │   └── use-preview-session.ts # React Hook，订阅会话变化
    │
    ├── state/                # 状态层
    │   ├── storage.ts        #   localStorage 持久化（key 前缀来自 config）
    │   ├── resolver.ts        #   Experience 合法性校验与自动降级
    │   ├── url.ts             #   Deep Link 构建 / 解析（preview 路径可配）
    │   └── use-preview-state.tsx # 状态管理 Provider + Hook + Actions
    │
    ├── renderer/             # 渲染层（按载体分发）
    │   ├── bus.ts            #   iframe postMessage 通信总线
    │   ├── web-renderer.tsx  #   Web 渲染器（设备壳 + iframe）
    │   ├── mini-program-renderer.tsx # 小程序渲染器
    │   ├── mini-program-shell.tsx    # 小程序壳（胶囊 + tabbar）
    │   ├── mini-program-navigation.ts # 小程序导航栈纯逻辑
    │   ├── app-renderer.tsx  #   App 渲染器（WebView + TabBar）
    │   └── app-shell.tsx     #   App 壳（iOS 原生导航栏 + TabBar + Home 指示条）
    │
    ├── ui/                   # UI 组件层（全部通过 usePreviewHubConfig() 取配置）
    │   ├── preview-header.tsx
    │   ├── role-switcher.tsx
    │   ├── surface-switcher.tsx
    │   ├── device-switcher.tsx
    │   ├── route-switcher.tsx
    │   ├── page-locator.tsx
    │   ├── preview-actions.tsx
    │   ├── command-palette.tsx
    │   ├── settings-drawer.tsx
    │   ├── focus-canvas.tsx
    │   ├── comparison-canvas.tsx
    │   ├── preview-login-toast.tsx
    │   └── read-only-guard.ts  # 纯 DOM 只读拦截工具（iframe 内侧用）
    │
    ├── hooks/
    │   └── use-keyboard-shortcuts.ts # ⌘K / ⌘1-3 快捷键
    │
    └── components/           # 对外组装层
        ├── PreviewHub.tsx        # 主组件（内部组装 Provider + State + Content）
        └── PreviewHubContent.tsx # 内部内容组装
```

各模块的业务依赖红线见 [架构说明 → 配置注入架构](#24-配置注入架构)。

---

## 8. 已知边界

在把 Preview Hub 接入自己项目之前，建议先了解以下边界与限制：

- **小程序载体实际渲染的是同源 Web 页面**。所谓"小程序壳"是在 Web 页面外层叠加一个模拟的胶囊按钮 + tabbar + 导航栈，iframe 里加载的依然是 `/m/*` 这类同源路由。它不是真正的小程序运行时——小程序原生组件、原生 API、分包等无法在此模拟。
- **App 载体同样是 WebView 模拟**。App 壳（iOS 原生导航栏 + 底部 TabBar + Home 指示条）包裹的是同源 Web 页面；它不是真正的原生 App 运行时，原生 SDK / 推送 / 系统权限等无法在此模拟。切换 App 页面时，被预览页面需要像 Web 端一样接入 Preview Bridge（监听 `preview:set-route`）才能完成客户端导航，否则只显示首个路由页面。
- **注意避免"双 TabBar"**。App 壳的底部 TabBar（`config.app.tabbar`）与页面自带底部导航互斥：如果被预览的页面自身已经是带底部导航的移动端 H5（例如小程序页面直接拿来当 `app.route` 预览），再配置 `config.app.tabbar` 会叠出两层 TabBar（一层页面自带的、一层 App 壳的）。按场景二选一：页面自带导航 → 不配置 `config.app.tabbar`（App 壳只保留状态栏 + 导航栏）；想用 App 壳的 TabBar → 被预览页面应去掉自带底部导航，只渲染纯内容。App 载体面向"原生壳 + 纯内容页"的形态；自带完整导航的页面更适合用 Web 或小程序载体预览。
- **跨域 iframe 需要被预览页面配合接入**。postMessage 通信要求被预览页面一侧也实现 Preview Bridge（监听 `preview:navigate`、上报 `preview:ready` / `preview:route-changed` / `preview:401`）。如果目标页面不在你的控制下（例如第三方站点），工作台只能做静态壳，无法同步路由或触发登录重建。
- **真实登录依赖接入方实现 `AuthAdapter`**。包内不带任何登录逻辑；如果不传 `config.authAdapter`，工作台会退化为纯静态预览（不触发真实登录、不支持 401 重建），相关 UI 也会自动隐藏。
- **Preview Bridge 组件留在接入层**。因为它依赖 `next/navigation`（`usePathname` / `useRouter`），是 Next.js 特定的 iframe 内侧桥接，不适合放进框架无关的包内。其他框架（Vite / Remix / CRA）需要自己写等价桥接，协议字段见 [iframe 通信机制](#22-iframe-同源通信机制)。
- **`storageKeyPrefix` 需要按项目区分**。同一个浏览器域下如果要跑多个 Preview Hub 实例（例如多个环境、多个产品），请给每个实例配不同的 `storageKeyPrefix`，否则 localStorage 会互相覆盖。

---

## 9. 开源许可

本项目基于 **[MIT License](./LICENSE)** 开源。
