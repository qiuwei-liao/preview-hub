"use client";

// Preview Hub — Web Surface 渲染器
// iframe 加载 config.iframeBaseUrl + experience.page.route，按设备型号绘制设备壳。
//
// 【iframe 持久化策略】
//   - src 只用于首次加载；之后 hub 切换页面通过 postMessage(preview:set-route)
//     让 iframe 内部做 Next.js 客户端导航，不再通过改 src 重建 iframe。
//   - iframe key 只依赖 device.id，切换设备才重建 iframe。
//   - 这样 iframe 的浏览器历史栈、滚动位置、表单状态都能保留，
//     router.back() 等依赖历史栈的操作在预览环境下也能正常工作。
//   - iframeRouteRef 跟踪 iframe 实际当前路由，用于去重：防止 iframe 上报
//     route-changed → hub 更新 route → 又反向发 set-route 造成循环。
//
// 横竖屏：device.orientation 为 landscape 且 rotatable 时交换视口宽高。

import { useCallback, useEffect, useRef, useState } from "react";
import type { PreviewDevice, PreviewExperience } from "../types";
import { COLOR_FILTERS } from "../types";
import { listenPreviewMessages, sendToIframe } from "./bus";
import { usePreviewHubConfig } from "../config/context";
import { usePreviewState } from "../state/use-preview-state";
import { useHmrWatcher } from "../hooks/use-hmr-watcher";

const BROWSER_TOOLBAR_H = 38;

/** 设备壳材质渐变映射：钛金属偏冷灰、铝合金偏银、玻璃偏亮、塑料偏哑光 */
const MATERIAL_GRADIENTS: Record<string, string> = {
  titanium: "linear-gradient(145deg,#3a3d42,#1a1c20 60%,#0c0d10)",
  aluminum: "linear-gradient(145deg,#4a4d52,#2a2d33 60%,#14161a)",
  glass: "linear-gradient(145deg,#52555a,#2e3138 50%,#181a1e)",
  plastic: "linear-gradient(145deg,#2a2d33,#14161a 60%,#0c0d10)",
};

function getDeviceFrameGradient(device: PreviewDevice): string {
  return MATERIAL_GRADIENTS[device.material ?? "plastic"] ?? MATERIAL_GRADIENTS.plastic;
}

/** 有效视口：横屏交换宽高（desktop 不可旋转，恒原值） */
export function effectiveViewport(device: PreviewDevice) {
  const { orientation, rotatable, viewport } = device;
  if (orientation === "landscape" && rotatable) {
    return { width: viewport.height, height: viewport.width };
  }
  return viewport;
}

/** 设备壳外尺寸（含边框 / 浏览器地址栏），供 Canvas 计算缩放 */
export function getDeviceOuterSize(device: PreviewDevice): {
  width: number;
  height: number;
} {
  const viewport = effectiveViewport(device);
  if (device.frame === "browser") {
    return { width: viewport.width, height: viewport.height + BROWSER_TOOLBAR_H };
  }
  return {
    width: viewport.width + device.bezel * 2,
    height: viewport.height + device.bezel * 2,
  };
}

export interface SurfaceRendererProps {
  experience: PreviewExperience;
  readOnly: boolean;
  onRouteChange?: (route: string) => void;
  onReady?: () => void;
  on401?: () => void;
  /** iframe 加载完成时上报 contentWindow，供 hub 注册广播 */
  onIframeReady?: (win: Window) => void;
  /** iframe 内滚动位置变化时上报（对比模式同步用） */
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
}

export function WebRenderer({
  experience,
  readOnly,
  onRouteChange,
  onReady,
  on401,
  onIframeReady,
  onScroll,
}: SurfaceRendererProps) {
  const config = usePreviewHubConfig();
  const { state } = usePreviewState();
  const { device } = experience;
  const iframeBaseUrl = config.iframeBaseUrl ?? "";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  // 实时预览：HMR 编译完成后自动刷新 iframe
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  // HMR 监听：代码编译完成时触发自动刷新
  const { connected: hmrConnected } = useHmrWatcher({
    baseUrl: iframeBaseUrl,
    enabled: autoRefresh && !loading,
    onUpdate: () => {
      // 显示"已更新"提示
      setShowUpdateToast(true);
      setTimeout(() => setShowUpdateToast(false), 2000);
      // 刷新 iframe（保留当前路由）
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.location.reload();
      }
    },
  });

  // 颜色无障碍滤镜
  const colorFilterCss = COLOR_FILTERS[state.colorFilter]?.css ?? "none";

  // —— iframe 持久化相关 ref ——
  const prevDeviceIdRef = useRef(device.id);
  const initialRouteRef = useRef(experience.page.route);
  const iframeRouteRef = useRef(experience.page.route);
  // 用于跟踪上一个设备 id，检测设备切换（用于 loading 重置和提示）
  const lastDeviceIdRef = useRef(device.id);

  // 切换设备时重置初始路由（渲染期间赋值，确保 src 正确；React 官方支持的模式）
  if (prevDeviceIdRef.current !== device.id) {
    prevDeviceIdRef.current = device.id;
    initialRouteRef.current = experience.page.route;
    iframeRouteRef.current = experience.page.route;
  }

  // 设备切换提示状态
  const [showDeviceToast, setShowDeviceToast] = useState(false);

  // 设备切换时：重置 loading 状态（iframe 会因 key 变化而重建），并显示切换提示
  useEffect(() => {
    // 跳过首次渲染
    if (lastDeviceIdRef.current === device.id) return;
    
    // 更新跟踪
    lastDeviceIdRef.current = device.id;
    
    // 重置 loading 状态，显示"加载中"
    setLoading(true);
    
    // 显示设备切换提示（加载完成后也会显示短暂提示）
    setShowDeviceToast(true);
    const timer = setTimeout(() => setShowDeviceToast(false), 2000);
    return () => clearTimeout(timer);
  }, [device.id]);

  // src 固定为初始路由，后续导航走 postMessage
  const src = iframeBaseUrl + initialRouteRef.current;

  const viewport = effectiveViewport(device);
  const isBrowser = device.frame === "browser";
  const outer = getDeviceOuterSize(device);
  const isTablet = device.family === "tablet";
  const isLandscape = device.orientation === "landscape" && device.rotatable;

  // 状态栏高度：统一取 device.safeArea.top（横屏时 iOS 隐藏顶部状态栏）
  const statusBarH = isLandscape ? 0 : (device.safeArea?.top ?? 0);

  // 状态栏主题：默认深色（大多数页面是深色模式），通过 iframe MutationObserver 实时同步
  const [statusBarDark, setStatusBarDark] = useState(true);

  // 状态栏时间：模拟 iOS 实时时间（30s 刷新）
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);

  // 状态栏颜色 tokens（透明背景，文字颜色随页面主题切换）
  const sbBg = "transparent";
  const sbText = statusBarDark ? "#fff" : "#111";
  const sbIconColor = statusBarDark ? "#fff" : "#111";

  // 状态栏时间：iOS 格式（无 leading zero，如 "9:41"）
  const statusTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  // iframe 内导航上报：更新本地路由跟踪 + 通知 hub（只做显示同步）
  const handleRouteChange = useCallback(
    (route: string) => {
      iframeRouteRef.current = route;
      onRouteChange?.(route);
    },
    [onRouteChange],
  );

  // iframe 消息路由：只处理本渲染器 iframe 的消息
  useEffect(() => {
    const unlisten = listenPreviewMessages((msg, source) => {
      if (source !== iframeRef.current?.contentWindow) return;
      if (msg.type === "preview:ready") {
        if (msg.route) {
          iframeRouteRef.current = msg.route;
          onRouteChange?.(msg.route);
        }
        onReady?.();
      } else if (msg.type === "preview:route-changed") {
        if (msg.route) handleRouteChange(msg.route);
      } else if (msg.type === "preview:401") {
        on401?.();
      } else if (msg.type === "preview:get-safe-area") {
        // 应用侧挂载完成后主动请求安全区（onLoad 推送可能早于 React 挂载而丢失）
        if (source) sendSafeArea(source);
      } else if (msg.type === "preview:set-status-bar-theme") {
        // 应用上报当前页面主题，切换状态栏颜色
        setStatusBarDark(!!msg.dark);
      } else if (msg.type === "preview:get-scroll") {
        onScroll?.(msg.scrollTop ?? 0, msg.scrollLeft ?? 0);
      }
    });
    return unlisten;
  }, [handleRouteChange, onReady, on401, onScroll]);

  // hub 主动切换页面：通过 postMessage 让 iframe 客户端导航，不重建 iframe
  useEffect(() => {
    const targetRoute = experience.page.route;
    if (targetRoute === iframeRouteRef.current) return;
    const win = iframeRef.current?.contentWindow;
    if (!win || loading) return;
    iframeRouteRef.current = targetRoute;
    sendToIframe(win, { type: "preview:set-route", route: targetRoute });
  }, [experience.page.route, loading]);

  // 只读指令同步给 iframe
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (win) sendToIframe(win, { type: "preview:set-readonly", enabled: readOnly });
  }, [readOnly, src, loading]);

  const handleLoad = () => {
    setLoading(false);
    onReady?.();
    const win = iframeRef.current?.contentWindow;
    if (win) {
      onIframeReady?.(win);
      // 立即注入 safe-area
      sendSafeArea(win);
      // 延迟多次注入，确保页面 React 挂载完成后能接收到（解决时序问题）
      // 页面可能在 iframe load 后才挂载 PreviewBridge，导致第一次注入丢失
      [100, 300, 500].forEach((delay) => {
        setTimeout(() => {
          const w = iframeRef.current?.contentWindow;
          if (w) sendSafeArea(w);
        }, delay);
      });
    }
  };

  // 直接监听 iframe 内 <html> 的 dark class 变化（同源 iframe 可访问），
  // 实时同步状态栏主题，不依赖 postMessage 时序（next-themes 可能在 hydration 后才设置 class）。
  useEffect(() => {
    if (loading) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: MutationObserver | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const syncTheme = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const isDark = doc.documentElement.classList.contains("dark");
        setStatusBarDark(isDark);
      } catch {
        // 跨域时无法访问，停止轮询
        if (pollTimer) clearInterval(pollTimer);
      }
    };

    // 立即同步一次
    syncTheme();

    // MutationObserver 监听 class 变化
    try {
      const doc = iframe.contentDocument;
      if (doc) {
        observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.attributeName === "class") {
              syncTheme();
              break;
            }
          }
        });
        observer.observe(doc.documentElement, { attributes: true, attributeFilter: ["class"] });
      }
    } catch {
      // 跨域时回退到轮询
    }

    // 兜底轮询：每 500ms 检查一次（防止 MutationObserver 因某些原因没触发）
    pollTimer = setInterval(syncTheme, 500);

    return () => {
      if (observer) observer.disconnect();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [loading, device.id]);

  // 设备切换时同步安全区（iframe 重建由 key 触发 load，这里兜底已挂载的 iframe）
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (win) sendSafeArea(win);
  }, [device]);

  /** 把设备安全区注入被预览页面（iframe 内 env(safe-area-*) 恒为 0）。
      top 恒为 0：顶部已由设备壳状态栏占据，页面 iframe 从状态栏下方开始；
      bottom 注入 Home 指示条避让高度；
      left/right 横屏时避让灵动岛/摄像头侧；
      dpr 注入设备像素比。 */
  function sendSafeArea(win: Window) {
    // 直接使用 device.safeArea，确保与原渲染器行为完全一致
    const sa = device.safeArea ?? { top: 0, bottom: 0 };
    const isLandscape = device.orientation === "landscape";
    sendToIframe(win, {
      type: "preview:set-safe-area",
      top: 0,
      bottom: isLandscape ? 0 : sa.bottom,
      left: isLandscape ? (sa.left ?? 44) : (sa.left ?? 0),
      right: isLandscape ? (sa.right ?? 0) : (sa.right ?? 0),
      dpr: device.dpr ?? 2,
    });
  }

  // ——— 浏览器壳（desktop）———
  if (isBrowser) {
    return (
      <div
        style={{
          width: outer.width,
          height: outer.height,
          borderRadius: device.frameRadius,
          overflow: "hidden",
          background: "#1e1e24",
          boxShadow:
            "0 0 0 2px #3d4148, 0 0 0 5px rgba(0,0,0,0.55), 0 40px 80px rgba(0,0,0,0.6)",
          position: "relative",
          transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: BROWSER_TOOLBAR_H,
            background: "#2d2d35",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <div
            style={{
              flex: 1,
              height: 22,
              background: "#1a1a1f",
              borderRadius: 6,
              marginLeft: 8,
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              color: "#a5b4c2",
              fontSize: 11,
            }}
          >
            {src}
          </div>
        </div>
        <div style={{ filter: colorFilterCss }}>
          {renderIframe(viewport.width, viewport.height)}
        </div>
      </div>
    );
  }

  // ——— 手机 / 平板壳 ———
  return (
    <div
      style={{
        width: outer.width,
        height: outer.height,
        borderRadius: device.frameRadius,
        background: getDeviceFrameGradient(device),
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.08), 0 0 0 2px #2a2d33, 0 0 0 5px rgba(0,0,0,0.5), 0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)",
        position: "relative",
        // 设备切换过渡动画：尺寸 + 圆角 + 背景平滑过渡
        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.35s ease, background 0.3s ease",
        flexShrink: 0,
      }}
    >
      {/* 天线带（顶部/底部塑料隔断，iPhone 标志性设计） */}
      {!isTablet && !isLandscape && (
        <>
          <div style={{ position: "absolute", top: device.bezel * 0.4, left: "18%", right: "18%", height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
          <div style={{ position: "absolute", bottom: device.bezel * 0.4, left: "18%", right: "18%", height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
        </>
      )}

      {/* 侧边按键（立体凹陷效果，按视口高度比例定位） */}
      {!isTablet && (
        <>
          {/* 静音键（短） */}
          <div style={{
            position: "absolute", left: -2, top: viewport.height * 0.16, width: 3, height: 26,
            background: "linear-gradient(90deg,#2a2d33,#4a4d52,#2a2d33)",
            borderRadius: "2px 0 0 2px",
            boxShadow: "inset -1px 0 0 rgba(255,255,255,0.1), -1px 0 2px rgba(0,0,0,0.4)",
          }} />
          {/* 音量+ */}
          <div style={{
            position: "absolute", left: -2, top: viewport.height * 0.22, width: 3, height: 48,
            background: "linear-gradient(90deg,#2a2d33,#4a4d52,#2a2d33)",
            borderRadius: "2px 0 0 2px",
            boxShadow: "inset -1px 0 0 rgba(255,255,255,0.1), -1px 0 2px rgba(0,0,0,0.4)",
          }} />
          {/* 音量- */}
          <div style={{
            position: "absolute", left: -2, top: viewport.height * 0.29, width: 3, height: 48,
            background: "linear-gradient(90deg,#2a2d33,#4a4d52,#2a2d33)",
            borderRadius: "2px 0 0 2px",
            boxShadow: "inset -1px 0 0 rgba(255,255,255,0.1), -1px 0 2px rgba(0,0,0,0.4)",
          }} />
          {/* 电源键 */}
          <div style={{
            position: "absolute", right: -2, top: viewport.height * 0.26, width: 3, height: 72,
            background: "linear-gradient(270deg,#2a2d33,#4a4d52,#2a2d33)",
            borderRadius: "0 2px 2px 0",
            boxShadow: "inset 1px 0 0 rgba(255,255,255,0.1), 1px 0 2px rgba(0,0,0,0.4)",
          }} />
        </>
      )}
      {isTablet && (
        <>
          <div style={{ position: "absolute", left: -2, top: viewport.height * 0.15, width: 3, height: 56, background: "linear-gradient(90deg,#2a2d33,#4a4d52,#2a2d33)", borderRadius: "2px 0 0 2px" }} />
          <div style={{ position: "absolute", right: -2, top: viewport.height * 0.15, width: 3, height: 56, background: "linear-gradient(270deg,#2a2d33,#4a4d52,#2a2d33)", borderRadius: "0 2px 2px 0" }} />
        </>
      )}

      {/* 底部物理细节（USB-C 口 + 扬声器格栅 + 麦克风孔，仅竖屏手机） */}
      {!isTablet && !isLandscape && (
        <div style={{
          position: "absolute",
          bottom: 2,
          left: 0,
          right: 0,
          height: device.bezel - 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}>
          {/* 左侧扬声器格栅（6 个圆孔） */}
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "#0a0a0c", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.8)" }} />
            ))}
          </div>
          {/* USB-C 接口 */}
          <div style={{
            width: 32, height: 8,
            background: "linear-gradient(180deg,#0a0a0c,#1a1c20)",
            borderRadius: 4,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.05)",
          }} />
          {/* 右侧扬声器格栅（6 个圆孔） */}
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "#0a0a0c", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.8)" }} />
            ))}
          </div>
        </div>
      )}

      {/* 屏幕区 */}
      <div
        style={{
          position: "absolute",
          left: device.bezel,
          top: device.bezel,
          width: viewport.width,
          height: viewport.height,
          borderRadius: device.screenRadius,
          overflow: "hidden",
          background: "#f7f7f9",
          filter: colorFilterCss,
        }}
      >
        {/* 顶部状态栏（iOS 精确复刻：透明背景，内容对齐底部，灵动岛机型无电池百分比、无5G文字） */}
        {statusBarH > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: statusBarH,
              background: sbBg,
              zIndex: 10,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              padding: "0 24px 8px",
            }}
          >
            {/* 左侧时间（iOS 格式：SF Pro Display Semibold，无 leading zero） */}
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: sbText,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: 0.1,
                lineHeight: "18px",
                fontFamily: "-apple-system, SF Pro Display, SF Pro Text, system-ui, sans-serif",
              }}
            >
              {statusTime}
            </span>
            {/* 右侧系统图标：蜂窝信号 + WiFi + 电池（灵动岛机型只显示图标，无百分比数字） */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, height: 18 }}>
              <SignalBarsIOS color={sbIconColor} />
              <WifiGlyph color={sbIconColor} />
              <BatteryGlyphPure color={sbIconColor} percent={82} />
            </div>
          </div>
        )}

        {/* 页面 iframe（从状态栏下方开始） */}
        <div
          style={{
            position: "absolute",
            top: statusBarH,
            left: 0,
            width: viewport.width,
            height: viewport.height - statusBarH,
          }}
        >
          {renderIframe(viewport.width, viewport.height - statusBarH)}
        </div>

        {/* 灵动岛（纯黑挖空胶囊，竖屏顶部居中，横屏右侧居中旋转90°） */}
        {device.frame === "dynamic-island" && (
          <div
            style={{
              position: "absolute",
              top: isLandscape ? "50%" : 11,
              left: isLandscape ? "auto" : "50%",
              right: isLandscape ? 11 : "auto",
              transform: isLandscape
                ? "translateY(-50%) rotate(90deg)"
                : "translateX(-50%)",
              width: device.dynamicIsland?.width ?? 126,
              height: device.dynamicIsland?.height ?? 37,
              borderRadius: (device.dynamicIsland?.height ?? 37) / 2,
              background: "#000",
              pointerEvents: "none",
              zIndex: 11,
            }}
          />
        )}
        {/* 打孔摄像头（竖屏顶部居中，横屏右侧居中） */}
        {device.frame === "punch-hole" && (
          <div
            style={{
              position: "absolute",
              top: isLandscape ? "50%" : 14,
              left: isLandscape ? "auto" : "50%",
              right: isLandscape ? 16 : "auto",
              transform: isLandscape ? "translateY(-50%)" : "translateX(-50%)",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#000",
              pointerEvents: "none",
              zIndex: 11,
            }}
          />
        )}
        {/* Home 指示条（竖屏底部居中，横屏底部居中且宽度适配） */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: isLandscape ? 160 : isTablet ? 160 : 134,
            height: 4,
            borderRadius: 2,
            background: statusBarDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.32)",
            pointerEvents: "none",
            zIndex: 11,
          }}
        />
      </div>
    </div>
  );

  function renderIframe(w: number, h: number) {
    return (
      <>
        <iframe
          key={device.id}
          ref={iframeRef}
          src={src}
          title={device.model}
          onLoad={handleLoad}
          style={{
            width: w,
            height: h,
            border: 0,
            display: "block",
            background: "#fff",
            // 渲染精度优化：确保高 DPR 屏幕上清晰，亚像素对齐
            imageRendering: "auto",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        />
        {/* 实时预览：代码已更新提示 */}
        {showUpdateToast && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: 6,
              pointerEvents: "none",
              animation: "fadeInDown 0.3s ease",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
            代码已更新
          </div>
        )}
        {/* 实时预览：HMR 连接状态指示器（右上角小圆点） */}
        {autoRefresh && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: hmrConnected ? "#4ade80" : "#fbbf24",
              zIndex: 99,
              pointerEvents: "none",
              opacity: 0.7,
            }}
            title={hmrConnected ? "实时预览已连接" : "正在连接 dev server..."}
          />
        )}
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#f5f6f7",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: 13,
              color: "#6b7280",
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            {/* 加载动画：三个跳动的圆点 */}
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#9ca3af",
                    animation: `previewHubPulse 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontWeight: 500 }}>
              正在加载 {device.model}…
            </span>
          </div>
        )}
        {/* 设备切换提示（不重建 iframe，只显示短暂提示） */}
        {showDeviceToast && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: 6,
              pointerEvents: "none",
              animation: "fadeInDown 0.3s ease",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa" }} />
            已切换到 {device.model}
          </div>
        )}
        {/* 加载动画 keyframes */}
        <style>{`
          @keyframes previewHubPulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </>
    );
  }
}

// ─── 状态栏系统图标（iOS 精确样式） ───

/** iOS 蜂窝信号：4 个不同高度的圆角方块（满格） */
function SignalBarsIOS({ color = "#111" }: { color?: string }) {
  const heights = [4, 7, 10, 13];
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 4.5}
          y={13 - h}
          width={3}
          height={h}
          rx={0.8}
          fill={color}
        />
      ))}
    </svg>
  );
}

/** Wi-Fi：双弧 + 圆点（iOS 样式） */
function WifiGlyph({ color = "#111" }: { color?: string }) {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden>
      <path
        d="M1.5 4.3a10.5 10.5 0 0 1 14 0"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M4.2 6.9a7 7 0 0 1 8.6 0"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="9.9" r="1.5" fill={color} />
    </svg>
  );
}

/** 电池：纯图标（灵动岛机型状态栏样式，无百分比数字） */
function BatteryGlyphPure({ color = "#111", percent = 82 }: { color?: string; percent?: number }) {
  const fillWidth = Math.max(0, Math.min(100, percent)) * 0.2; // 20px 宽度的电池
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={color} strokeOpacity="0.4" />
      <rect x="2" y="2" width={fillWidth} height="7" rx="1.8" fill={color} />
      <path d="M23 3.5v5a1.8 1.8 0 0 0 0-5z" fill={color} fillOpacity="0.4" />
    </svg>
  );
}

/** 电池：带百分比数字（兼容旧调用） */
function BatteryWithPercent({ color = "#111", percent = 82 }: { color?: string; percent?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color, fontVariantNumeric: "tabular-nums" }}>
        {percent}%
      </span>
      <BatteryGlyphPure color={color} percent={percent} />
    </div>
  );
}

/** 兼容旧调用：纯电池图标 */
function BatteryGlyph({ color = "#111" }: { color?: string }) {
  return <BatteryWithPercent color={color} percent={82} />;
}

/** 兼容旧调用：旧信号格 */
function SignalBars({ color = "#111" }: { color?: string }) {
  return <SignalBarsIOS color={color} />;
}
