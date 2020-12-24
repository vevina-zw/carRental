// pages/order/orderDetail/orderDetail.js
const config = require('../../../config/config');
const { formatDate,formatDateDifference,formatTimeLeft,formatTime1,formatDateTimeDifference } = require('../../../utils/util');
let timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',//订单编号
    orderInfo: '',//存放接口返回 订单信息
    orderStatus: [ //状态栏数据
      {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'客服确认'},
      {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'待支付'},
      {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'进行中'},
      {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'已支付'},
    ],
    timeLeft:-1,//支付倒计时
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
    var token = wx.getStorageSync('token');
    if (token) {//登录状态
      this.setData({
        token: token,
        orderId: options.orderId || ''
      })
      this.getOrderInfo()
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

  getOrderInfo: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.orderInfo_url,
      data: {
        id: _this.data.orderId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      success(res) {
        if (res.data.result == "100") {//调用接口返回数据成功
          let orderInfo = res.data.data;
          // orderInfo.differenceDay = formatDateDifference(orderInfo.startTime,orderInfo.endTime) +1;//租车天数
          // orderInfo.startTime = formatDate(orderInfo.startTime);
          // orderInfo.endTime = formatDate(orderInfo.endTime);
          //租车天数不用前端计算，用接口有返回字段：工作日租用天数workDay + 节假日租用vaDay↓
          // orderInfo.differenceDay = formatDateTimeDifference(orderInfo.startTime,orderInfo.endTime);//租车天数
          orderInfo.differenceDay = Number(orderInfo.workDay) + Number(orderInfo.vaDay);
          orderInfo.startDay = formatDate(orderInfo.startTime);
          orderInfo.endDay = formatDate(orderInfo.endTime);
          orderInfo.startTime = formatTime1(orderInfo.startTime);
          orderInfo.endTime = formatTime1(orderInfo.endTime);
          // orderInfo.rentPrice = Number(orderInfo.carInfo.discountPrice) * Number(orderInfo.differenceDay);//总租金 每天租金*租用天数
          orderInfo.rentPrice = Number(orderInfo.carInfo.discountPrice) * Number(orderInfo.workDay) + Number(orderInfo.carInfo.holidayPrice) * Number(orderInfo.vaDay);//总租金 工作日租金*工作日租用天数 + 节假日租金*节假日租用天数
          orderInfo.onHomePrice = Number(orderInfo.sendPrice) + Number(orderInfo.getPrice);//上门取送费 sendPrice/getPrice/sendPrice+getPrice
          // 不用前端计算，接口有返回字段：基础服务费basicSerivceFee、租车费用总计price↓
          //orderInfo.basicPrice = (Number(orderInfo.rentPrice) * Number(orderInfo.jiChu)).toFixed(2);//基础服务费 车辆租金*基础服务费率
          //orderInfo.totalPrice = (Number(orderInfo.rentPrice) + Number(orderInfo.onHomePrice)+ Number(orderInfo.youxiangFee) + Number(orderInfo.basicPrice)).toFixed(2);//租车费用总计，不含押金

          let orderStatus = [
            {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'客服确认'},
            {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'待支付'},
            {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'进行中'},
            {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'已支付'},
          ]
          if(orderInfo.status == 'intention'){//待客服确认
            orderStatus[0].class = 'current';
            orderStatus[0].icon = '../../../image/order/order_status_icon3.png';
          }else if(orderInfo.status == 'wait_pay'){//待支付
            orderStatus[0].class = 'past';
            orderStatus[0].icon = '../../../image/order/order_status_icon2.png';
            orderStatus[1].class = 'current';
            orderStatus[1].icon = '../../../image/order/order_status_icon3.png';
          }else if(orderInfo.status == 'payed'){//进行中
            orderStatus = [
              {class: 'past',icon: '../../../image/order/order_status_icon2.png',name:'客服确认'},
              {class: 'past',icon: '../../../image/order/order_status_icon2.png',name:'待支付'},
              {class: 'current',icon: '../../../image/order/order_status_icon3.png',name:'进行中'},
              {class: 'after',icon: '../../../image/order/order_status_icon1.png',name:'已支付'},
            ]
          }else if(orderInfo.status == 'success'){//已结束
            orderStatus = [
              {class: 'past',icon: '../../../image/order/order_status_icon2.png',name:'客服确认'},
              {class: 'past',icon: '../../../image/order/order_status_icon2.png',name:'待支付'},
              {class: 'past',icon: '../../../image/order/order_status_icon2.png',name:'进行中'},
              {class: 'current',icon: '../../../image/order/order_status_icon3.png',name:'已支付'},
            ]
          }
          _this.setData({orderInfo,orderStatus})


          if(orderInfo.status == 'wait_pay'){
            let datetimeFrom = orderInfo.modifyTime;
            let datetimeTo = new Date(datetimeFrom).getTime() + 60*60*1000;//倒计时结束时间为开始时间的后一个小时
            timer = setInterval(() =>{ //注意箭头函数！！
              _this.setData({
                timeLeft: formatTimeLeft(datetimeFrom,datetimeTo)//使用了util.getTimeLeft
              });
              if (_this.data.timeLeft == "0分0秒") {
                clearInterval(timer);
                _this.setData({
                  timeLeft: -2
                });
              }
            }, 1000);
          }
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },

  toPay: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.submitOrder_url,
      data: {
        orderNo: _this.data.orderInfo.no
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
          duration: 1000
        });
        
        //支付成功后 返回到订单列表，渲染进行中tab
        let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
        let prevPage = pages[ pages.length - 2 ];
        prevPage.setData({// 设置上一页参数
          currentTab: 3,
          status:'payed'
        })
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          })
        }, 1000);
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