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
- **App 载体**：`PreviewSurface` 新增 `"app"`；新增 `AppRenderer` / `AppShell`（iOS 原生导航栏 + 底部 TabBar + Home 指示条）；`PageDef` 新增 `app.route`；`config.app.tabbar` 配置底部导航；支持 mobile / tablet 设备族
- 测试套件可运行：新增 `pnpm test`（tsx + node:test），修复旧测试文件路径与 API 适配，补充 App 载体用例

### Notes
- 独立开源版本：零业务依赖，所有业务通过 `PreviewHubConfig` 注入。
- 已发布为 `@qiuwei-liao/preview-hub`，可通过 npm / GitHub Packages 安装。
