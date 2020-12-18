// pages/search/search.js
//获取接口配置
const config = require('../../config/config')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    hotSearch:[],//热门搜索
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
    this.getHotBrand();
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

  getSearchValue: function(e){
    this.setData({
      searchValue: e.detail.value
    })
  },

  goSearch: function(e){
    let searchValue = this.data.searchValue;
    let brand = e.currentTarget.dataset.brand ? e.currentTarget.dataset.brand: null;
    
    wx.switchTab({
      // url: `/pages/search/searchResult/searchResult?searchValue=${searchValue}&brand=${brand}`,
      url: '/pages/search/searchResult/searchResult',//wx.switchTab不能传参，放在globalData里
    })
    app.globalData.searchValue = searchValue;
    app.globalData.brand = brand;
  },

  getHotBrand: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.getHotBrand_url,
      success(res){
        console.log(res);
        if (res.data.result=="100"){//调用接口返回数据成功
          let hotSearch = JSON.parse(res.data.data);
          _this.setData({hotSearch})
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