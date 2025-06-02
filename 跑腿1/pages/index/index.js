Page({
  navigateToPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },
  navigateToTaskList() {
    wx.navigateTo({ url: '/pages/task-list/task-list' })
  },
  navigateToMyTask() {
    wx.navigateTo({ url: '/pages/my-task/my-task' })
  }
})