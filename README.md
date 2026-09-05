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

## 发布

只推送用户自己的 `origin`。`main` 的 push 触发 GitHub Pages 工作流：安装依赖 → 构建 → 测试 → 发布 `public/`。域名继续使用 `static/CNAME` 中的 `yousanfen.com`。

[当前实现说明](CURRENT_STATE.md)记录本版架构和验收范围。
