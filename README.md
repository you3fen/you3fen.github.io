# 三分 · 私人陈列

三分的个人网站：做过的工具、跑过的路，以及那些没有完成的念头。

线上地址：[yousanfen.com](https://yousanfen.com/)

首页的三件概念物件分别进入半马经历、bench-scout 和 TextLens。每件收藏都有独立的静态网址，支持刷新、直接分享和浏览器前进后退。正文无需 JavaScript 即可阅读；脚本只负责明暗偏好。

## 开发与验证

使用 Node.js 24：

```bash
npm ci
npm run dev
```

开发服务器仅监听 `127.0.0.1`，地址以命令输出为准。编辑页面片段、模板或样式后会重新编译并刷新。

```bash
npm run build
npm test
```

构建产物为 `public/`，不入库。测试检查静态路由、站内链接、资源、域名文件和体积边界；真实浏览验收还应覆盖手机、键盘、文字放大、无 JavaScript、明暗跨页保存与返回。

## 内容与素材

- `src/collection/*.html`：首页、三件收藏、关于页及 404 正文。
- `src/index.html`：共用页头、导航、页脚与 metadata。
- `src/collection.css`、`src/collection.js`：样式与明暗切换。
- `bundler/webpack.common.js`：路由、标题、描述及发布资源白名单。
- `static/collection/objects.jpg`：为本站创作的 AI 概念物件图，三件物品共享一次下载。不是纪实照片或硬件产品图。
- [设计与素材说明](docs/collection-design.md)：认可方向、内容依据、图像来源及维护约定。

新增收藏时同步增加正文片段、构建路由、首页入口和 `static/sitemap.xml`，再执行构建与验证。

## 本地参考与评价（2026-09-12）

运行 `npm run design:dev`，打开 http://127.0.0.1:4173/references/ 。当前阶段是收集真实网站参考并由用户评价；第一轮五套自制候选已被全部否定，停止继续制作，尚未确定新的设计和内容架构。

参考页收录 8 个真实网站或交互实验，链接到原站，可分别评价画面、动效、光标互动并填写感受。评价保存在当前浏览器，可复制到对话中；没有对外发送、分析或预填偏好。截图仅帮助辨认原站，实际手感以原站为准。来源见每张卡片和 `experiments/motion-lab/references/data.json`。

`experiments/motion-lab/` 不进入生产构建。原五套试验仍可通过旧路径访问；[此前设计记录](docs/motion-lab-design.md)是已否定方案的历史记录。需要对照现有网站时先执行一次 `npm run build`，再访问 `/current/`。

本地服务只监听 `127.0.0.1`，默认端口 4173，可通过 `DESIGN_PORT` 覆盖。按 Ctrl+C 停止。下一步先根据用户评分补充参考，再讨论设计；信息架构另行收集实例后比较。

## 发布

只推送用户自己的 `origin`。`main` 的 push 触发 GitHub Pages 工作流：安装依赖 → 构建 → 测试 → 发布 `public/`。域名继续使用 `static/CNAME` 中的 `yousanfen.com`。

[当前实现说明](CURRENT_STATE.md)记录本版架构和验收范围。
