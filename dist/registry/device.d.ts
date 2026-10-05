import type { DeviceFamily, PreviewDevice, PreviewSurface } from "../types";
export interface DeviceRegistry {
    getDeviceById: (id: string) => PreviewDevice | undefined;
    getDevicesForFamily: (family: DeviceFamily) => PreviewDevice[];
    getDevicesForSurface: (surface: PreviewSurface) => PreviewDevice[];
    list: () => PreviewDevice[];
}
export declare function createDeviceRegistry(devices?: PreviewDevice[]): DeviceRegistry;
//# sourceMappingURL=device.d.ts.map