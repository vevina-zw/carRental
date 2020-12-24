// pages/order/order.js
const config = require('../../config/config');
const { formatDate,formatDateDifference,formatTime1,formatDateTimeDifference } = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTab: ['全部','意向下单','待支付', '进行中', '已结束'],        
    currentTab: 0,

    token: '',
    status:'',//订单状态-接口查询用
    orderLists: [],//接口返回订单列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
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
    var token = wx.getStorageSync('token');
    if (token) {//登录状态
      this.setData({
        token: token
      })
      this.getOrderList()
    }else{
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
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
    let status = '';
    if(e.currentTarget.dataset.idx == '1'){
      status = 'intention';
    }else if(e.currentTarget.dataset.idx == '2'){
      status = 'wait_pay';
    }else if(e.currentTarget.dataset.idx == '3'){
      status = 'payed';
    }else if(e.currentTarget.dataset.idx == '4'){
      status = 'success';
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      status
    })
    this.getOrderList();
  },
  goToDetail: function(e){
    let orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/orderDetail/orderDetail?orderId=${orderId}`,
    })
  },
  getOrderList: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.orderList_url,
      data: {
        status: _this.data.status
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      success(res) {
        if (res.data.result == "100") {//调用接口返回数据成功
          let orderLists = res.data.data;
          orderLists.map(item=>{
            // item.differenceDay = formatDateDifference(item.startTime,item.endTime) +1
            // item.startTime = formatDate(item.startTime);
            // item.endTime = formatDate(item.endTime);
            item.differenceDay = formatDateTimeDifference(item.startTime,item.endTime)
            item.startDay = formatDate(item.startTime);
            item.endDay = formatDate(item.endTime);
            item.startTime = formatTime1(item.startTime);
            item.endTime = formatTime1(item.endTime);
            return item;
          })
          _this.setData({orderLists})
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },

  toPay: function(e){
    let orderNo = e.currentTarget.dataset.no;
    let _this = this;
    wx.request({
      method: "GET",
      url: config.submitOrder_url,
      data: {
        orderNo
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      success(res) {
        if (res.data.result == "100") {//调用接口返回数据成功
          _this.wxPay(res.data.data);
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  wxPay: function(param) {
    wx.requestPayment({
      appId: param.appId,
      timeStamp: param.timeStamp,
      nonceStr: param.nonceStr,
      package: param.packageValue,
      signType: 'MD5',
      paySign: param.paySign,
      success: function (event) {
        console.log(event);
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });

        // 支付成功后，渲染进行中tab
        _this.setData({
          currentTab: '3',
          status:'payed'
        })
        _this.getOrderList();
      },
      fail: function (error) {
        wx.showModal({
          title: '支付失败',
          content: '请稍后再试'
        });
        console.log("支付失败")
        console.log(error)
      },
      complete: function () {
        console.log("pay complete")
      }
    });
  },
})