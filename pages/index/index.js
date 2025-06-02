// pages/index/index.js 修改服务数据
Page({
  data: {
    services: [
      { name: "代买", icon: "🛍" },
      { name: "代送", icon: "🚚" },
      { name: "代办", icon: "📋" }
    ]
  },
  createOrder() {
    wx.navigateTo({
      url: '/pages/order/create'
    })
  }
})