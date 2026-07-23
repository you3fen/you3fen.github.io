# CURRENT_STATE

最后更新：2026-07-24

## 当前状态

- 项目根目录：`~/sanfen-site`
- 上游基线：`henryjeff/portfolio-website` 的 `c53c5a5`
- 目标仓库：`https://github.com/you3fen/you3fen.github.io`
- 目标站点：`https://you3fen.github.io/`
- 本地状态：`npm ci`、生产构建、桌面浏览器与 390×844 手机视口交互验收均已通过
- 线上状态：已部署并完成桌面/手机浏览器验收；GitHub Pages 状态为 `built`
- Pages 配置：`build_type=workflow`、HTTPS 强制开启、`cname=null`
- 自定义域名：未配置；没有创建 `CNAME`，没有改动 `yousanfen.com` 或阿里云 DNS

## 内层系统

### 当前交付

- 开发分支：`inner-dev`，由 `main@8388a4e` 创建；未合并到 `main`。
- 实现位置：`static/inner/`；原生 ES Modules + CSS，无运行时依赖、无单独构建步骤。
- M1 窗口引擎（`94ea216`）：拖动、关闭、最小化、最大化、z-order、任务栏恢复。
- M2 系统骨架（`d7745c9`）：SFBIOS 呼应式引导、桌面图标、开始菜单、分钟时钟。
- M3 应用外壳（`dada860`）：关于我、项目、简历、设置；主题预设、自定义桌面色、12–18px 字号均可实时调整并在本机持久化。
- M4 回收站（`be9d10c`）：保留 TextLens 与 clip-montage 两个已删除项目，以及“`先给人用,再优化`”彩蛋。
- M5 响应式（`7b91009`）：外壳屏幕尺寸保留浮动多窗口；手机切换为单窗口全屏，任务栏在内部横向滚动。
- M6 打磨（`013432e`）：像素细节、程序实时合成且可关闭的提示音、减少后台定时唤醒、拖动期按需合成层。
- 外壳事件桥完整保留：`mousemove`、`mousedown`、`mouseup`、`keydown`、`keyup` 仍同源转发给 parent。

### 本地预览

只看内层系统：

```bash
cd ~/sanfen-site
python3 -m http.server 8766 --bind 127.0.0.1 --directory static
```

打开 `http://127.0.0.1:8766/inner/`。如端口已占用，可替换为其他本地端口。

连同 3D 外壳预览：

```bash
cd ~/sanfen-site
npm run dev
```

以 webpack-dev-server 实际输出的本地地址为准。

### 已完成验证

- 每个里程碑均在桌面视口和 390×844 手机设备视口实际打开、交互并检查控制台。
- 额外在 1248×992 外壳近似屏幕尺寸验证浮动窗口布局；无页面横向溢出。
- 窗口拖动、层级、关闭、最小化/恢复、最大化、桌面图标、开始菜单、任务时钟和设置持久化均通过。
- 手机上窗口占满任务栏以上区域；3 个以上已开任务只滚动任务列表，不挤压开始按钮与时钟。
- 回收站两个对象及指定彩蛋文案逐字核对通过。
- 五类 parent 事件桥均在浏览器中实际收到。
- 程序合成提示音已实测生成；静音后不再生成音符，重新启用后恢复。
- 内层系统无外部请求、无音频文件；页面运行资产约 114KB（不含验收文档）。一次本地冷加载记录为 `load≈26ms`、0 个 long task。
- `npm run build` 通过；`public/inner/` 生成 9 个文件、约 105KiB（含 `SELFTEST.md`）。仅保留外壳大资源已有的 3 类 webpack performance warning。

### 来源与版权

- HTML、JavaScript、CSS、文案和 CSS 像素图标均为本次原创。
- 视觉方向只参考本机自有样例 `B-复古桌面98.html`；未把样例文件或其内容打包进站点。
- 第三方内层资源：无。字体仅使用系统字体栈，无 CDN、无外部字体、无追踪脚本。
- 未查看、引用或复制 `henryjeff/portfolio-inner-site` 的代码或资源。

### 已知问题

- 关于我、项目、简历仍是占位内容；尚未接入正式简历 PDF、项目链接或联系方式。
- 手机布局刻意固定为单窗口全屏；最大化按钮仍保留桌面一致的状态语义，视觉上不会缩回浮动窗。
- 浏览器自动播放策略可能让提示音在首次用户点击前保持静音；设置与任务栏均可关闭声音。
- 只持久化主题、字号和声音偏好；窗口位置、开关状态在刷新后复位。
- 外壳源码中的 iframe 辅助标题仍含“占位页”字样；本轮按硬边界未修改 `src/`。

### 明确未做

- 未补正式个人内容、真实下载、外部跳转、还原或清空回收站动作。
- 未修改 `src/`、Pages workflow、DNS、域名或其他项目。
- 未合并或部署到 `main`；线上站点仍是本轮开始前的版本。

次日人工验收见 `static/inner/SELFTEST.md`。

## 外壳阶段改动（历史）

1. 将页面 title、description、Open Graph、Twitter Card、canonical URL、加载界面和信息浮层替换为“三分 / SANFEN”。
2. 删除原站 Google Analytics 标识，避免继续向原作者的统计属性发送访问数据。
3. 将电脑屏幕 iframe 从外部站点改为同仓库的 `static/inner/index.html`。
4. 当时新增极简占位页并保留鼠标和键盘事件桥接；该占位页现已在 `inner-dev` 被上面的内层系统替换。
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
- 线上桌面：`https://you3fen.github.io/` 在 1280×720 下完成同一套加载、进屏幕和拖动验收。
- 线上手机：同一地址在 390×844、DPR 2 下完成同一套验收；本次带设备仿真的首次完整加载约 75 秒，之后受 GitHub Pages CDN 缓存影响会更快。
- 线上 HTTP：GitHub Pages 返回 HTTP/2 200，HTTPS 与 HSTS 生效。
- 首次生产 workflow：GitHub Actions run `30034514240`，build 52 秒、deploy 10 秒，结论为 `success`。

## 已知限制

- 生产 artifact 约 91 MiB，其中约 37 MiB 是上游显示器噪点视频；webpack 会给出资源体积告警。本阶段为了保持原视觉和音效不做压缩或裁剪。
- 2022 年代码仍保留部分旧 API 与依赖，但当前锁定组合可以在 Node.js 24 上干净安装、开发和构建。
- GitHub 当前官方 Pages actions 在 runner 上会产生“Node.js 20 已弃用、强制用 Node.js 24 运行”的 annotation；官方推荐版本仍为 `configure-pages@v5`、`upload-pages-artifact@v4`、`deploy-pages@v4`，本次构建与部署均成功。

## 明确未做

- 未把 `inner-dev` 的内层系统合并或部署到 `main`；
- 未修改场景风格、模型摆件、相机或烘焙光影；
- 未绑定 `yousanfen.com`；
- 未改动阿里云或任何 DNS；
- 未加入新的分析、广告或追踪脚本。
