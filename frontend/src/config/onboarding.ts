export type PageName = 'dashboard' | 'feed' | 'explore';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'center';
  disableBeacon?: boolean;
}

export interface TourConfig {
  steps: TourStep[];
  pageName: PageName;
}

// Dashboard tour steps (4 steps)
export const dashboardTour: TourStep[] = [
  {
    target: '.dashboard-create-btn',
    title: '欢迎来到 Oddslab！👋',
    content: '这里是你的控制台。首先，让我们创建一个房间来追踪交易。',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.room-card',
    title: '你的房间 📦',
    content: '房间是你追踪的地址集合。每个房间包含多个以太坊钱包地址。',
    placement: 'right',
  },
  {
    target: '.room-card-actions',
    title: '管理房间 ⚙️',
    content: '点击这里可以编辑房间、添加地址或删除房间。',
    placement: 'bottom',
  },
  {
    target: 'body',
    title: '开始创建 ➕',
    content: '准备好后，点击创建按钮开始添加你的第一个房间。你也可以点击"跳过"先探索平台！',
    placement: 'center',
  },
];

// Feed tour steps (4 steps)
export const feedTour: TourStep[] = [
  {
    target: '.feed-filters',
    title: '交易活动 Feed 📊',
    content: '这里显示所有追踪地址的交易活动。点击"数据来源"可以查看和筛选钱包地址。',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.activity-item',
    title: '交易活动卡片 💱',
    content: '每张卡片显示一个地址在某个市场的交易汇总。点击卡片可以展开查看详细的交易历史和盈亏情况。',
    placement: 'right',
  },
  {
    target: '.feed-refresh-btn',
    title: '刷新数据 🔄',
    content: '点击刷新按钮获取最新交易数据。系统也会每 2 分钟自动刷新。',
    placement: 'left',
  },
  {
    target: 'body',
    title: '开始追踪 🚀',
    content: '现在你已经了解了 Feed 页面的功能。开始追踪智能钱的交易活动吧！',
    placement: 'center',
  },
];

// Explore tour steps (4 steps)
export const exploreTour: TourStep[] = [
  {
    target: '.explore-search',
    title: '探索公开房间 🔍',
    content: '浏览其他用户创建的公开房间，发现优秀的交易者！使用搜索框和排序来找到你感兴趣的房间。',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.public-room-card',
    title: '公开房间 🌐',
    content: '每个公开房间显示追踪的地址数量和基本信息。点击房间卡片可以查看详细信息和交易活动。',
    placement: 'right',
  },
  {
    target: 'body',
    title: '发现智能钱 💡',
    content: '通过探索公开房间，你可以学习成功交易者的策略和持仓分布。',
    placement: 'center',
  },
  {
    target: 'body',
    title: '开始探索 🚀',
    content: '现在你已经了解了 Explore 页面的功能。开始发现优秀的交易者吧！',
    placement: 'center',
  },
];

// Get tour config by page name
export const getTourConfig = (pageName: PageName): TourStep[] => {
  switch (pageName) {
    case 'dashboard':
      return dashboardTour;
    case 'feed':
      return feedTour;
    case 'explore':
      return exploreTour;
    default:
      return [];
  }
};

// Get target selector for create button (used across pages)
export const tourTargets = {
  dashboardCreateBtn: '.dashboard-create-btn',
  roomCard: '.room-card',
  roomActions: '.room-card-actions',
  feedFilters: '.feed-filters',
  activityItem: '.activity-item',
  refreshBtn: '.feed-refresh-btn',
  exploreSearch: '.explore-search',
  publicRoomCard: '.public-room-card',
};
