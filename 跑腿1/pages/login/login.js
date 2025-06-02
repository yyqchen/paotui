// pages/login/login.js
const app = getApp();
const { userStorage } = require('../../utils/storage.js');

Page({
  data: {
    canIUseGetUserProfile: false,
    isLoading: false
  },

  onLoad() {
    // 检查是否已登录
    if (userStorage.checkLoginStatus()) {
      this.redirectToHome();
      return;
    }

    // 判断是否可以使用getUserProfile
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
  },

  // 使用getUserProfile获取用户信息（新版本）
  getUserProfile() {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });

    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('getUserProfile success:', res);
        this.handleLoginSuccess(res.userInfo);
      },
      fail: (err) => {
        console.error('getUserProfile fail:', err);
        if (err.errMsg.includes('deny')) {
          wx.showModal({
            title: '提示',
            content: '需要您的授权才能使用小程序的完整功能',
            showCancel: false
          });
        } else {
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'error'
          });
        }
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 使用getUserInfo获取用户信息（兼容旧版本）
  getUserInfo(e) {
    if (this.data.isLoading) return;

    console.log('getUserInfo event:', e);
    
    if (e.detail.userInfo) {
      this.handleLoginSuccess(e.detail.userInfo);
    } else {
      wx.showModal({
        title: '提示',
        content: '需要您的授权才能使用小程序的完整功能',
        showCancel: false
      });
    }
  },

  // 处理登录成功
  handleLoginSuccess(wxUserInfo) {
    try {
      // 创建或更新用户信息
      const user = userStorage.createUser(wxUserInfo);
      
      // 设置当前用户
      userStorage.setCurrentUserId(user.userId);
      app.globalData.userInfo = user;

      // 显示成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 延迟跳转到主页
      setTimeout(() => {
        this.redirectToHome();
      }, 1500);

    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'error'
      });
    }
  },

  // 跳转到主页
  redirectToHome() {
    wx.reLaunch({
      url: '/pages/task-list/task-list',
      fail: (error) => {
        console.error('跳转失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error'
        });
      }
    });
  },

  // 查看用户协议
  viewAgreement() {
    wx.showModal({
      title: '用户协议和隐私政策',
      content: '感谢您使用校园跑腿小程序。我们非常重视您的个人信息和隐私保护。使用我们的服务即表示您同意我们按照用户协议和隐私政策来收集和使用您的相关信息。',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});