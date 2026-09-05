# 私人陈列：设计与素材说明

## 确认的方向

2026-09-05，用户看过六个真实参考作品后，对 Archive of Us 的物件展示感兴趣，认为 Stripe Press 的陈列也可以；不喜欢手作拼贴、数字花园式图文、卡通和拟物桌面。随后认可了本项目原创的「三分 · 私人陈列」可交互样稿。

正式版保留三个概念物件、中文宋体标题、克制留白、温和浅色与石墨深色、点击进入详情的浏览方式。没有移植参考网站代码或素材。

## 首批内容的依据

内容取自 `static/inner/index.html` 原有公开自述，保留历史事实，不将旧文的当前状态直接沿用：

- 跑步：两次半程马拉松，最好成绩 1:48:37。
- bench-scout：参考内容整理进可搜索筛选的飞书表格；承认更早的 Coze 方案来自他人，自己的重做补入重试、去重和限流。
- TextLens：Mac 截图翻译器，多轮打磨没有进入真实使用，后来删除；保留“先证明需求，再补打磨”的经验。
- 关于页：沿用已认可的样稿文案，不补写个人联系方式、职业头衔、年龄或实时生活状态。

## 图像

`static/collection/objects.jpg` 为本次使用 Codex 内置图像生成工具制作并选择的原创概念视觉。JPEG 是生成 PNG 的网页编码版本，2172 × 724；三个物件在页面中使用同一张图像的不同区域，不需要下载三次。

号码布不是用户真实号码布的照片；琥珀色数据匣是软件的物理比喻，不是 bench-scout 硬件；笔记本是未完成想法的概念物件。此区别在访客可读的关于页及详情中明确标注。

生成提示：

> Use case: product-mockup. Create ONE original panoramic museum still-life photograph for a Chinese personal website visual concept. Wide landscape composition, approximately 3:1 aspect ratio. Three carefully art-directed objects spaced evenly in three equal vertical thirds; each object fully contained in its own third with generous surrounding empty space so the thirds can be displayed as separate specimen panels in a responsive website. Consistent matte very light warm grey background and floor (#f2f1ed), no horizon line. Left third: a used off-white Tyvek half-marathon race bib, slightly curved, minimalist vermilion red top stripe, printed large black number '21.1', a small silver safety pin attached, standing on a low transparent acrylic museum plinth. Middle third: a translucent amber rectangular data cartridge, small industrial aluminum fasteners, faint internal circuitry, tiny black label 'bench-scout', standing upright on a clear acrylic museum plinth. Right third: a dark graphite fabric-covered thin notebook with a red cloth page marker, gently worn corners, no text or graphics, displayed on a low clear acrylic plinth. Straight-on slightly elevated three-quarter view, 70mm catalog photography, objects comparable visual weight, filling middle 65 percent height of each third, no overlap between thirds. Soft daylight from upper left, delicate contact shadows and acrylic refraction, museum conservation photography, natural material texture. Conceptual still-life, not historical documentation. Avoid collage, doodles, cartoon, clay rendering, neon, glossy app aesthetics, excessive props, frames, decorative borders, people, labels outside objects, website UI and watermarks.

## 维护

优先补充真实条目的文字和获准公开的素材。新内容至少应有完整文字，才能成为首页入口；不要为凑展品数量编造经历。物件可以继续用明确标注的原创概念图，也可以换成用户提供并确认公开的实物照片。

旧版 `/inner/` 作为独立历史入口保留。当前首页不加载旧外壳，也不把旧场景资源复制到部署目录。
