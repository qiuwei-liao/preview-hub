# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 语义化版本。

## [Unreleased]

### Added
- 初始开源化准备：独立 package、peerDeps 声明、完整 README/ARCHITECTURE
- 内置多设备（desktop / mobile / tablet）与多载体（web / miniprogram）渲染
- iframe 同源通信总线（`sendToIframe` / `listenPreviewMessages` / `sendToHub`）
- 只读保护机制（`enableReadOnlyGuard`）
- URL 状态同步（`buildPreviewUrl` / `parsePreviewUrl`）
- 页面与设备注册表工厂（`createPageRegistry` / `createDeviceRegistry`）

### Notes
- 独立开源版本：零业务依赖，所有业务通过 `PreviewHubConfig` 注入。
- 已发布为 `@preview-hub/core`，可通过 npm / GitHub Packages 安装。
