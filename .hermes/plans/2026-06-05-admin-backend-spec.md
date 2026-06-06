# NOCTURNE 管理员后台功能方案

> 基于建站方案 v1，聚焦后台三大核心模块：商品、订单、评论
> 技术栈：Next.js 14 + Prisma + shadcn/ui + TailwindCSS

---

## 一、总体设计

### 入口与权限

路由：`/admin`，简单密码保护（初期不需要完整 RBAC，一个管理员账号足矣）

```
/admin                    → 数据看板
/admin/login              → 登录页
/admin/products           → 商品列表
/admin/products/new       → 新建商品
/admin/products/[id]      → 编辑商品
/admin/orders             → 订单列表
/admin/orders/[id]        → 订单详情
/admin/reviews            → 评论列表
/admin/reviews/new        → 添加评论
/admin/reviews/[id]       → 编辑评论
/admin/reviews/batch      → 批量生成
/admin/promotions         → 优惠码（后期）
/admin/customers          → 客户列表（后期）
/admin/settings           → 设置（后期）
```

### 后台 UI 风格

- shadcn/ui 组件，深色侧边栏 + 浅色内容区
- 左侧导航固定，内容区滚动
- 表格统一用 shadcn DataTable（排序、搜索、分页）

---

## 二、数据看板 `/admin`

### 核心指标卡片（4 个卡片）

| 卡片 | 数据 | 对比 |
|------|------|------|
| 今日订单 | 订单数 + 金额 | vs 昨日 |
| 本周收入 | 总金额 | vs 上周 |
| 访问量 | PV + UV | vs 昨日 |
| 待处理 | 待发货 + 待退款 | 数字 |

### 图表（后期加，初期可省略）

- 近 7 天收入折线图
- 近 7 天订单量柱状图
- TOP 5 热销产品

---

## 三、商品管理 `/admin/products`

### 3.1 商品列表

表格字段：缩略图 | 商品名 | Collection | 分类 | 价格 | 库存 | 状态 | 操作

功能：
- 搜索（商品名/Collection名）
- 筛选（按 Collection、分类、状态）
- 排序（价格、库存、创建时间）
- 批量操作：上架/下架/删除
- 点击行进入编辑

状态说明：
- **已上架** — 前台可见
- **草稿** — 仅后台可见
- **已下架** — 前台不可见，保留数据

### 3.2 新建/编辑商品

**基本信息**
- 商品名称（5 种语言：EN/FR/DE/ES/IT，Tab 切换输入）
- 所属 Collection（下拉选择）
- 所属分类（多选：Bras / Briefs / Bodysuits...）
- 价格（USD，其他货币按汇率自动换算或手动填）
- 原价/划线价（用于显示折扣）

**SKU 与库存**
- 颜色 + 尺码矩阵
  - 颜色：可添加多个（色块 + 名称）
  - 尺码：XS / S / M / L / XL / 2XL / 3XL / 4XL
  - 罩杯：A / B / C / D / DD / E / F / G / H（仅 Bra 类产品显示）
- 每个 SKU 独立设置：价格可覆盖基础价、库存数量、SKU 编码
- 矩阵以表格形式展示，支持批量填充价格和库存

**媒体**
- 主图（必填，1 张）
- 附加图（可选，最多 8 张）
- 支持拖拽排序
- 上传到 Vercel Blob 或 Sanity CDN
- 自动生成缩略图

**描述**
- 简短描述（5 种语言，用于列表卡片）
- 详细描述（5 种语言，富文本编辑器，支持图片插入）
- 材质成分
- 洗涤说明
- 模特信息（身高、穿着尺码）

**SEO**
- Meta Title（5 种语言）
- Meta Description（5 种语言）
- URL Slug

**其他**
- 上架状态开关
- 是否精选（Featured，显示在首页）
- 标签（新品/热销/限量）

### 3.3 数据模型要点

```
Product
  id, slug, status (ACTIVE/DRAFT/ARCHIVED)
  
ProductTranslation (每种语言一条)
  productId, locale, name, shortDesc, description, 
  material, careInstructions, metaTitle, metaDesc

ProductVariant (SKU)
  productId, color, size, cupSize?, price, compareAtPrice, 
  stock, sku, isDefault

ProductImage
  productId, url, alt, sortOrder, isPrimary
```

---

## 四、订单管理 `/admin/orders`

### 4.1 订单列表

表格字段：订单号 | 客户 | 商品数 | 金额 | 状态 | 时间 | 操作

功能：
- 搜索（订单号、客户邮箱、客户名）
- 筛选（状态、日期范围）
- 排序（金额、时间）
- 导出 CSV（后期）

订单状态流转：

```
PENDING（待付款）
  → PAID（已付款，等待发货）
    → SHIPPED（已发货）
      → DELIVERED（已送达）
  → CANCELLED（已取消）
  → REFUNDED（已退款）

SHIPPED ← 可部分退款
```

### 4.2 订单详情

**订单概览**
- 订单号、下单时间、客户信息、当前状态
- 支付方式（Stripe / PayPal）、支付状态

**商品清单**
- 每项：缩略图、商品名、SKU（颜色/尺码）、单价、数量、小计
- 底部：小计、运费、折扣、总计

**物流信息**
- 收货人、地址、电话
- 物流单号（手动填入）
- 物流公司下拉选择

**操作区**
- 状态流转按钮（确认付款 → 标记发货 → 完成）
- 发货时必填物流单号
- 退款按钮（弹出确认框 + 金额输入 + 原因）
- 备注（内部备注，客户不可见）

**时间线**
- 订单创建
- 付款确认
- 发货
- 送达
- 退款（如有）

每条记录显示时间 + 操作人

### 4.3 数据模型要点

```
Order
  id, orderNumber, customerEmail, customerName,
  status, subtotal, shippingCost, discount, total,
  currency, paymentMethod, paymentId, 
  shippingAddress (JSON), trackingNumber, carrier,
  internalNote, createdAt, updatedAt

OrderItem
  orderId, productId, variantId, productName,
  skuInfo, unitPrice, quantity, subtotal

OrderEvent (时间线)
  orderId, eventType, timestamp, operatorName, note
```

---

## 五、评论管理 `/admin/reviews`

这是你最关心的模块，详细展开。

### 5.1 评论列表

表格字段：
- 产品（缩略图 + 名称）
- 评分（爱心图标）
- 标题
- 内容（截断 60 字符）
- 作者
- 日期
- 标签（Verified / Pinned / Featured）
- 状态（已审核/待审核）
- 操作

功能：
- 搜索（产品名、作者名、内容关键词）
- 筛选（产品、评分、状态、标签）
- 排序（日期、评分、Helpful 数）
- 批量操作：审核通过/拒绝/删除

### 5.2 添加评论

**表单字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 产品 | 下拉搜索 | ✅ | 选择关联产品 |
| 评分 | 5 颗爱心选择器 | ✅ | 支持半星（4.5） |
| 标题 | 文本 | - | 可选 |
| 内容 | 多行文本 | ✅ | 正文 |
| 作者名 | 文本 | ✅ | 显示名 |
| 日期 | 日期选择器 | ✅ | 默认今天，可改历史日期 |
| Verified | 开关 | - | 显示绿色认证标 |
| Pinned | 开关 | - | 置顶到第一条 |
| Featured | 开关 | - | 首页精选展示 |
| Helpful 数 | 数字 | - | 默认 0 |

操作按钮：
- [保存] — 保存并返回列表
- [保存并继续添加] — 保存后清空表单继续

### 5.3 编辑评论

同添加表单，所有字段可编辑。

### 5.4 批量生成

**批量生成表单：**

| 字段 | 类型 | 说明 |
|------|------|------|
| 目标产品 | 下拉搜索 | 必选 |
| 生成数量 | 数字 1-20 | 要生成几条 |
| 5 星比例 | 滑块 | 默认 75% |
| 4 星比例 | 滑块 | 默认 25%（自动联动，总和=100%） |
| 日期范围 | 起止日期 | 评论日期随机分布在这个范围内 |
| 全部 Verified | 开关 | 默认开 |
| 随机欧美名字 | 开关 | 默认开 |
| 随机尺码提及 | 开关 | 自动插入 DD/G 等尺码关键词 |
| 语言 | 单选 | EN（唯一选项，后期加其他语言） |

**生成逻辑：**
1. 系统从评论模板库随机抽取句式
2. 插入产品名、Collection 名、尺码信息
3. 每条评论日期在范围内随机分布
4. 随机分配欧美女性名字（Sarah, Jessica, Emily, Rachel, Lauren... 20 个名字库）
5. 随机 Helpful 数 1-8
6. 4 星评论自动加一句"小建议"增加真实感

**评论模板库结构：**

模板是带插槽的句子，运行时填充：
```
"{product} is absolutely {adj}! The {material} feels {adj2}..."
"OMG this {product} is {adj}! I'm a {size} and the {size2} fits {adv}."
"As someone who struggles to find {adj} lingerie for {size}... this is {adj2}."
"My {partner} couldn't take their {body_part} off me in this {product}."
```

### 5.5 其他操作

- **置顶/取消置顶** — 列表内快捷切换
- **精选/取消精选** — 列表内快捷切换
- **审核通过/拒绝** — 游客评论审核
- **软删除** — 前台不显示，数据库保留
- **回复评论** — 以品牌身份回复

### 5.6 数据模型

```
Review
  id, productId, userId (nullable, null=卖家创建),
  authorName, rating (1-5, 支持 0.5 步进),
  title, body, isVerified, isPinned, isFeatured,
  helpfulCount, isApproved, isDeleted,
  createdAt, updatedAt

ReviewReply
  id, reviewId, body, createdAt
```

---

## 六、后期扩展（本次不做）

### 优惠码管理 `/admin/promotions`
- 创建优惠码（百分比/固定金额/免运费）
- 生效条件（满减、指定商品、指定分类、新用户、限用次数）
- 有效期设置
- 使用统计

### 客户管理 `/admin/customers`
- 客户列表（邮箱、订单数、总消费、注册时间）
- 客户详情（订单历史、地址簿、VIP 等级）
- 手动调整 VIP 等级

### 设置 `/admin/settings`
- 运费规则（按地区/重量）
- 邮件模板
- 多语言内容批量编辑
- 货币汇率手动覆盖

### 高级功能
- 库存预警（低于阈值自动标记）
- 报表导出（销售报表、产品报表、客户报表）
- 活动日志（谁在什么时候做了什么）
- 多管理员 + 权限角色

---

## 七、执行顺序建议

| 步骤 | 内容 | 预估 |
|------|------|------|
| 1 | 项目初始化 + 基础布局 + 登录 | 0.5h |
| 2 | 商品 CRUD + SKU 矩阵 | 1h |
| 3 | 订单列表 + 详情 + 状态流转 | 0.5h |
| 4 | 评论 CRUD + 批量生成 | 1h |
| 5 | 数据看板 | 0.3h |
| **合计** | | **~3.3h** |

评论模块最复杂（批量生成 + 模板系统），建议最后做。商品和订单可以先跑通前后台全流程。

---

*方案版本: v1.0 | 2026-06-05*
