// App 壳渲染层测试 —— 覆盖 getAppShellSize 纯逻辑与 AppShell 的 SSR 冒烟渲染。
// 渲染断言基于 react-dom/server renderToString 的输出文本与内联样式。

import { test } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { PreviewHubProvider } from "../../config/context";
import { AppShell, getAppShellSize, APP_SHELL_DEFAULT_SIZE } from "../app-shell";
import type { PreviewDevice, PreviewHubConfig } from "../../types";

const iphone: PreviewDevice = {
  id: "test-phone",
  family: "mobile",
  model: "Test Phone",
  orientation: "portrait",
  viewport: { width: 393, height: 852 },
  frame: "dynamic-island",
  bezel: 12,
  screenRadius: 55,
  frameRadius: 64,
  rotatable: true,
  material: "titanium",
  dpr: 3,
  osVersion: "iOS 18",
  dynamicIsland: { width: 126, height: 37 },
  safeArea: { top: 59, bottom: 34 },
};

const baseConfig: PreviewHubConfig = { pages: [], roles: [] };

const tabbarConfig: PreviewHubConfig = {
  pages: [],
  roles: [],
  app: {
    tabbar: [
      { pageId: "home", label: "首页", icon: "home" },
      { pageId: "mine", label: "我的", icon: "mine" },
    ],
  },
};

function renderShell(
  config: PreviewHubConfig,
  props: Partial<React.ComponentProps<typeof AppShell>> = {},
  children = "PAGE_CONTENT",
): string {
  return renderToString(
    <PreviewHubProvider config={config}>
      <AppShell activePageId="home" onSwitchTab={() => {}} {...props}>
        {children}
      </AppShell>
    </PreviewHubProvider>,
  );
}

// ─── getAppShellSize ───

test("getAppShellSize 未传设备时返回默认 390×780", () => {
  assert.deepEqual(getAppShellSize(), { ...APP_SHELL_DEFAULT_SIZE });
  assert.deepEqual(getAppShellSize(undefined), { width: 390, height: 780 });
});

test("getAppShellSize 竖屏设备返回设备视口", () => {
  assert.deepEqual(getAppShellSize(iphone), { width: 393, height: 852 });
});

test("getAppShellSize 可旋转设备横屏时宽高互换", () => {
  const landscape = { ...iphone, orientation: "landscape" as const };
  assert.deepEqual(getAppShellSize(landscape), { width: 852, height: 393 });
});

test("getAppShellSize 不可旋转设备横屏时保持设备视口", () => {
  const fixed = { ...iphone, rotatable: false, orientation: "landscape" as const };
  assert.deepEqual(getAppShellSize(fixed), { width: 393, height: 852 });
});

// ─── AppShell 渲染 ───

test("AppShell 无 tabbar 配置时渲染状态栏与回退标题，不渲染 TabBar", () => {
  const html = renderShell(baseConfig);
  assert.match(html, /9:41/);
  assert.match(html, />App</);
  assert.match(html, /PAGE_CONTENT/);
  assert.doesNotMatch(html, /aria-label="首页"/);
});

test("AppShell 渲染 TabBar 项与当前页标题", () => {
  const html = renderShell(tabbarConfig);
  assert.match(html, /aria-label="首页"/);
  assert.match(html, /aria-label="我的"/);
  // 大标题导航栏显示当前 tab 的 label（activePageId="home" → 首页）
  assert.match(html, />首页</);
  assert.match(html, />我的</);
});

test("AppShell activePageId 不在 tabbar 时标题回退为 App", () => {
  const html = renderShell(tabbarConfig, { activePageId: "unknown" });
  assert.match(html, />App</);
});

test("AppShell 未指定设备时使用 390×780 外壳", () => {
  const html = renderShell(tabbarConfig);
  assert.match(html, /width:390px;height:780px/);
});

test("AppShell 指定设备时外壳贴合设备视口并渲染 Home 指示条", () => {
  const html = renderShell(tabbarConfig, { device: iphone });
  assert.match(html, /width:393px;height:852px/);
  // Home 指示条：134×4 圆角条
  assert.match(html, /width:134px;height:4px/);
});

test("AppShell 平板设备使用圆角外壳（borderRadius 24）", () => {
  const tablet: PreviewDevice = {
    ...iphone,
    id: "test-tablet",
    family: "tablet",
    model: "Test Tablet",
    viewport: { width: 834, height: 1194 },
    frame: "tablet",
  };
  const html = renderShell(tabbarConfig, { device: tablet });
  assert.match(html, /width:834px;height:1194px/);
  assert.match(html, /border-radius:24px/);
});

test("AppShell darkNav 使用深色导航背景", () => {
  const html = renderShell(tabbarConfig, { darkNav: true });
  assert.match(html, /background:#111318/);
});
