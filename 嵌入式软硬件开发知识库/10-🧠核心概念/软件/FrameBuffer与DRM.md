---
类型: 概念
tags: [概念,嵌入式Linux]
主题: FrameBuffer与DRM
创建: 2026-07-24
状态: 已完成
---
# FrameBuffer与DRM

## 一句话定义
FrameBuffer（fbdev）是 Linux 传统的图形显示接口，DRM（Direct Rendering Manager）是现代显示子系统框架，两者都管理显示输出但 DRM 功能更强。

## 它解决什么问题 / 为什么存在
应用需要往屏幕画图，但不同屏幕的接口（RGB/HDMI/MIPI）和控制器差异大。fbdev 提供一块内存映射让应用直接写像素，简单但不支持多图层、GPU 加速。DRM/KMS 支持多显示管线、图层合成、GPU、VSync，是现代嵌入式 Linux 显示的标准方案。

## 核心原理（大二能懂的水平）
fbdev（传统）：
- 驱动注册 fb_info，实现 fb_ops（fb_fillrect/fb_copyarea/fb_imageblit）
- 应用层：open("/dev/fb0") -> mmap -> 直接写帧缓冲
- 简单但功能有限，不支持硬件图层

DRM/KMS（现代）：
- DRM：管理 GPU 和显示缓冲
- KMS（Kernel Mode Setting）：管理显示管线（CRTC -> Encoder -> Connector）
- 驱动注册 drm_driver，实现 drm_mode_config_funcs
- 应用层：通过 libdrm 或 Wayland/EGL 使用
- 支持 VSync、多图层（plane）、硬件光标、GPU 加速

## 关键参数 / 易错点
- 新项目优先用 DRM，fbdev 是兼容方案
- DRM 概念多：framebuffer/plane/crtc/encoder/connector，理解显示管线后不难
- Qt 5.x+ 默认用 DRM/KMS（eglfs 或 linuxkms）
- 设备树中 display 节点配置分辨率、时序

## 类比（帮助理解）
fbdev 像直接往墙上画画（一块共享内存），DRM 像专业投影系统（多图层、合成、同步刷新）。

## 设计时怎么用（反推思维）
反推：嵌入式设备需要显示 -> 简单 UI 用 fbdev + Qt -> 需要 GPU 加速/多图层/视频叠加 -> 用 DRM/KMS -> 驱动实现对应框架接口。

## 典型应用
LCD 屏驱动、HDMI 输出、Qt 图形界面、摄像头预览叠加、视频播放。

## 关联
- 前置知识：[[Linux驱动与内核模块]]、[[设备树DeviceTree]]
- 相关：[[Pinctrl与GPIO子系统]]
- 扩展阅读：项目中 ch03-24.FrameBuffer 和 DRM、ch04-08.fb 应用实现

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch03-24, ch04-08; Linux DRM docs
