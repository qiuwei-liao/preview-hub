// 最小配置示例：2 个角色 + 3 个页面 + 1 个环境 + App 载体
// 复制到你自己的项目后，把 route 改成你实际的页面路径。

import type { PreviewHubConfig, PageDef, RoleDef } from "@preview-hub/core";

// 1) 定义你有哪些页面
const pages: PageDef[] = [
  {
    id: "home",
    title: "首页",
    roles: ["user", "admin"],
    web: { route: "/" },
    app: { route: "/" },
  },
  {
    id: "profile",
    title: "个人中心",
    roles: ["user", "admin"],
    web: { route: "/profile" },
    app: { route: "/profile" },
  },
  {
    id: "admin",
    title: "管理后台",
    roles: ["admin"],
    web: { route: "/admin" },
  },
];

// 2) 定义你有哪些角色
const roles: RoleDef[] = [
  { id: "user", label: "普通用户", description: "看首页和个人中心" },
  { id: "admin", label: "管理员", description: "可访问管理后台" },
];

// 3) 组装配置
export const minimalConfig: PreviewHubConfig = {
  pages,
  roles,
  environments: [
    {
      id: "dev",
      label: "开发环境",
      origin: "http://localhost:3000",
    },
  ],
  // App 载体底部导航（可选，不传则隐藏 App 载体）
  app: {
    tabbar: [
      { pageId: "home", label: "首页", icon: "home" },
      { pageId: "profile", label: "我的", icon: "mine" },
    ],
  },
  // 可选：不实现登录时用 NoopAuthAdapter（已内置）
  // auth: new NoopAuthAdapter(),
};
