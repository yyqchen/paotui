// pages/publish/publish.js
const { taskStorage, validateTask } = require('../../utils/storage.js');
const app = getApp();

// 确保导出Page对象
Page({
  data: {
    title: '',
    description: '',
    reward: '',
    location: '',
    contact: '',
    isSubmitting: false
  },

  onLoad: function() {
    // 页面加载时的初始化逻辑
  },

  // 输入事件处理函数
  onTitleInput: function(e) {
    this.setData({
      title: e.detail.value
    });
  },

  onDescriptionInput: function(e) {
    this.setData({
      description: e.detail.value
    });
  },

  onRewardInput: function(e) {
    this.setData({
      reward: e.detail.value
    });
  },

  onLocationInput: function(e) {
    this.setData({
      location: e.detail.value
    });
  },

  onContactInput: function(e) {
    this.setData({
      contact: e.detail.value
    });
  },

  // 表单提交处理
  onSubmit: async function() {
    if (this.data.isSubmitting) return;

    // 获取表单数据
    const taskData = {
      title: this.data.title.trim(),
      description: this.data.description.trim(),
      reward: parseFloat(this.data.reward),
      location: this.data.location.trim(),
      contact: this.data.contact.trim(),
      publisherId: app.getCurrentUser().userId,
      publisherName: app.getCurrentUser().nickname
    };

    // 数据验证
    const validation = validateTask(taskData);
    if (!validation.valid) {
      app.showToast(validation.error);
      return;
    }

    // 额外的字段验证
    if (!taskData.location) {
      app.showToast('请填写任务地点');
      return;
    }
    if (!taskData.contact) {
      app.showToast('请填写联系方式');
      return;
    }

    this.setData({ isSubmitting: true });
    app.showLoading('发布中...');

    try {
      // 保存任务
      const newTask = taskStorage.saveTask(taskData);

      app.hideLoading();
      app.showToast('发布成功', 'success');

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 1500);
    } catch (error) {
      console.error('发布任务失败:', error);
      app.hideLoading();
      app.showToast('发布失败，请重试');
    } finally {
      this.setData({ isSubmitting: false });
    }
  },

  // 重置表单
  resetForm: function() {
    this.setData({
      title: '',
      description: '',
      reward: '',
      location: '',
      contact: ''
    });
  },

  // 取消发布
  onCancel: function() {
    // 如果表单有内容，显示确认对话框
    if (this.data.title || this.data.description || this.data.reward || 
        this.data.location || this.data.contact) {
      app.showModal('确认取消', '已填写的内容将不会保存，确定要取消吗？')
        .then(res => {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        });
    } else {
      // 如果表单为空，直接返回
      wx.navigateBack({
        delta: 1
      });
    }
  }
});