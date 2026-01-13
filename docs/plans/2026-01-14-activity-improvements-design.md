# Activity Improvements Design

## Overview

改进活动卡片和分组功能，添加持仓金额和盈亏计算。

## 改动范围

**注意**: "Room" = PublicRoom + RoomDetail，所有改动同时应用于两个页面。

## 改动清单

### 1. 移除 Polyscan 链接
- 从两个页面的活动卡片中移除 Polyscan 链接

### 2. RoomDetail 添加 Polymarket 链接
- 与 PublicRoom 保持一致，在活动卡片中添加 Polymarket 链接

### 3. 活动卡片添加 Outcome
- 显示 YES/NO 方向
- 格式: `用户名 • 买入 • YES • $金额`

### 4. 分组汇总添加持仓和盈亏

**数据结构扩展**:
```typescript
interface ActivityGroup {
  // 现有字段
  totalBuyAmount: number;
  totalSellAmount: number;
  buyCount: number;
  sellCount: number;

  // 新增字段
  positionValue: number | null;  // 当前持仓价值
  profitLoss: number | null;     // 盈亏
}
```

**数据流**:
```
activities[] + positions[] -> groupActivities() -> ActivityGroup[]
```

**匹配逻辑**:
- 用 `address + market name (lowercase)` 匹配 positions
- positions.holders[] 中查找对应 address 的 value

**盈亏计算**:
```
盈亏 = 持仓价值 + 卖出总额 - 买入总额
```

**汇总行格式**:
```
共 4 笔 | 买入: $16,809 (4次) | 持仓: $15,000 | 盈亏: -$1,809
共 4 笔 | 买入: $100 (3次) | 卖出: $30 (1次) | 持仓: $50 | 盈亏: -$20
```

**盈亏颜色**:
- 绿色: 盈亏 > 0
- 红色: 盈亏 < 0
- 不显示: 持仓找不到匹配
