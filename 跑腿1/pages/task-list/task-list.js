// pages/task-list/task-list.js
const { taskStorage } = require('../../utils/storage.js');
const app = getApp();

Page({
  data: {
    tasks: [],
    loading: true,
    currentUserId: '',
    statusFilters: ['全部', '待接单', '进行中', '已完成'],
    currentFilter: '全部',
    refreshing: false
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.loadTasks();
  },

  initPage() {
    const currentUser = app.getCurrentUser();
    if (!currentUser) {
      app.showToast('用户信息获取失败');
      return;
    }
    
    this.setData({
      currentUserId: currentUser.userId
    }, () => {
      this.loadTasks();
    });
  },

  async loadTasks() {
    try {
      this.setData({ loading: true });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let tasks = taskStorage.getAllTasks();
      tasks = this.filterTasks(tasks);
      tasks = this.sortTasks(tasks);

      // 标记是否是自己的任务
      tasks = tasks.map(task => {
        return {
          ...task,
          isMyTask: task.publisherId === this.data.currentUserId
        };
      });

      this.setData({
        tasks,
        loading: false,
        refreshing: false
      });
      
    } catch (error) {
      console.error('加载任务失败:', error);
      this.handleLoadError();
    }
  },

  filterTasks(tasks) {
    if (this.data.currentFilter === '全部') return tasks;
    
    const statusMap = {
      '待接单': 'pending',
      '进行中': 'ongoing',
      '已完成': 'completed'
    };
    
    return tasks.filter(task => 
      task.status === statusMap[this.data.currentFilter]
    );
  },

  sortTasks(tasks) {
    return tasks.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  },

  handleLoadError() {
    app.showToast('加载失败，请重试');
    this.setData({
      loading: false,
      refreshing: false
    });
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadTasks();
    wx.stopPullDownRefresh();
  },

  onFilterChange(e) {
    const filter = this.data.statusFilters[e.detail.value];
    if (filter === this.data.currentFilter) return;
    
    this.setData({ 
      currentFilter: filter,
      loading: true
    }, () => {
      this.loadTasks();
    });
  },

  onViewTask(e) {
    const taskId = e.currentTarget.dataset.taskid;
    const task = this.data.tasks.find(t => t.taskId === taskId);
    
    if (!task) {
      app.showToast('任务信息不存在');
      return;
    }

    this.showTaskDetailModal(task);
  },

  showTaskDetailModal(task) {
    // 不能接自己的任务
    const canAccept = task.status === 'pending' && 
                     !task.isMyTask;
    
    app.showModal({
      title: task.title,
      content: this.getTaskDetailContent(task),
      showCancel: canAccept,
      confirmText: canAccept ? '接单' : '确定',
      cancelText: '取消'
    }).then(res => {
      if (res.confirm && canAccept) {
        this.confirmAcceptTask(task.taskId);
      }
    });
  },

  getTaskDetailContent(task) {
    let content = `描述：${task.description}\n\n` +
                 `报酬：${task.reward}元\n` +
                 `地点：${task.location}\n` +
                 `联系方式：${task.contact}\n\n` +
                 `发布者：${task.publisherName}\n` +
                 `状态：${this.getStatusText(task.status)}`;
    
    if (task.isMyTask && task.status === 'pending') {
      content += '\n\n※这是您发布的任务';
    }
    
    return content;
  },

  confirmAcceptTask(taskId) {
    app.showModal({
      title: '确认接单',
      content: '接单后请及时与发布者联系',
      confirmText: '确认接单',
      cancelText: '取消'
    }).then(res => {
      if (res.confirm) {
        this.acceptTask(taskId);
      }
    });
  },

  async acceptTask(taskId) {
    try {
      app.showLoading('处理中...');
      
      const updatedTask = taskStorage.updateTaskStatus(
        taskId, 
        'ongoing',
        this.data.currentUserId
      );

      if (updatedTask) {
        app.showToast('接单成功', 'success');
        await this.loadTasks();
      } else {
        throw new Error('接单失败');
      }
    } catch (error) {
      console.error('接单失败:', error);
      app.showToast('接单失败，请重试');
    } finally {
      app.hideLoading();
    }
  },

  onPublishTask() {
    wx.navigateTo({
      url: '/pages/publish/publish',
      fail: (err) => {
        console.error('跳转失败:', err);
        app.showToast('页面跳转失败');
      }
    });
  },

  getStatusText(status) {
    const statusMap = {
      'pending': '待接单',
      'ongoing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  }
});