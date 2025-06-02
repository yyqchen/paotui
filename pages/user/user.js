// pages/user/user.js 添加跳转逻辑
Page({
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/order/create'
    })
  },
  
  navigateTomyidea() {
    wx.navigateTo({
      url: '/pages/myidea/myidea'
    })
  },
  
  navigateToService() {
    wx.navigateTo({
      url: '/pages/service/service'
    })
  }
})