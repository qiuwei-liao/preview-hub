// Preview Hub 2.0 — Resolver 纯逻辑测试
// 运行：node --import tsx --test src/lib/preview/__tests__/resolver.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  getDefaultDeviceForSurface,
  getPageRoute,
  isValidSurfaceDevice,
  resolvePreviewExperience,
} from "../resolver";
import { getDeviceById, getPageById, getPageIdByRoute } from "../registry";
import type { PreviewExperience } from "../types";

// 构造一个完整的 defaults Experience（避免触发可选链缺 device 的边界）
function baseDefaults(over: Partial<PreviewExperience> = {}): PreviewExperience {
  return {
    role: "merchant",
    surface: "web",
    device: getDeviceById("iphone-18-pro")!,
    page: { pageId: "orders", route: "/m/orders" },
    ...over,
  };
}

test("mini_program + desktop 被自动修正为 mobile 默认设备", () => {
  const exp = resolvePreviewExperience({
    surface: "mini_program",
    deviceId: "pc-1440",
    role: "customer",
  });
  assert.equal(exp.surface, "mini_program");
  assert.equal(exp.device.family, "mobile");
  assert.equal(exp.device.id, getDefaultDeviceForSurface("mini_program").id);
});

test("mini_program + tablet 被拒绝并修正为 mobile", () => {
  const exp = resolvePreviewExperience({
    surface: "mini_program",
    deviceId: "ipad-11",
    role: "merchant",
  });
  assert.equal(exp.device.family, "mobile");
  assert.notEqual(exp.device.id, "ipad-11");
});

test("web surface 允许 mobile / tablet / desktop 任意设备族", () => {
  for (const deviceId of ["iphone-18-pro", "ipad-11", "desktop-1920"]) {
    const exp = resolvePreviewExperience({ surface: "web", deviceId });
    assert.equal(exp.device.id, deviceId, `web 应保留设备 ${deviceId}`);
  }
});

test("isValidSurfaceDevice：mini_program 仅 mobile；web 全部合法", () => {
  const iphone = getDeviceById("iphone-18-pro")!;
  const ipad = getDeviceById("ipad-11")!;
  const pc = getDeviceById("pc-1440")!;
  assert.equal(isValidSurfaceDevice("mini_program", iphone), true);
  assert.equal(isValidSurfaceDevice("mini_program", ipad), false);
  assert.equal(isValidSurfaceDevice("mini_program", pc), false);
  assert.equal(isValidSurfaceDevice("web", ipad), true);
  assert.equal(isValidSurfaceDevice("web", pc), true);
});

test("role 切换时从 defaults 恢复该 role 的 lastRoute", () => {
  // 模拟切到 customer：state 把 customer 的上次 route 作为 defaults 传入
  const defaults = baseDefaults({
    role: "customer",
    page: { pageId: "orders", route: "/m/orders" },
  });
  const exp = resolvePreviewExperience({ role: "customer" }, defaults);
  assert.equal(exp.role, "customer");
  assert.equal(exp.page.pageId, "orders");
  assert.equal(exp.page.route, "/m/orders");
});

test("surface 切换保持 pageId，并解析到对端 surface 的 route", () => {
  // web orders → mini_program orders：pageId 不变，route 换成小程序映射
  const exp = resolvePreviewExperience({
    role: "customer",
    surface: "mini_program",
    pageId: "orders",
  });
  assert.equal(exp.page.pageId, "orders");
  assert.equal(exp.page.route, "/pages/demo/orders/orders");
});

test("pageId 在当前 surface 无 route → 降级到该 surface 第一个可用页面", () => {
  // customers 仅有 web 路由；切到 mini_program 时不可用，应降级
  const exp = resolvePreviewExperience({
    role: "customer",
    surface: "mini_program",
    pageId: "customers",
  });
  const expected = getPageRoute(exp.page.pageId, "mini_program");
  assert.ok(expected, "降级后必须有小程序路由");
  assert.notEqual(exp.page.pageId, "customers");
});

test("resolvePreviewExperience 优先级：显式传入 > defaults > 系统默认", () => {
  const defaults = baseDefaults({
    page: { pageId: "orders", route: "/m/orders" },
  });
  // 1. 显式传入（Deep Link 同时带 pageId + route）覆盖 defaults 的 orders
  const deepLink = resolvePreviewExperience(
    { pageId: "ai", route: "/m/ai" },
    defaults,
  );
  assert.equal(deepLink.page.pageId, "ai");
  assert.equal(deepLink.page.route, "/m/ai");

  // 2. 无传入时回退 defaults
  const fromDefaults = resolvePreviewExperience({}, defaults);
  assert.equal(fromDefaults.page.pageId, "orders");

  // 3. 连 defaults 也没有 → 系统默认
  const bare = resolvePreviewExperience({ role: "merchant" });
  assert.ok(getPageById(bare.page.pageId), "裸解析应得到合法 pageId");
});

test("role 不支持的 surface（platform_admin + mini_program）→ surface 降级 web", () => {
  const exp = resolvePreviewExperience({
    role: "platform_admin",
    surface: "mini_program",
  });
  assert.equal(exp.role, "platform_admin");
  assert.equal(exp.surface, "web");
  // platform_admin 在 web 下第一个可用页面是控制台
  assert.equal(exp.page.pageId, "admin-dashboard");
});

test("getPageRoute：返回对应 surface 的路由，缺失返回 undefined", () => {
  assert.equal(getPageRoute("orders", "web"), "/m/orders");
  assert.equal(getPageRoute("orders", "mini_program"), "/pages/demo/orders/orders");
  assert.equal(getPageRoute("customers", "mini_program"), undefined);
  assert.equal(getPageRoute("not-exist", "web"), undefined);
});

test("同一路由只反查为一个业务页，并兼容旧 home 页面 ID", () => {
  assert.equal(getPageIdByRoute("/m/me", "web", "merchant"), "me");
  assert.equal(getPageById("home")?.id, "me");
  assert.equal(
    resolvePreviewExperience({ role: "merchant", pageId: "home" }).page.pageId,
    "me",
  );
});

test("未知 deviceId 回退到 surface 默认设备", () => {
  const exp = resolvePreviewExperience({
    surface: "web",
    deviceId: "no-such-device",
  });
  assert.equal(exp.device.id, "iphone-18-pro");
});
