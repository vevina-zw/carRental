// pages/order/order.js
const config = require('../../config/config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTab: ['全部','意向下单','待支付', '进行中', '已结束'],        
    currentTab: 0,

    token: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
    var token = wx.getStorageSync('token');
    if (token) {//登录状态
      this.setData({
        token: token
      })
    }else{}

    this.getOrderList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  clickTab: function(e){
    if (this.data.currentTab == e.currentTarget.dataset.idx){
      return;
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  },
  goToDetail: function(){
    wx.navigateTo({
      url: '/pages/order/orderDetail/orderDetail',
    })
  },
  getOrderList: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.orderList_url,
      // data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': _this.data.token,
        'token': _this.data.token,
      },
      success(res) {
        debugger;
        console.log(res.data.data);
        if (res.data.result == "100") {//调用接口返回数据成功
          
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  }
})