# CURRENT_STATE

最后更新：2026-07-24

## 当前状态

- 项目根目录：`~/sanfen-site`
- 上游基线：`henryjeff/portfolio-website` 的 `c53c5a5`
- 目标仓库：`https://github.com/you3fen/you3fen.github.io`
- 目标站点：`https://you3fen.github.io/`
- 本地状态：`npm ci`、生产构建、桌面浏览器与 390×844 手机视口交互验收均已通过
- 线上状态：待首次推送与 GitHub Pages 部署后更新
- 自定义域名：未配置；没有创建 `CNAME`，没有改动 `yousanfen.com` 或阿里云 DNS

## 本阶段改动

1. 将页面 title、description、Open Graph、Twitter Card、canonical URL、加载界面和信息浮层替换为“三分 / SANFEN”。
2. 删除原站 Google Analytics 标识，避免继续向原作者的统计属性发送访问数据。
3. 将电脑屏幕 iframe 从外部站点改为同仓库的 `static/inner/index.html`。
4. 新增极简占位页，正文为“`三分 · 内层系统建设中`”；保留鼠标和键盘事件桥接，使原场景的进出屏幕交互继续工作。
5. 移除未使用的邮件服务端及其 Express、CORS、邮件依赖；本项目当前是纯静态站。
6. 将包信息改为 `you3fen.github.io`、MIT，并用 `package-lock.json` 固定依赖。
7. 为旧 TypeScript 工具链固定兼容的 `@types/node`，避免 2026 年最新类型声明导致 2022 年项目无法编译。
8. 将静态复制插件、webpack CLI 与开发服务器升级到当前兼容版本，删除只用于打印局域网地址且带安全公告的 `ip` 包；开发服务器默认只监听 `127.0.0.1`。干净安装后的 `npm audit` 为 0。
9. 新增 GitHub Pages Actions 工作流；只构建并部署 `public/`。
10. 保留原 3D 几何、贴图、相机、光影、音频和交互，不做风格或摆件改造。
11. 用 lossless JPEG transform 清除了四张上游 JPG 中记录原作者本机路径的注释；解码像素 SHA-256 前后完全一致。

## 残留 Henry 痕迹

以下均为已知、刻意保留的来源证明或无法在不改视觉的前提下可靠移除的烘焙内容：

1. `LICENSE.md`：原 MIT 版权行，必须保留。
2. `README.md` 与内层占位页页脚：基于原开源项目的致谢与链接。
3. `static/models/Decor/baked_decor_modified.jpg`：桌面 `paper` mesh 使用的 4096×4096 烘焙图集中，致谢纸张像素已经包含 “Henry Heffernan Showcase 2022” 及原制作名单。
4. `static/models/Computer/baked_computer.jpg`：电脑组 4096×4096 烘焙图集的若干设备铭牌像素中包含 `Heffernan` 标记。
5. 上游 Git 历史：保留原作者提交记录，作为来源与演进证据；它不会出现在网站页面或元数据中。

仓库没有 Blender 源文件。上述第 3、4 项不是 HTML 文本、GLB node 名或独立材质标签，强行涂改图集容易损伤 UV 边缘、烘焙阴影和原视觉，因此本阶段不改。

后续的可靠处理方案是取得或重建 Blender 场景，以相同 UV、灯光、色彩管理和采样参数重新烘焙；次优方案是先在模型查看器中定位受影响 UV 岛，再对图集做分层、可回滚的局部修补并逐视角回归。桌面致谢纸也可在保留页面致谢的前提下，隐藏 `paper` mesh 并换成自建纸张模型，但这属于后续摆件改造。

## 本地开发

环境：

```text
Node.js 24.x
npm（随 Node.js 安装）
```

首次安装或锁文件变化后：

```bash
cd ~/sanfen-site
npm ci
```

开发服务器：

```bash
npm run dev
```

webpack-dev-server 会输出实际地址，通常为 `http://localhost:8080/`。如果 8080 已占用，会自动选择其他端口。

生产构建：

```bash
npm run build
```

输出目录是 `public/`。该目录由构建生成并被 `.gitignore` 排除。

## 部署方式

`.github/workflows/pages.yml` 在以下情况运行：

- `main` 分支收到 push；
- 在 GitHub Actions 页面手动触发。

流程固定为：

1. checkout；
2. 设置 Node.js 24；
3. `npm ci`；
4. `npm run build`；
5. 上传 `public/` 为 GitHub Pages artifact；
6. 部署到 `github-pages` environment。

站点使用 GitHub Pages 的 workflow 模式，不使用 `gh-pages` 分支，不提交 `public/`，也不配置自定义域名。

## 已完成验证

- `npm ci`：通过，637 个包按锁文件安装，`npm audit` 为 0。
- `npm run build`：通过；只有上游大体积资源的 webpack performance warning，无编译错误。
- `npm run dev`：通过，默认地址为 `http://localhost:8080/`。
- 桌面浏览器：3D 场景加载完成；点击 START 后可进入桌面视角；鼠标进入显示器后占位页可见；自由视角拖动后画面从桌前旋转到桌后。
- 手机浏览器仿真：390×844、DPR 2；场景加载完成；可进入显示器；占位页元素唯一且可见；自由视角拖动后画面发生对应旋转。
- 两轮浏览器控制台：0 error、0 warn。

## 已知限制

- 生产 artifact 约 91 MiB，其中约 37 MiB 是上游显示器噪点视频；webpack 会给出资源体积告警。本阶段为了保持原视觉和音效不做压缩或裁剪。
- 2022 年代码仍保留部分旧 API 与依赖，但当前锁定组合可以在 Node.js 24 上干净安装、开发和构建。

## 明确未做

- 未实现内层系统；
- 未修改场景风格、模型摆件、相机或烘焙光影；
- 未绑定 `yousanfen.com`；
- 未改动阿里云或任何 DNS；
- 未加入新的分析、广告或追踪脚本。
