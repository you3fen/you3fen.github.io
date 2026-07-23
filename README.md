# 三分个人网站

这是三分个人网站的第一阶段：一个可交互的 Three.js 3D 场景外壳。电脑屏幕通过同源 iframe 加载仓库内的静态占位页；真正的“内层系统”不在本阶段范围内。

线上地址：<https://you3fen.github.io/>

## 本地开发

要求 Node.js 24。

```bash
npm ci
npm run dev
```

生产构建：

```bash
npm run build
```

构建产物位于 `public/`，该目录不入库。

## 部署

推送到 `main` 后，`.github/workflows/pages.yml` 会安装锁定依赖、执行生产构建，并把 `public/` 发布到 GitHub Pages。

## 项目文档

- [CURRENT_STATE.md](CURRENT_STATE.md)：当前状态、改动、残留痕迹、开发与部署方式
- [scene-customization.md](scene-customization.md)：18 个场景 mesh 的逐件可改性清单

## 开源来源与致谢

本项目的 3D 外壳基于 Henry Heffernan 的开源项目 [henryjeff/portfolio-website](https://github.com/henryjeff/portfolio-website)，依据 MIT License 使用与修改。原始版权与许可文本完整保留在 [LICENSE.md](LICENSE.md)。

当前项目与原作者不存在从属或官方关联；后续新增的内层系统由本项目自行实现。
