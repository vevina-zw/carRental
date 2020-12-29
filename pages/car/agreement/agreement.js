// pages/car/agreement/agreement.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    agreementType:'',// 基础服务费basicServe/ 优享服务费vipServe
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let agreementType = options.type;
    let agreementTitle = '';
    if(agreementType == 'basicServe'){
      agreementTitle = '基础服务费'
    }else if(agreementType == 'vipServe'){
      agreementTitle = '优享服务费'
    }else if(agreementType == 'rentPrice'){
      agreementTitle = '车辆租金'
    }else if(agreementType == 'ToS'){
      agreementTitle = '服务条款'
    }
    this.setData({agreementType})
    wx.setNavigationBarTitle({
      title: agreementTitle
    })
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

  }
})