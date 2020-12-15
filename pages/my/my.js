// pages/my/my.js
//获取接口配置
const config = require('../../config/config')
//获取应用实例
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    listsData: [
      {iconPath:'../../image/my/list_icon1.png', name:'身份验证', linkPath:'/pages/my/authentication/identity/identity'},
      {iconPath:'../../image/my/list_icon2.png', name:'在线客服'},
      {iconPath:'../../image/my/list_icon3.png', name:'意见反馈'},
      {iconPath:'../../image/my/list_icon4.png', name:'联系我们', linkPath:'/pages/my/contactUs/contactUs'},
      {iconPath:'../../image/my/list_icon5.png', name:'服务条款'},
    ],
    token:'',
    phone:'',//手机号
    nickName:'',//昵称
    headImg:''//头像
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
      this.queryUserInfo()
    }else{
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
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

  linkPage: function(e){
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },

  //获取用户信息
  queryUserInfo: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.queryUserInfo_url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      success(res){
        if (res.data.result=="100"){//调用接口返回数据成功
          let data = res.data.data;
          let phone = data.phone;
          let nickName = data.nickName;
          let headImg = data.headImg;
          _this.setData({phone,nickName,headImg})
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