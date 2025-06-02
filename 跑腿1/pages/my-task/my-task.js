// pages/my-task/my-task.js
const { taskStorage } = require('../../utils/storage.js');
const app = getApp();

Page({
  data: {
    currentTab: 0,
    publishedTasks: [],
    acceptedTasks: [],
    loading: true,
    currentUserId: '',
    userInfo: null,
    balance: '0.00',
    showRechargeModal: false
  },

  onLoad() {
    const currentUser = app.getCurrentUser();
    this.setData({
      currentUserId: currentUser ? currentUser.userId : '',
      userInfo: currentUser || { nickname: '默认用户' }
    });
    this.loadTasks();
  },

  onShow() {
    this.loadTasks();
  },

  // 加载任务列表
  loadTasks() {
    this.setData({ loading: true });

    try {
      const publishedTasks = taskStorage.getUserPublishedTasks(this.data.currentUserId);
      const acceptedTasks = taskStorage.getUserAcceptedTasks(this.data.currentUserId);

      publishedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      acceptedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      this.setData({
        publishedTasks,
        acceptedTasks,
        loading: false
      });
    } catch (error) {
      console.error('加载任务列表失败:', error);
      app.showToast('加载失败，请重试');
      this.setData({ loading: false });
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    this.setData({ currentTab: tab });
  },

  // 显示充值选项
  showRechargeOptions() {
    this.setData({ showRechargeModal: true });
  },

  // 隐藏充值选项
  hideRechargeModal() {
    this.setData({ showRechargeModal: false });
  },

  // 微信充值
  onWechatRecharge() {
    this.hideRechargeModal();
    wx.showModal({
      title: '微信充值',
      content: '确定要使用微信充值吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '暂未开通微信充值',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  // 支付宝充值
  onAlipayRecharge() {
    this.hideRechargeModal();
    wx.showModal({
      title: '支付宝充值',
      content: '确定要使用支付宝充值吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '暂未开通支付宝充值',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  // 提现功能
  onWithdraw() {
    if (parseFloat(this.data.balance) <= 0) {
      wx.showToast({
        title: '余额不足',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    wx.showModal({
      title: '提现确认',
      content: '确定要提现当前余额吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '提现功能暂未开通',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTasks();
    wx.stopPullDownRefresh();
  }
});