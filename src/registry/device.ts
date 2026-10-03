// Preview Hub — Device Registry 工厂
// 基于 config.devices 创建查询函数；未传入设备列表时使用内置 DEFAULT_DEVICES。

import type { DeviceFamily, PreviewDevice, PreviewSurface } from "../types";
import { DEFAULT_DEVICES } from "../config/defaults";

export interface DeviceRegistry {
  getDeviceById: (id: string) => PreviewDevice | undefined;
  getDevicesForFamily: (family: DeviceFamily) => PreviewDevice[];
  getDevicesForSurface: (surface: PreviewSurface) => PreviewDevice[];
  list: () => PreviewDevice[];
}

export function createDeviceRegistry(devices?: PreviewDevice[]): DeviceRegistry {
  const list = devices && devices.length > 0 ? devices : DEFAULT_DEVICES;

  function getDeviceById(id: string): PreviewDevice | undefined {
    return list.find((d) => d.id === id);
  }

  function getDevicesForFamily(family: DeviceFamily): PreviewDevice[] {
    return list.filter((d) => d.family === family);
  }

  function getDevicesForSurface(surface: PreviewSurface): PreviewDevice[] {
    if (surface === "mini_program") {
      return list.filter((d) => d.family === "mobile");
    }
    if (surface === "app") {
      // App 载体支持手机与平板，不提供桌面浏览器
      return list.filter((d) => d.family !== "desktop");
    }
    return list;
  }

  return {
    getDeviceById,
    getDevicesForFamily,
    getDevicesForSurface,
    list: () => list,
  };
}
