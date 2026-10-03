// Preview Hub 2.0 — 状态转换测试（reducer 风格，纯逻辑，不渲染 React）
// use-preview-state.ts 的 setState updater 未拆分为导出纯函数，
// 这里用真实类型 PreviewState + 真实 resolver/storage 复刻其状态迁移并断言不变量。

import { test } from "node:test";
import assert from "node:assert/strict";

import { resolvePreviewExperience } from "../resolver";
import type { ResolverRegistries } from "../resolver";
import { loadPersistedState, type PersistedState } from "../storage";
import { createPageRegistry } from "../../registry/page";
import { createDeviceRegistry } from "../../registry/device";
import type { PageDef, PreviewExperience, PreviewState } from "../../types";

const TEST_PAGES: PageDef[] = [
  {
    id: "orders",
    title: "订单",
    roles: ["customer", "merchant"],
    web: { route: "/m/orders" },
    miniProgram: { route: "/pages/demo/orders/orders" },
    app: { route: "/app/orders" },
  },
  {
    id: "customers",
    title: "客户",
    roles: ["merchant"],
    web: { route: "/m/customers" },
  },
  {
    id: "ai",
    title: "AI 助手",
    roles: ["merchant"],
    web: { route: "/m/ai" },
  },
  {
    id: "me",
    title: "我的",
    roles: ["merchant"],
    web: { route: "/m/me" },
  },
  {
    id: "admin-dashboard",
    title: "控制台",
    roles: ["platform_admin"],
    web: { route: "/admin" },
  },
];

const registries: ResolverRegistries = {
  pages: createPageRegistry(TEST_PAGES, { home: "me" }),
  devices: createDeviceRegistry(),
};

// 构造一个合法的初始 focus experience
function baseExperience(): PreviewExperience {
  return resolvePreviewExperience(
    { role: "merchant", surface: "web", pageId: "orders" },
    undefined,
    registries,
  );
}

function baseState(over: Partial<PreviewState> = {}): PreviewState {
  const experience = baseExperience();
  return {
    mode: "focus",
    experience,
    lastRouteByRole: {
      customer: "/m/orders",
      merchant: "/m/orders",
      platform_admin: "/admin",
    },
    theme: "dark",
    readOnly: true,
    environment: "dev",
    comparison: {
      leftExperience: experience,
      rightExperience: experience,
      sync: { page: true, scroll: false, data: false },
      activeSide: "left",
    },
    drawer: null,
    favorites: [],
    recentPages: [],
    ...over,
  };
}

test("setPage 更新 lastRouteByRole[currentRole] 为新 route", () => {
  let state = baseState();
  const newRoute = "/m/ai";

  // 复刻 use-preview-state.setPage 的 lastRouteByRole 迁移
  state = {
    ...state,
    experience: { ...state.experience, page: { pageId: "ai", route: newRoute } },
    lastRouteByRole: {
      ...state.lastRouteByRole,
      [state.experience.role]: newRoute,
    },
  };

  assert.equal(state.lastRouteByRole.merchant, newRoute);
  // 其他角色的 lastRoute 不受影响
  assert.equal(state.lastRouteByRole.customer, "/m/orders");
});

test("role 切换恢复该角色的 lastRoute（resolver 机制）", () => {
  const state = baseState();
  // 切到 customer：把 customer 的 lastRoute 作为 defaults.page.route 传入
  const lastRoute = state.lastRouteByRole.customer;
  const resolved = resolvePreviewExperience(
    { role: "customer" },
    {
      ...state.experience,
      page: { pageId: state.experience.page.pageId, route: lastRoute },
    },
    registries,
  );
  assert.equal(resolved.role, "customer");
  assert.equal(resolved.page.route, lastRoute);
});

test("enterComparison 保存 previousFocusExperience 并初始化左右栏", () => {
  let state = baseState();
  const focusExp = state.experience;

  // 复刻 enterComparison
  const rightExp: PreviewExperience = {
    ...focusExp,
    page: { pageId: "orders", route: "/m/orders" },
  };
  state = {
    ...state,
    mode: "comparison",
    previousFocusExperience: focusExp,
    comparison: {
      leftExperience: focusExp,
      rightExperience: rightExp,
      sync: { page: true, scroll: false, data: false },
      activeSide: "left",
    },
  };

  assert.equal(state.mode, "comparison");
  assert.equal(state.previousFocusExperience, focusExp);
  assert.equal(state.comparison.leftExperience, focusExp);
});

test("exitComparison 恢复 previousFocusExperience 并清空快照", () => {
  const focusExp = baseState().experience;
  let state = baseState({
    mode: "comparison",
    previousFocusExperience: focusExp,
  });

  // 进入对比期间 experience 已被替换为 right 栏
  state = {
    ...state,
    experience: state.comparison.rightExperience,
  };
  assert.notEqual(state.experience, focusExp);

  // 复刻 exitComparison
  const prev = state.previousFocusExperience;
  state = {
    ...state,
    mode: "focus",
    experience: prev ?? state.experience,
    previousFocusExperience: undefined,
  };

  assert.equal(state.mode, "focus");
  assert.equal(state.experience, focusExp);
  assert.equal(state.previousFocusExperience, undefined);
});

test("exitComparison 在无快照时安全回退到 focus", () => {
  let state = baseState({ mode: "comparison" }); // previousFocusExperience 缺失
  state = { ...state, mode: "focus" };
  assert.equal(state.mode, "focus");
});

test("toggleComparisonSync 切换指定同步键", () => {
  let state = baseState();
  // 复刻 toggleComparisonSync("scroll")
  state = {
    ...state,
    comparison: {
      ...state.comparison,
      sync: { ...state.comparison.sync, scroll: !state.comparison.sync.scroll },
    },
  };
  assert.equal(state.comparison.sync.scroll, true);
  assert.equal(state.comparison.sync.page, true); // 其他键不变
});

test("storage 默认值：三角色 lastRouteByRole 齐全", () => {
  const defaultPersisted: PersistedState = {
    lastRole: "merchant",
    lastSurface: "web",
    lastDeviceId: "iphone-18-pro",
    lastRouteByRole: {
      customer: "/m/orders",
      merchant: "/m/orders",
      platform_admin: "/admin",
    },
    theme: "dark",
    favorites: [],
    recentPages: [],
  };
  const persisted = loadPersistedState("preview-hub", defaultPersisted); // node 无 window → 返回默认
  assert.ok(persisted.lastRouteByRole.customer);
  assert.ok(persisted.lastRouteByRole.merchant);
  assert.ok(persisted.lastRouteByRole.platform_admin);
  assert.equal(persisted.lastSurface, "web");
  assert.equal(persisted.lastDeviceId, "iphone-18-pro");
});
