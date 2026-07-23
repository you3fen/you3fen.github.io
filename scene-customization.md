# 场景可改性清单

最后审计：2026-07-24

## 证据与结论边界

本清单直接检查了三个 GLB 的 JSON chunk、accessor、node/mesh 关系，以及以下运行时代码：

- `src/Application/sources.ts`
- `src/Application/Utils/BakedModel.ts`
- `src/Application/World/Environment.ts`
- `src/Application/World/Computer.ts`
- `src/Application/World/Decor.ts`
- `src/Application/World/CoffeeSteam.ts`

仓库没有 `.blend`、独立材质文件或原始灯光场景，因此能确认“哪个 mesh 使用哪张外部烘焙图”，但不能从现有文件精确反推出每个物件向其他表面投下的阴影由哪个 Blender bake pass 产生。下面对残影的判断按保守口径记录。

## 全局事实

- 三个 GLB 共 18 个 node、18 个 mesh；每个 node 唯一指向一个 mesh，node 之间没有父子层级。
- GLB 内不含 material、texture 或 image；每个 mesh 都有 `TEXCOORD_0`。
- `BakedModel` 在运行时忽略 GLB 默认材质，按组创建一个共享的 `THREE.MeshBasicMaterial`，把一张外部 JPG 同时赋给组内所有 mesh。
- 三组模型统一放大 900 倍。GLB node 没有单独的平移/旋转/缩放，物件位置已经写进顶点坐标。
- 烘焙贴图都是 4096×4096：
  - World：`static/models/World/baked_environment.jpg`
  - Computer：`static/models/Computer/baked_computer.jpg`
  - Decor：运行时使用 `static/models/Decor/baked_decor_modified.jpg`
- `static/models/Decor/baked_decor.jpg` 是保留的上游版本，当前运行时不引用。
- Computer 的 `monitor_base`、`computer`、`keyboard`、`mouse` 以及 Decor 的 `paper` 还有 `TEXCOORD_1`，但当前 `MeshBasicMaterial.map` 只读取 `TEXCOORD_0`。
- World 的 `desk` 带 `COLOR_0`，但当前共享材质没有启用 vertex colors，因此它不参与最终颜色。
- 因为每组当前共用同一个 material，直接修改 `mesh.material.color` 会让整组一起变色。逐件换色前必须先为目标 mesh clone material。

代价等级：

- 低：少量代码、无需新资产；
- 中：需要独立材质、定位 UV/对齐或多视角回归；
- 高：需要新模型、图集重绘或重建灯光并重新烘焙。

## World / 环境

GLB：`static/models/World/environment.glb`

| 物件（node → mesh） | 几何 | 独立 mesh | 光影烘焙 | 隐藏 | 换色 | 替换 |
|---|---:|---|---|---|---|---|
| `Background` → `Cube` | 972 顶点 / 1,598 三角面 | 是；但房间背景被合并为一件 | `baked_environment.jpg` / UV0 | 代码低、视觉代价高：整间背景消失 | 中：clone 材质后只能整体 tint；要分别改墙、地面需改图集 | 高：相当于重做环境壳并匹配原烘焙 |
| `desk` → `Cube.009` | 466 / 304 | 是；桌体内部仍是合并几何 | 同上 | 代码低；电脑和 Decor 会悬空，接触阴影可能残留 | 中到高：整体 tint 容易，保留木色细节的指定换色需编辑 UV 图集 | 高：新桌需匹配所有桌面物件位置与接触阴影 |
| `chair_base` → `Cube.002` | 1,176 / 952 | 是 | 同上 | 低；座面会悬空，地面阴影可能残留 | 中：可独立 tint，精确颜色需重绘/重烘焙 | 中到高：可独立替换，但需对齐座面和地面 |
| `chair_seat` → `Cube.004` | 749 / 770 | 是 | 同上 | 低；底座仍保留 | 中：可独立 tint，原明暗已烘焙 | 中到高：可独立替换，但需对齐底座 |

## Computer / 电脑桌设备

GLB：`static/models/Computer/computer_setup.glb`

| 物件（node → mesh） | 几何 | 独立 mesh | 光影烘焙 | 隐藏 | 换色 | 替换 |
|---|---:|---|---|---|---|---|
| `monitor_base` → `monitor01b.001_Cube.002` | 329 / 300 | 是 | `baked_computer.jpg` / UV0 | 中：几何可直接隐藏，但 CSS3D iframe、遮挡平面和屏幕特效不会随它消失，需联动 `MonitorScreen` | 中：clone 材质可 tint；铭牌与阴影也会一起变色 | 高：必须重新对齐屏幕尺寸、位置、旋转、遮挡层和镜面层 |
| `computer` → `computer01b.001_Cube.018` | 254 / 348 | 是 | 同上 | 低；线缆可能变成孤立物 | 中：整体 tint 可行；设备铭牌已在图集像素中 | 中到高：几何可换，但要处理线缆和桌面接触关系 |
| `keyboard` → `keyboard01b.001_Cube.021` | 1,944 / 2,742 | 是 | 同上 | 低；桌面接触阴影可能残留 | 中到高：简单 tint 会同时染按键字符，精确换色需改 UV 图集 | 中到高：可独立替换，需手工对齐桌面角度和尺寸 |
| `mouse` → `mouse01b.001_Cube.012` | 78 / 100 | 是 | 同上 | 低；桌面接触阴影可能残留 | 中：clone 材质后可 tint | 中：独立且几何简单，但需匹配尺度与桌面位置 |
| `cables` → `computer01_cables2.001_CUNurbsPath.009` | 545 / 766 | 是 | 同上 | 低；会丢失整组线缆 | 中：可 tint，但只能整组线缆一起变 | 高：多根线已合成一个 mesh，新线缆需重新走线和贴合设备 |

## Decor / 摆件

GLB：`static/models/Decor/decor.glb`

| 物件（node → mesh） | 几何 | 独立 mesh | 光影烘焙 | 隐藏 | 换色 | 替换 |
|---|---:|---|---|---|---|---|
| `binder_1` → `Cube.035` | 231 / 194 | 是 | `baked_decor_modified.jpg` / UV0 | 低；桌面阴影可能残留 | 中：clone 材质后整体 tint | 中：位置已写入顶点，替换物需手工对齐 |
| `coffee` → `Cylinder.003` | 857 / 1,080 | 是 | 同上 | 中：杯子可隐藏，但还必须停用独立的 `CoffeeSteam` shader plane | 中：杯体、杯内和烘焙明暗会一起 tint | 中到高：换杯本身可行；要匹配蒸汽、接触阴影和原光照需额外工作 |
| `paper` → `Cube.013` | 4 / 2 | 是；单张平面 | 同上；另有未使用的 UV1 | 低：可直接移除桌面致谢纸；桌面阴影可能残留 | 高：原致谢文字是图集像素，tint 不能改字 | 低到中：几何最简单，可换成新平面与独立贴图 |
| `paper_holder_bottom` → `Cube.012` | 234 / 164 | 是 | 同上 | 低；上半部会悬空 | 中：clone 材质后可 tint | 中：需与 top 和纸堆重新对齐 |
| `paper_stack_1` → `Cube.019` | 112 / 100 | 是；与 `paper_stack_2` 只共享 index accessor，不共享 mesh | 同上 | 低 | 中：clone 材质后可 tint | 中：独立替换可行，需匹配堆叠高度 |
| `paper_stack_2` → `Cube.011` | 112 / 100 | 是；见上 | 同上 | 低 | 中：clone 材质后可 tint | 中：同上 |
| `plant` → `Cylinder.008` | 1,071 / 1,134 | 是；盆与植株在一个 mesh 内 | 同上 | 低；地面/墙面阴影可能残留 | 中到高：只能让盆和植株一起 tint；分开换色需改 mesh 或图集 | 高：形体复杂，且最容易暴露原环境中的烘焙阴影残留 |
| `paper_holder_top` → `Cube.005` | 234 / 164 | 是；与 bottom 只共享 index accessor | 同上 | 低；下半部仍保留 | 中：clone 材质后可 tint | 中：需与 bottom 和纸堆重新对齐 |
| `binder_2` → `Cube.001` | 231 / 194 | 是 | 同上 | 低；桌面阴影可能残留 | 中：clone 材质后整体 tint | 中：与 `binder_1` 相同 |

## 后续逐件改造的安全顺序

1. 先按 node name 获取目标 mesh，并 clone material，避免影响同组其他物件。
2. 做“仅隐藏”的 A/B 截图，检查桌面、地面、墙面是否留下接触阴影或颜色残影。
3. 替换时先用独立材质和独立贴图，不复用整组共享 material。
4. 按 GLB 原始坐标放置，再统一应用场景的 900 倍尺度；不要假设 node 自带 transform。
5. 桌面物件优先检查 World 的 `desk` 烘焙，落地物件优先检查 `Background` 烘焙。
6. 只有在多视角对比通过后再考虑改共享图集；理想路径仍是取得/重建 Blender 场景并重新烘焙。
