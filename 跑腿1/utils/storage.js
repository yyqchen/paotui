// utils/storage.js

// 存储键名常量
const STORAGE_KEYS = {
  USER: 'user_info',
  TASKS: 'tasks_data',
  CURRENT_USER_ID: 'current_user_id'
};

// 用户相关存储操作
const userStorage = {
  // 获取当前用户ID
  getCurrentUserId: function() {
    return wx.getStorageSync(STORAGE_KEYS.CURRENT_USER_ID) || null;
  },

  // 设置当前用户ID
  setCurrentUserId: function(userId) {
    wx.setStorageSync(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  // 获取用户信息
  getUserInfo: function(userId) {
    const users = wx.getStorageSync(STORAGE_KEYS.USER) || {};
    return users[userId] || null;
  },

  // 保存用户信息
  saveUserInfo: function(userInfo) {
    if (!userInfo || !userInfo.userId) {
      console.error('无效的用户信息');
      return;
    }
    const users = wx.getStorageSync(STORAGE_KEYS.USER) || {};
    users[userInfo.userId] = userInfo;
    wx.setStorageSync(STORAGE_KEYS.USER, users);
  },

  // 创建新用户
  createUser: function(nickname) {
    const userId = 'user_' + Date.now();
    const userInfo = {
      userId: userId,
      nickname: nickname,
      createdAt: new Date().toISOString(),
      publishedTasks: [],
      acceptedTasks: []
    };
    this.saveUserInfo(userInfo);
    return userInfo;
  }
};

// 任务相关存储操作
const taskStorage = {
  // 获取所有任务
  getAllTasks: function() {
    return wx.getStorageSync(STORAGE_KEYS.TASKS) || [];
  },

  // 获取单个任务
  getTaskById: function(taskId) {
    const tasks = this.getAllTasks();
    return tasks.find(task => task.taskId === taskId);
  },

  // 保存任务
  saveTask: function(taskData) {
    const tasks = this.getAllTasks();
    const taskId = 'task_' + Date.now();
    
    const newTask = {
      taskId: taskId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...taskData
    };

    tasks.push(newTask);
    wx.setStorageSync(STORAGE_KEYS.TASKS, tasks);
    
    // 更新用户的发布任务列表
    const publisher = userStorage.getUserInfo(taskData.publisherId);
    if (publisher) {
      publisher.publishedTasks.push(taskId);
      userStorage.saveUserInfo(publisher);
    }

    return newTask;
  },

  // 更新任务状态
  updateTaskStatus: function(taskId, status, accepterId = null) {
    const tasks = this.getAllTasks();
    const taskIndex = tasks.findIndex(task => task.taskId === taskId);
    
    if (taskIndex === -1) {
      console.error('任务不存在');
      return null;
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      status: status,
      accepterId: accepterId,
      updatedAt: new Date().toISOString()
    };

    wx.setStorageSync(STORAGE_KEYS.TASKS, tasks);

    // 如果是接单操作，更新接单者的任务列表
    if (accepterId && status === 'ongoing') {
      const accepter = userStorage.getUserInfo(accepterId);
      if (accepter) {
        accepter.acceptedTasks.push(taskId);
        userStorage.saveUserInfo(accepter);
      }
    }

    return tasks[taskIndex];
  },

  // 获取用户发布的任务
  getUserPublishedTasks: function(userId) {
    const tasks = this.getAllTasks();
    return tasks.filter(task => task.publisherId === userId);
  },

  // 获取用户接受的任务
  getUserAcceptedTasks: function(userId) {
    const tasks = this.getAllTasks();
    return tasks.filter(task => task.accepterId === userId);
  },

  // 删除任务
  deleteTask: function(taskId) {
    const tasks = this.getAllTasks();
    const filteredTasks = tasks.filter(task => task.taskId !== taskId);
    wx.setStorageSync(STORAGE_KEYS.TASKS, filteredTasks);
  }
};

// 数据验证函数
const validateTask = function(taskData) {
  if (!taskData.title || taskData.title.trim() === '') {
    return { valid: false, error: '任务标题不能为空' };
  }
  if (!taskData.description || taskData.description.trim() === '') {
    return { valid: false, error: '任务描述不能为空' };
  }
  if (!taskData.reward || taskData.reward <= 0) {
    return { valid: false, error: '任务报酬必须大于0' };
  }
  if (!taskData.publisherId) {
    return { valid: false, error: '发布者ID不能为空' };
  }
  return { valid: true };
};

module.exports = {
  STORAGE_KEYS,
  userStorage,
  taskStorage,
  validateTask
};