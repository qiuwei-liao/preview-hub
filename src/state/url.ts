// Preview Hub — URL 工具：Deep Link 构建与解析
// 业务页面不手工拼字符串，统一用此工具。
// preview 路由路径可配（默认 "/preview"）。

import type { PreviewRole, PreviewSurface } from "../types";

export interface PreviewUrlParams {
  role?: PreviewRole;
  surface?: PreviewSurface;
  pageId?: string;
  deviceId?: string;
  route?: string;
}

/** 构建 Deep Link URL；previewRoutePath 默认为 "/preview" */
export function buildPreviewUrl(
  params: PreviewUrlParams,
  previewRoutePath: string = "/preview",
): string {
  const search = new URLSearchParams();
  if (params.role) search.set("role", params.role);
  if (params.surface) search.set("surface", params.surface);
  if (params.pageId) search.set("pageId", params.pageId);
  if (params.deviceId) search.set("device", params.deviceId);
  if (params.route) search.set("route", params.route);
  const qs = search.toString();
  return qs ? `${previewRoutePath}?${qs}` : previewRoutePath;
}

/** 解析 URL query（location.search）为 Partial state；兼容旧参数名 deviceId */
export function parsePreviewUrl(
  search: string,
): Partial<PreviewUrlParams> {
  const params = new URLSearchParams(search);
  const result: Partial<PreviewUrlParams> = {};

  const role = params.get("role");
  if (role) result.role = role;

  const surface = params.get("surface");
  if (surface === "web" || surface === "mini_program") {
    result.surface = surface;
  }

  const pageId = params.get("pageId");
  if (pageId) result.pageId = pageId;

  // 兼容 device / deviceId 两种参数名
  const deviceId = params.get("device") ?? params.get("deviceId");
  if (deviceId) result.deviceId = deviceId;

  const route = params.get("route");
  if (route) result.route = route;

  return result;
}
