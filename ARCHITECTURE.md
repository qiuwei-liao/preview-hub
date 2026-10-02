# Preview Hub — 架构设计与开源指南

> **项目定位**：一个可独立开源的多设备实时预览工具，支持小程序、APP、Web 应用的多设备预览、实时渲染、HMR 热更新。
> **当前状态**：独立开源项目，零业务依赖，所有业务配置通过 `PreviewHubConfig` 从外部注入。
> **最后更新**：2026-10-03

---

## 📦 项目概述

Preview Hub 是一个面向开发者的多设备实时预览工具，核心特性：

- 📱 **多设备模拟**：iPhone、Android、iPad、桌面浏览器，支持自定义设备
- 🔄 **实时渲染**：HMR 热更新监听，代码修改自动刷新预览
- 🎨 **精确设备壳**：钛金属/铝合金/玻璃材质，灵动岛/打孔屏，状态栏/ Home Indicator
- 📐 **统一布局计算**：safe-area、状态栏、TabBar 高度精确计算，多设备一致
- 🔍 **对比模式**：双设备并排对比，滚动/路由/数据同步
- 🎯 **只读模式**：防止预览时误操作
- 🌗 **主题切换**：深色/浅色/跟随系统
- ♿ **无障碍滤镜**：色盲模拟、灰度、高对比度

---

## 🏗️ 架构设计

### 目录结构

```
packages/preview-hub/
├── src/
│   ├── components/          # UI 组件（设备选择器、工具栏等）
│   ├── config/              # 配置上下文、默认设备、主题 tokens
│   │   ├── context.tsx      # PreviewHubConfig Provider
│   │   ├── defaults.ts      # 默认设备集、主题、状态工厂
│   │   └── types.ts         # 配置类型定义
│   ├── hooks/               # 自定义 Hooks
│   │   ├── use-hmr-watcher.ts   # HMR 热更新监听
│   │   └── use-preview-state.ts # 预览状态管理
│   ├── renderer/            # 渲染器（核心）
│   │   ├── web-renderer.tsx     # Web 页面渲染器（iframe + 设备壳）
│   │   ├── mini-program-renderer.tsx # 小程序渲染器
│   │   └── bus.ts               # iframe 通信总线
│   ├── state/               # 状态管理
│   │   └── use-preview-state.tsx
│   ├── types.ts             # 核心类型定义
│   ├── ui/                  # 纯 UI 工具（只读保护等）
│   └── utils/               # 工具函数
│       └── device-layout.ts     # 统一设备布局计算（核心）
└── package.json
```

### 核心模块说明

#### 1. `utils/device-layout.ts` — 统一设备布局计算（最重要）

这是确保多设备渲染一致性的核心模块，提供：

- **`computeDeviceLayout(device)`**：统一计算设备布局信息
  - 有效视口（横屏交换宽高）
  - 状态栏高度
  - 安全区（top/bottom/left/right）
  - Home Indicator 尺寸和位置
  - TabBar 推荐高度（iOS 原生 49px）
  - iframe 实际渲染高度

- **`computeDeviceOuterSize(device)`**：计算设备壳外尺寸

- **`validateDeviceConfig(device)`**：校验设备配置合理性，返回警告

- **`PRESET_SAFE_AREAS`**：预设设备安全区标准值
  - `iphoneDynamicIsland`：{ top: 59, bottom: 34 }
  - `iphoneNotch`：{ top: 44, bottom: 34 }
  - `iphoneClassic`：{ top: 20, bottom: 0 }
  - `androidGesture`：{ top: 24, bottom: 16 }
  - `ipad`：{ top: 20, bottom: 20 }

**设计原则**：所有渲染器必须使用此模块计算布局，禁止在渲染器中分散计算 safe-area。

#### 2. `renderer/web-renderer.tsx` — Web 页面渲染器

核心职责：
- 绘制设备壳（材质渐变、侧边按键、底部物理细节）
- 绘制状态栏（时间、信号、WiFi、电池）
- 绘制灵动岛/打孔摄像头
- 绘制 Home Indicator
- 加载 iframe 并注入 safe-area
- HMR 热更新监听
- 主题实时同步

**关键实现**：
- iframe 持久化：切换页面走 postMessage，不重建 iframe
- safe-area 注入：通过 `preview:set-safe-area` 消息注入
- 状态栏主题：通过 MutationObserver 监听 iframe 内 dark class

#### 3. `hooks/use-hmr-watcher.ts` — HMR 热更新监听

- 直接连接 dev server 的 `/_next/webpack-hmr` WebSocket
- 监听编译完成事件，800ms 防抖
- 自动刷新 iframe，显示"代码已更新"toast
- 自动重连，连接状态指示器

#### 4. `renderer/bus.ts` — iframe 通信总线

- `sendToIframe(win, msg)`：向 iframe 发送消息
- `listenPreviewMessages(callback)`：监听 iframe 消息
- 消息类型：`preview:ready`、`preview:set-route`、`preview:set-safe-area`、`preview:set-readonly` 等

---

## 🔧 核心技术方案

### 1. safe-area 注入方案

**问题**：iframe 内 `env(safe-area-inset-*)` 恒为 0，无法获取设备安全区。

**方案**：
1. Preview Hub 通过 `preview:set-safe-area` 消息将设备安全区注入 iframe
2. iframe 内的 `PreviewBridge` 组件接收消息，设置 `--safe-bottom` 等 CSS 变量
3. 应用代码使用 `var(--safe-bottom, env(safe-area-inset-bottom, 0px))` 获取安全区

**关键代码**（iframe 内）：
```tsx
// preview-bridge.tsx
root.style.setProperty("--safe-bottom", `${msg.bottom}px`);
```

**应用代码**：
```css
.tabbar {
  padding-bottom: max(8px, var(--safe-bottom, env(safe-area-inset-bottom, 0px)));
}
```

### 2. 多设备渲染一致性方案

**问题**：不同设备的 TabBar 位置、Home Indicator 位置可能有视觉差异。

**方案**：
1. 创建统一的 `computeDeviceLayout` 工具
2. 所有渲染器使用此工具计算布局
3. Home Indicator 位置与 safe-area 关联（bottomOffset = 8px 固定，safe-area = 34px）
4. TabBar 高度统一为 iOS 原生标准 49px

### 3. iframe 持久化方案

**问题**：切换页面时重建 iframe 会丢失滚动位置、表单状态、历史栈。

**方案**：
1. iframe 的 `src` 只用于首次加载
2. 切换页面通过 `postMessage(preview:set-route)` 让 iframe 内部做客户端导航
3. iframe 的 `key` 只依赖 `device.id`，切换设备才重建 iframe

### 4. HMR 实时预览方案

**问题**：修改代码后需要手动刷新预览。

**方案**：
1. 直接连接 dev server 的 `/_next/webpack-hmr` WebSocket
2. 监听编译完成事件（`still-ok` 或 `hash` 消息）
3. 800ms 防抖后自动 `iframe.contentWindow.location.reload()`
4. 显示"代码已更新"toast 和连接状态指示器

---

## 📱 设备配置规范

### 设备类型定义

```typescript
interface PreviewDevice {
  id: string;                    // 唯一标识
  family: "mobile" | "tablet" | "desktop";
  model: string;                 // 显示名称
  orientation: "portrait" | "landscape";
  viewport: { width: number; height: number };
  frame: "dynamic-island" | "punch-hole" | "tablet" | "browser";
  bezel: number;                 // 边框宽度
  screenRadius: number;          // 屏幕圆角
  frameRadius: number;           // 设备壳圆角
  rotatable: boolean;            // 是否可旋转
  material: "titanium" | "aluminum" | "glass" | "plastic";
  dpr: number;                   // 设备像素比
  osVersion: string;             // 系统版本
  dynamicIsland?: { width: number; height: number };
  safeArea: { top: number; bottom: number; left?: number; right?: number };
}
```

### 内置设备列表

| 设备 | viewport | safeArea | DPR |
|---|---|---|---|
| iPhone 18 Pro | 393x852 | { top: 59, bottom: 34 } | 3 |
| iPhone 18 Pro Max | 430x932 | { top: 59, bottom: 34 } | 3 |
| iPhone SE | 375x667 | { top: 20, bottom: 0 } | 2 |
| Android 360 | 360x800 | { top: 24, bottom: 16 } | 2 |
| Samsung S25 | 360x780 | { top: 24, bottom: 16 } | 3 |
| Pixel 9 | 412x892 | { top: 24, bottom: 16 } | 2.625 |
| iPad 11" | 834x1194 | { top: 20, bottom: 20 } | 2 |
| iPad Pro 13" | 1032x1376 | { top: 20, bottom: 20 } | 2 |
| PC 1440 | 1440x900 | - | 1 |
| MacBook 14" | 1512x982 | - | 2 |

---

## 🚀 开源准备清单

### 已完成

- ✅ 统一设备布局计算模块（`device-layout.ts`）
- ✅ Web 渲染器使用统一布局计算
- ✅ Home Indicator 与 safe-area 关联
- ✅ iframe 渲染精度优化
- ✅ HMR 热更新监听
- ✅ 多设备实时预览
- ✅ 对比模式
- ✅ 主题切换
- ✅ 无障碍滤镜

### 待完成（开源前）

- [x] 从宿主项目中解耦，移除宿主特定配置
- [ ] 完善 TypeScript 类型定义和导出
- [ ] 编写完整的 API 文档
- [ ] 编写使用教程和最佳实践
- [ ] 添加单元测试（布局计算、通信总线）
- [ ] 添加示例项目（React/Vue/Next.js）
- [ ] 配置 CI/CD（自动发布到 npm）
- [ ] 编写 README.md（项目介绍、特性、快速开始）
- [ ] 添加 CONTRIBUTING.md（贡献指南）
- [ ] 添加 LICENSE（MIT 推荐）
- [ ] 优化包体积（tree-shaking、外部化依赖）
- [ ] 支持小程序渲染（微信/支付宝/抖音）
- [ ] 支持 APP 预览（React Native/Flutter）

---

## 📚 API 文档（核心）

### `PreviewHub` 组件

```tsx
import { PreviewHub } from "@preview-hub/core";

<PreviewHub
  config={{
    iframeBaseUrl: "http://localhost:3000",
    devices: [...],        // 自定义设备列表
    roles: [...],          // 角色列表
    pages: [...],          // 页面列表
    defaultState: {...},   // 默认状态
  }}
/>
```

### `computeDeviceLayout`

```typescript
import { computeDeviceLayout } from "@preview-hub/core";

const layout = computeDeviceLayout(device);
// {
//   viewport: { width, height },
//   statusBarHeight: number,
//   safeAreaBottom: number,
//   safeAreaTop: number,
//   safeAreaLeft: number,
//   safeAreaRight: number,
//   homeIndicator: { width, height, bottomOffset, borderRadius },
//   dpr: number,
//   isLandscape: boolean,
//   isTablet: boolean,
//   iframeHeight: number,
//   tabBarHeight: number,
//   tabBarTotalHeight: number,
// }
```

### iframe 通信协议

**Hub → iframe 消息**：
- `preview:set-route`：切换页面
- `preview:set-safe-area`：注入安全区
- `preview:set-readonly`：设置只读模式

**iframe → Hub 消息**：
- `preview:ready`：iframe 已加载
- `preview:route-changed`：路由变化
- `preview:get-safe-area`：请求安全区
- `preview:set-status-bar-theme`：状态栏主题变化
- `preview:get-scroll`：滚动位置变化

---

## 🎯 最佳实践

### 1. 应用端集成

在应用的根布局中添加 `PreviewBridge` 组件（仅在 iframe 环境激活）：

```tsx
// app/layout.tsx
import { PreviewBridge } from "@preview-hub/core/bridge";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <PreviewBridge />
      </body>
    </html>
  );
}
```

### 2. safe-area 使用

使用 CSS 变量获取安全区，兼容真实设备和 Preview Hub：

```css
.tabbar {
  padding-bottom: max(8px, var(--safe-bottom, env(safe-area-inset-bottom, 0px)));
}
```

### 3. 自定义设备

```typescript
import { PRESET_SAFE_AREAS } from "@preview-hub/core";

const myDevice = {
  id: "my-phone",
  family: "mobile",
  model: "My Phone",
  orientation: "portrait",
  viewport: { width: 400, height: 900 },
  frame: "punch-hole",
  bezel: 10,
  screenRadius: 40,
  frameRadius: 50,
  rotatable: true,
  material: "glass",
  dpr: 3,
  osVersion: "Android 15",
  safeArea: PRESET_SAFE_AREAS.androidGesture,
};
```

---

## 📝 更新日志

### v0.2.0 (2026-09-28)
- ✨ 新增统一设备布局计算模块（`device-layout.ts`）
- ✨ Web 渲染器重构，使用统一布局计算
- ✨ Home Indicator 与 safe-area 关联，多设备渲染一致性提升
- ✨ iframe 渲染精度优化（字体平滑、亚像素对齐）
- 🐛 修复不同设备 TabBar 位置视觉差异问题

### v0.1.0 (2026-09-20)
- ✨ 初始版本
- ✨ 多设备实时预览
- ✨ HMR 热更新
- ✨ 对比模式
- ✨ 主题切换
- ✨ 无障碍滤镜

---

## 📄 License

MIT（推荐）

---

## 🤝 贡献

欢迎提交 Issue 和 PR！详见 CONTRIBUTING.md（待添加）。
