// Preview Hub 2.0 — URL Deep Link 测试
// 运行：node --import tsx --test src/lib/preview/__tests__/url.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildPreviewUrl, parsePreviewUrl } from "../url";

test("buildPreviewUrl 生成正确 query string", () => {
  const url = buildPreviewUrl({
    role: "merchant",
    surface: "web",
    pageId: "orders",
    deviceId: "iphone-18-pro",
  });
  assert.equal(
    url,
    "/preview?role=merchant&surface=web&pageId=orders&device=iphone-18-pro",
  );
});

test("buildPreviewUrl 包含 route", () => {
  const url = buildPreviewUrl({ role: "customer", route: "/m/order" });
  assert.equal(url, "/preview?role=customer&route=%2Fm%2Forder");
});

test("parsePreviewUrl 正确解析各参数", () => {
  const parsed = parsePreviewUrl(
    "?role=customer&surface=mini_program&pageId=order&device=android-360",
  );
  assert.deepEqual(parsed, {
    role: "customer",
    surface: "mini_program",
    pageId: "order",
    deviceId: "android-360",
  });
});

test("parsePreviewUrl 兼容旧参数名 deviceId", () => {
  const parsed = parsePreviewUrl("?deviceId=pc-1440&pageId=home");
  assert.equal(parsed.deviceId, "pc-1440");
  assert.equal(parsed.pageId, "home");
});

test("build → parse 往返一致（role/surface/pageId/deviceId）", () => {
  const params = {
    role: "platform_admin" as const,
    surface: "web" as const,
    pageId: "admin-merchants",
    deviceId: "desktop-1920",
  };
  const built = buildPreviewUrl(params);
  const search = built.slice("/preview".length); // "?..."
  const parsed = parsePreviewUrl(search);
  assert.deepEqual(parsed, params);
});

test("缺省参数不出现在 URL 中", () => {
  assert.equal(buildPreviewUrl({}), "/preview");
  assert.equal(buildPreviewUrl({ role: "customer" }), "/preview?role=customer");
  assert.equal(
    buildPreviewUrl({ surface: "mini_program" }),
    "/preview?surface=mini_program",
  );
});

test("parsePreviewUrl 丢弃非法 surface 值（role 为开放值不做白名单）", () => {
  const parsed = parsePreviewUrl(
    "?role=hacker&surface=tv&pageId=orders&device=ipad-11",
  );
  assert.deepEqual(parsed, { role: "hacker", pageId: "orders", deviceId: "ipad-11" });
});

test("parsePreviewUrl 支持 app surface", () => {
  const parsed = parsePreviewUrl("?surface=app&pageId=orders");
  assert.deepEqual(parsed, { surface: "app", pageId: "orders" });
  assert.equal(buildPreviewUrl({ surface: "app" }), "/preview?surface=app");
});

test("空 search 解析为空对象", () => {
  assert.deepEqual(parsePreviewUrl(""), {});
  assert.deepEqual(parsePreviewUrl("?"), {});
});
