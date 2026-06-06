# NOCTURNE 管理员后台 — AI 构建提示词

直接复制给 Claude Code，一条消息建完整个后台。

---

```
你是全栈电商工程师。基于已有的 NOCTURNE 情趣内衣独立站项目（Next.js 14 + Prisma + shadcn/ui + TailwindCSS），构建完整的管理员后台系统。

═══════════════════════════════════════
项目背景（已存在，不要重建）
═══════════════════════════════════════

品牌：NOCTURNE（暗黑奢华情趣内衣）
技术栈：Next.js 14 App Router + TypeScript + TailwindCSS + shadcn/ui + Prisma + Vercel Postgres
已有：前台页面、产品数据库、Collection/Category 模型、多语言（EN/FR/DE/ES/IT）

═══════════════════════════════════════
总体要求
═══════════════════════════════════════

1. 所有后台页面放在 /admin 路由下
2. 统一布局：左侧深色固定导航（#1A1817 底色）+ 右侧浅色内容区（#F6F2ED 底色）
3. 用 shadcn/ui 组件（Table、Dialog、Select、Tabs、Switch、Button、Input、Textarea 等）
4. 表格统一支持搜索、筛选、排序、分页
5. 所有表单有验证，提交后有 toast 反馈
6. 所有删除操作有二次确认弹窗
7. 加载状态有 skeleton
8. 空状态有提示文案
9. 登录用简单密码保护（环境变量 ADMIN_PASSWORD），不需要完整用户系统
10. 侧边栏导航项：Dashboard / Products / Orders / Reviews / Promotions（灰色占位）/ Customers（灰色占位）/ Settings（灰色占位）

═══════════════════════════════════════
模块一：数据看板 /admin
═══════════════════════════════════════

顶部 4 个指标卡片（一行排列，响应式 2x2）：
| 今日订单 | 本周收入 | 今日访问 | 待处理 |
| 数量+金额 | 金额+环比% | PV/UV | 待发货+待退款数 |

下半部分是近 7 天收入折线图（用 recharts 或简单 CSS 柱状图均可）+ TOP 5 热销产品列表。

数据从数据库实时查询。如果没有真实数据，显示"暂无数据"不要报错。

═══════════════════════════════════════
模块二：商品管理 /admin/products
═══════════════════════════════════════

【列表页】
表格列：缩略图(40px) | 商品名 | Collection | 分类 | 价格 | 库存 | 状态 | 操作
- 搜索：商品名
- 筛选：按 Collection、按分类、按状态（上架/草稿/下架）
- 排序：价格、库存、创建时间
- 批量操作：选中多行后可批量上架/下架
- 点击行进入编辑页
- 右上角"新建商品"按钮

【新建/编辑页】
使用 Tab 切换管理不同内容区块：

Tab 1 — 基本信息：
- 商品名：5 种语言的输入框（用 Tabs 切换 EN/FR/DE/ES/IT），每种语言独立 input
- Collection：下拉选择
- 分类：多选复选框（Bras / Briefs / Bodysuits / Chemises / Corsets / Hosiery / Robes / Suspenders / Harnesses / Self-Love / Accessories / Bridal）
- 价格(USD) + 划线原价（可选）
- Slug：自动从英文名生成，可手动改
- 状态：上架/草稿/下架 三选一
- 精选开关

Tab 2 — SKU 与库存（矩阵表格）：
- 颜色管理：可动态添加/删除颜色行（色块颜色选择器 + 颜色名称）
- 尺码列：XS / S / M / L / XL / 2XL / 3XL / 4XL
- 如果产品分类包含 "Bras"，自动增加罩杯维度：A / B / C / D / DD / E / F / G / H
- 矩阵 = 颜色(行) × 尺码(列)，每个格子是一个 SKU
- 每个 SKU 可设置：独立价格（默认继承基础价）、库存数量
- 支持批量填充：选中整行/整列统一设置价格或库存
- 每个 SKU 自动生成编码（格式：产品slug-颜色-尺码，如 violetta-red-M）

Tab 3 — 图片：
- 主图（必填，1 张）+ 附加图（最多 8 张）
- 上传组件：拖拽或点击上传
- 已上传图片可拖拽排序、点击删除
- 图片存储到 /public/uploads/products/（本地）或用 Vercel Blob
- 自动显示缩略图预览

Tab 4 — 描述：
- 简短描述：5 种语言
- 详细描述：5 种语言（textarea 即可，不需要富文本）
- 材质成分、洗涤说明：每种语言独立输入框

Tab 5 — SEO：
- Meta Title：5 种语言
- Meta Description：5 种语言

保存按钮始终固定在底部。保存后 toast "商品已保存"，留在当前页可继续编辑。

═══════════════════════════════════════
模块三：订单管理 /admin/orders
═══════════════════════════════════════

【列表页】
表格列：订单号 | 客户名 | 商品数 | 金额 | 状态 | 下单时间 | 操作
- 搜索：订单号、客户邮箱、客户名
- 筛选：状态（PENDING/PAID/SHIPPED/DELIVERED/CANCELLED/REFUNDED）、日期范围
- 排序：金额、时间
- 导出 CSV 按钮（后端生成 CSV 下载）
- 点击行进入详情

状态颜色标记：
- PENDING：黄色
- PAID：蓝色
- SHIPPED：紫色
- DELIVERED：绿色
- CANCELLED：灰色
- REFUNDED：红色

【详情页】
左栏（占 60%）：
- 订单概览卡片：订单号、下单时间、客户信息（姓名/邮箱）
- 商品清单表格：缩略图 | 商品名 | SKU | 单价 | 数量 | 小计
- 底部汇总：小计 → 运费 → 折扣 → 总计
- 物流信息卡片：收货人、地址、电话、物流单号（可编辑）、物流公司下拉

右栏（占 40%）：
- 当前状态 + 状态流转按钮组：
  PENDING → [确认付款] → PAID
  PAID → [标记发货]（弹出输入物流单号+公司）→ SHIPPED
  SHIPPED → [标记送达] → DELIVERED
  任何非终态 → [取消订单] → CANCELLED
  PAID/SHIPPED → [退款]（弹出输入金额+原因）→ REFUNDED
- 内部备注：textarea，保存后仅后台可见，有操作人+时间记录
- 操作时间线：每条（事件类型 + 时间 + 操作人），从 OrderEvent 表读取

每步操作后刷新页面数据。

═══════════════════════════════════════
模块四：评论管理 /admin/reviews（核心模块，重点做）
═══════════════════════════════════════

【列表页】
表格列：产品 | 评分 | 标题 | 内容(截断) | 作者 | 日期 | 标签 | 状态 | 操作
- 搜索：产品名、作者名、内容关键词
- 筛选：产品下拉、评分、状态（已审核/待审核）
- 排序：日期、评分、Helpful 数
- 标签显示：Verified ✓（绿色）、Pinned 📌、Featured ⭐
- 快捷操作：切换置顶、切换精选、审核通过/拒绝
- 批量操作：选中后可批量审核通过/删除
- 右上角"添加评论"和"批量生成"两个按钮

【添加评论 /admin/reviews/new】
表单：
- 产品：搜索下拉（必填）
- 评分：5 颗爱心组件（♥ 实心 #C9A84C，空心 #D4CFC8），支持 0.5 星步进
- 标题：文本
- 内容：多行文本（必填）
- 作者名：文本（必填）
- 日期：日期选择器（默认今天，可改为历史日期）
- Verified：开关（绿色认证标）
- Pinned：开关（置顶）
- Featured：开关（首页展示）
- Helpful 数：数字（默认 0）

两个提交按钮：
- [保存] → 保存并跳转回列表
- [保存并继续] → 保存后清空表单，留在当前页

【编辑评论 /admin/reviews/[id]】
同添加表单，预填所有字段。保存后回列表。

【批量生成 /admin/reviews/batch】
这是最复杂的功能，仔细实现：

表单：
- 目标产品：搜索下拉（必选）
- 生成数量：数字输入 1-20
- 5 星占比：滑块 0-100%，默认 75
- 4 星占比：自动 = 100% - 5星占比（不需要 1-3 星）
- 日期范围：开始日期 + 结束日期
- 全部 Verified：开关（默认开）
- 随机欧美名：开关（默认开）
- 随机尺码提及：开关（默认开）

点击[⚡ 一键生成]后：

生成引擎逻辑：
1. 从以下模板库随机抽取句式组合成评论正文
2. 变量替换：{product} → 产品名，{material} → 随机材质词，{adj} → 随机正面形容词
3. 日期：在指定范围内随机分布，同一天不超过 2 条
4. 名字：随机从名字库抽取（Sarah, Jessica, Emily, Rachel, Lauren, Amanda, Megan, Nicole, Ashley, Jennifer, Stephanie, Michelle, Rebecca, Danielle, Hannah, Olivia, Emma, Sophia, Isabella, Victoria）
5. Helpful 数：随机 1-8
6. 评分：按比例分配 5 星和 4 星，随机穿插半星（4.5 / 5.0）
7. 4 星评论自动在结尾加一句"小建议"（如 "Runs slightly small, size up if between sizes."）
8. 如果开了"随机尺码"，优先用含尺码关键词的模板

模板句式库（至少 15 个模板，随机混用）：

1. "OMG this {product} is absolutely {adj}! The {material} feels {adj2} against the skin. I wore this for my {occasion} and felt like a goddess."
2. "{product} exceeded all my expectations! The {material} is {adj} and the fit is {adj2}. My {partner} couldn't stop {verb}."
3. "I was hesitant to order lingerie online but {product} is worth every penny. {adj} craftsmanship, {adj2} details — this is luxury you can feel."
4. "This is my {number}th purchase from NOCTURNE and {product} might be my favorite yet. The {color} color is even more {adj} in person."
5. "As a {size} I struggle to find {adj} lingerie that actually fits. {product} delivers! Supportive where it needs to be, {adj2} everywhere else."
6. "Bought {product} for my honeymoon and let me just say... my husband's jaw DROPPED. The photos don't do it justice."
7. "{product} makes me feel like the main character. The {material} drapes {adv} and the {detail} detail is {adj}. I want every color!"
8. "FINALLY — {adj} lingerie for {size} that doesn't look like it was designed by someone who's never seen curves. {product} is a game changer."
9. "Ordered {product} on a whim during the sale and it's now my #1 confidence booster. The way the {material} catches the light is pure magic."
10. "My girlfriend literally gasped when she saw me in {product}. The {material} + {detail} combination is lethal. Buy it. Just do it."
11. "I own over {number} sets from NOCTURNE and {product} stands out for its {adj} {material} and {adj2} fit. True to size, incredibly comfortable."
12. "Wearing {product} right now and had to write a review immediately. The {material} is so {adj}, I forget I'm wearing anything at all."
13. "Perfect anniversary gift from me to me ;) {product} arrived in the most discreet packaging, and the unboxing felt like opening a luxury jewelry box."
14. "As someone who works in fashion, I'm picky about {material} quality. {product} uses genuinely {adj} {material} — not the cheap stuff you see elsewhere."
15. "If you're scrolling reviews trying to decide — this is your sign. {product} is {adj}, {adj2}, and worth twice the price."

随机形容词库（{adj}）：stunning, gorgeous, divine, luxurious, exquisite, elegant, perfect, flawless, incredible, breathtaking, sophisticated, enchanting, heavenly, seductive, beautiful
随机材质词（{material}）：lace, silk, satin, mesh, velvet, tulle, organza
随机细节词（{detail}）：embroidery, beading, strap, appliqué, trim, harness, cutout
随机动词（{verb}）：staring, smiling, complimenting me, taking his eyes off me
随机场景（{occasion}）：anniversary, date night, honeymoon, wedding night, Valentine's Day
随机副词（{adv}）：beautifully, elegantly, perfectly, sensually, flawlessly
随机尺码词（{size}）：32DD, 34DD, 36DDD, 38G, 40H, 34C, 36D, 38DD, 32G, full-figured, curvy, plus-size, petite, tall, busty

4 星评论额外追加（随机选一条，追加到正文末尾）：
- " Runs slightly small, I'd size up if between sizes."
- " Gorgeous but the straps are a tiny bit thin for my liking."
- " Only giving 4 because I wish it came in more colors!"
- " Beautiful quality, just wish the clasp was a little sturdier."
- " Love it, but took a while to figure out the harness straps."

生成完毕后，toast 显示"已生成 N 条评论"，跳转回评论列表（自动刷出刚生成的评论）。

═══════════════════════════════════════
数据库模型（Prisma schema 新增）
═══════════════════════════════════════

在已有 schema 基础上新增以下模型：

model Review {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  authorName   String
  rating       Float    // 1-5, 支持 0.5 步进（4.0, 4.5, 5.0）
  title        String?
  body         String
  isVerified   Boolean  @default(false)
  isPinned     Boolean  @default(false)
  isFeatured   Boolean  @default(false)
  helpfulCount Int      @default(0)
  isApproved   Boolean  @default(true)
  isDeleted    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model OrderEvent {
  id           String   @id @default(cuid())
  orderId      String
  order        Order    @relation(fields: [orderId], references: [id])
  eventType    String   // CREATED, PAID, SHIPPED, DELIVERED, CANCELLED, REFUNDED, NOTE_ADDED
  timestamp    DateTime @default(now())
  operatorName String   // "Admin" 或具体操作人名
  note         String?  // 可选备注
}

Product 模型已经有，确保有 status 字段（ACTIVE / DRAFT / ARCHIVED）、isFeatured 字段。如果没有，用 migration 加。

═══════════════════════════════════════
全局规则
═══════════════════════════════════════

1. 所有后台页面用 Server Components + Client Components 混合（数据获取用 Server，交互用 Client）
2. API routes 放在 /app/api/admin/ 下
3. 商品图片上传用 FormData + fetch POST
4. toast 通知用 shadcn/ui 的 Sonner toast
5. 表格搜索用前端状态 + URL searchParams 结合（刷新页面保留筛选条件）
6. 所有 Prisma 查询加上 try-catch，错误返回友好提示
7. 每完成一个模块后 git commit

═══════════════════════════════════════
执行顺序
═══════════════════════════════════════

1. 创建后台布局（侧边栏 + 登录 + 路由架构）
2. 数据看板
3. 商品管理（列表 + 新建/编辑 + SKU 矩阵 + 图片上传）
4. 订单管理（列表 + 详情 + 状态流转 + 时间线）
5. 评论管理（列表 + 添加/编辑 + 批量生成引擎）
6. 补充空状态、loading skeleton、toast 反馈
7. prisma migration + db push

每条完成后 commit。最终验证所有页面可访问、表单可提交、数据可持久化。
```
