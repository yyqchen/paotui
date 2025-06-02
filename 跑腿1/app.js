// app.js
const { userStorage } = require('./utils/storage.js')

App({
  onLaunch() {
    // 检查是否有当前用户
    const currentUserId = userStorage.getCurrentUserId();
    if (!currentUserId) {
      // 首次使用，创建默认用户
      const defaultUser = userStorage.createUser('默认用户');
      userStorage.setCurrentUserId(defaultUser.userId);
      this.globalData.userInfo = defaultUser;
    } else {
      // 获取已存在的用户信息
      this.globalData.userInfo = userStorage.getUserInfo(currentUserId);
    }
  },

  // 全局数据
  globalData: {
    userInfo: null
  },

  // 全局方法
  getCurrentUser: function() {
    return this.globalData.userInfo;
  },

  // 更新用户信息
  updateUserInfo: function(userInfo) {
    this.globalData.userInfo = userInfo;
    userStorage.saveUserInfo(userInfo);
  },

  // 显示消息提示框
  showToast: function(title, icon = 'none') {
    wx.showToast({
      title: title,
      icon: icon,
      duration: 2000
    });
  },

  // 显示加载提示框
  showLoading: function(title = '加载中') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 隐藏加载提示框
  hideLoading: function() {
    wx.hideLoading();
  },

  // 显示模态对话框
  showModal: function(title, content, showCancel = true) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: title,
        content: content,
        showCancel: showCancel,
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
})