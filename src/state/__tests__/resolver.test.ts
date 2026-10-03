// Preview Hub 2.0 — Resolver 纯逻辑测试
// 运行：pnpm test（node --import tsx --test src/state/__tests__/*.test.ts）

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  getDefaultDeviceForSurface,
  getPageRoute,
  isValidSurfaceDevice,
  resolvePreviewExperience,
} from "../resolver";
import type { ResolverRegistries } from "../resolver";
import { createPageRegistry } from "../../registry/page";
import { createDeviceRegistry } from "../../registry/device";
import type { PageDef, PreviewExperience } from "../../types";

// ─── 测试页面表：覆盖 web / mini_program / app 三种载体 ───
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
    app: { route: "/app/ai" },
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

// 构造一个完整的 defaults Experience（避免触发可选链缺 device 的边界）
function baseDefaults(over: Partial<PreviewExperience> = {}): PreviewExperience {
  return {
    role: "merchant",
    surface: "web",
    device: registries.devices.getDeviceById("iphone-18-pro")!,
    page: { pageId: "orders", route: "/m/orders" },
    ...over,
  };
}

test("mini_program + desktop 被自动修正为 mobile 默认设备", () => {
  const exp = resolvePreviewExperience(
    { surface: "mini_program", deviceId: "pc-1440", role: "customer" },
    undefined,
    registries,
  );
  assert.equal(exp.surface, "mini_program");
  assert.equal(exp.device.family, "mobile");
  assert.equal(
    exp.device.id,
    getDefaultDeviceForSurface("mini_program", registries.devices).id,
  );
});

test("mini_program + tablet 被拒绝并修正为 mobile", () => {
  const exp = resolvePreviewExperience(
    { surface: "mini_program", deviceId: "ipad-11", role: "merchant" },
    undefined,
    registries,
  );
  assert.equal(exp.device.family, "mobile");
  assert.notEqual(exp.device.id, "ipad-11");
});

test("app surface 支持 mobile / tablet，拒绝 desktop", () => {
  const mobile = resolvePreviewExperience(
    { surface: "app", deviceId: "iphone-18-pro", role: "merchant" },
    undefined,
    registries,
  );
  assert.equal(mobile.device.id, "iphone-18-pro");

  const tablet = resolvePreviewExperience(
    { surface: "app", deviceId: "ipad-11", role: "merchant" },
    undefined,
    registries,
  );
  assert.equal(tablet.device.id, "ipad-11");

  const desktop = resolvePreviewExperience(
    { surface: "app", deviceId: "pc-1440", role: "merchant" },
    undefined,
    registries,
  );
  assert.notEqual(desktop.device.id, "pc-1440");
  assert.equal(desktop.device.family === "desktop", false);
});

test("web surface 允许 mobile / tablet / desktop 任意设备族", () => {
  for (const deviceId of ["iphone-18-pro", "ipad-11", "desktop-1920"]) {
    const exp = resolvePreviewExperience(
      { surface: "web", deviceId },
      undefined,
      registries,
    );
    assert.equal(exp.device.id, deviceId, `web 应保留设备 ${deviceId}`);
  }
});

test("isValidSurfaceDevice：mini_program 仅 mobile；app 支持 mobile/tablet；web 全部合法", () => {
  const iphone = registries.devices.getDeviceById("iphone-18-pro")!;
  const ipad = registries.devices.getDeviceById("ipad-11")!;
  const pc = registries.devices.getDeviceById("pc-1440")!;
  assert.equal(isValidSurfaceDevice("mini_program", iphone), true);
  assert.equal(isValidSurfaceDevice("mini_program", ipad), false);
  assert.equal(isValidSurfaceDevice("mini_program", pc), false);
  assert.equal(isValidSurfaceDevice("app", iphone), true);
  assert.equal(isValidSurfaceDevice("app", ipad), true);
  assert.equal(isValidSurfaceDevice("app", pc), false);
  assert.equal(isValidSurfaceDevice("web", ipad), true);
  assert.equal(isValidSurfaceDevice("web", pc), true);
});

test("role 切换时从 defaults 恢复该 role 的 lastRoute", () => {
  // 模拟切到 customer：state 把 customer 的上次 route 作为 defaults 传入
  const defaults = baseDefaults({
    role: "customer",
    page: { pageId: "orders", route: "/m/orders" },
  });
  const exp = resolvePreviewExperience({ role: "customer" }, defaults, registries);
  assert.equal(exp.role, "customer");
  assert.equal(exp.page.pageId, "orders");
  assert.equal(exp.page.route, "/m/orders");
});

test("surface 切换保持 pageId，并解析到对端 surface 的 route", () => {
  // web orders → mini_program orders：pageId 不变，route 换成小程序映射
  const exp = resolvePreviewExperience(
    { role: "customer", surface: "mini_program", pageId: "orders" },
    undefined,
    registries,
  );
  assert.equal(exp.page.pageId, "orders");
  assert.equal(exp.page.route, "/pages/demo/orders/orders");

  // web orders → app orders：route 换成 App 映射
  const appExp = resolvePreviewExperience(
    { role: "customer", surface: "app", pageId: "orders" },
    undefined,
    registries,
  );
  assert.equal(appExp.page.pageId, "orders");
  assert.equal(appExp.page.route, "/app/orders");
});

test("pageId 在当前 surface 无 route → 降级到该 surface 第一个可用页面", () => {
  // customers 仅有 web 路由；切到 mini_program 时不可用，应降级
  const exp = resolvePreviewExperience(
    { role: "customer", surface: "mini_program", pageId: "customers" },
    undefined,
    registries,
  );
  const expected = getPageRoute(exp.page.pageId, "mini_program", registries.pages);
  assert.ok(expected, "降级后必须有小程序路由");
  assert.notEqual(exp.page.pageId, "customers");

  // customers 切到 app 同样不可用，应降级到该 role 的第一个 app 页面
  const appExp = resolvePreviewExperience(
    { role: "merchant", surface: "app", pageId: "customers" },
    undefined,
    registries,
  );
  const appExpected = getPageRoute(appExp.page.pageId, "app", registries.pages);
  assert.ok(appExpected, "降级后必须有 App 路由");
  assert.notEqual(appExp.page.pageId, "customers");
});

test("resolvePreviewExperience 优先级：显式传入 > defaults > 系统默认", () => {
  const defaults = baseDefaults({
    page: { pageId: "orders", route: "/m/orders" },
  });
  // 1. 显式传入（Deep Link 同时带 pageId + route）覆盖 defaults 的 orders
  const deepLink = resolvePreviewExperience(
    { pageId: "ai", route: "/m/ai" },
    defaults,
    registries,
  );
  assert.equal(deepLink.page.pageId, "ai");
  assert.equal(deepLink.page.route, "/m/ai");

  // 2. 无传入时回退 defaults
  const fromDefaults = resolvePreviewExperience({}, defaults, registries);
  assert.equal(fromDefaults.page.pageId, "orders");

  // 3. 连 defaults 也没有 → 系统默认
  const bare = resolvePreviewExperience({ role: "merchant" }, undefined, registries);
  assert.ok(registries.pages.getPageById(bare.page.pageId), "裸解析应得到合法 pageId");
});

test("role 不支持的 surface（platform_admin + mini_program）→ surface 降级 web", () => {
  const exp = resolvePreviewExperience(
    { role: "platform_admin", surface: "mini_program" },
    undefined,
    registries,
  );
  assert.equal(exp.role, "platform_admin");
  assert.equal(exp.surface, "web");
  // platform_admin 在 web 下第一个可用页面是控制台
  assert.equal(exp.page.pageId, "admin-dashboard");
});

test("role 不支持的 surface（platform_admin + app）→ surface 降级 web", () => {
  const exp = resolvePreviewExperience(
    { role: "platform_admin", surface: "app" },
    undefined,
    registries,
  );
  assert.equal(exp.surface, "web");
  assert.equal(exp.page.pageId, "admin-dashboard");
});

test("getPageRoute：返回对应 surface 的路由，缺失返回 undefined", () => {
  assert.equal(getPageRoute("orders", "web", registries.pages), "/m/orders");
  assert.equal(
    getPageRoute("orders", "mini_program", registries.pages),
    "/pages/demo/orders/orders",
  );
  assert.equal(getPageRoute("orders", "app", registries.pages), "/app/orders");
  assert.equal(getPageRoute("customers", "mini_program", registries.pages), undefined);
  assert.equal(getPageRoute("customers", "app", registries.pages), undefined);
  assert.equal(getPageRoute("not-exist", "web", registries.pages), undefined);
});

test("同一路由只反查为一个业务页，并兼容旧 home 页面 ID", () => {
  assert.equal(registries.pages.getPageIdByRoute("/m/me", "web", "merchant"), "me");
  assert.equal(registries.pages.getPageById("home")?.id, "me");
  assert.equal(
    resolvePreviewExperience({ role: "merchant", pageId: "home" }, undefined, registries)
      .page.pageId,
    "me",
  );
});

test("未知 deviceId 回退到 surface 默认设备", () => {
  const exp = resolvePreviewExperience(
    { surface: "web", deviceId: "no-such-device" },
    undefined,
    registries,
  );
  assert.equal(exp.device.id, "iphone-18-pro");
});
