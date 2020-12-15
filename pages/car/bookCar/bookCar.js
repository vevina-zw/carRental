// pages/car/bookCar/bookCar.js
const config = require('../../../config/config');
const { formatTimeStamp,formatDateDifference } = require('../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onHomeSwitch: true,//是否-上门送取服务
    isHomeSend: true,//是否-送车上门
    isHomeTake: true,//是否-上门取车
    homeSendAddress:'',//送车上门地址
    homeTakeAddress:'',//上门取车地址
    rentStartTime:'',//起租日期
    rentEndTime:'',//结束日期
    differenceDay: '',//租用天数
    carCode: '',//车辆no
    carInfo: null,//存放接口返回车辆信息
    storeAddress: '',//店面地址
    sendPrice: 0,//送车费用
    getPrice: 0,//取车费用
    onHomePrice: 0,//上门取送费 sendPrice/getPrice/sendPrice+getPrice
    rentPrice: 0,//总租金 每天租金*租用天数
    totalPrice: 0,//租车费用总计，不含押金
    token: "",
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

    this.setData({
      rentStartTime: options.rentStartTime,
      rentEndTime: options.rentEndTime,
      differenceDay: formatDateDifference(options.rentStartTime,options.rentEndTime) +1,
      carCode: options.carCode
    })

    this.checkTime();
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
  onHomeSwitchChange: function(e){
    this.setData({
      onHomeSwitch: e.detail.value,
      isHomeSend: e.detail.value,
      isHomeTake: e.detail.value
    })
    this.calcPrice();
  },
  homeSendRadioChange: function(){
    let _this = this;
    _this.setData({
      isHomeSend: !_this.data.isHomeSend
    })
    _this.calcPrice();
  },
  homeTakeRadioChange: function(){
    let _this = this;
    _this.setData({
      isHomeTake: !_this.data.isHomeTake
    })
    _this.calcPrice();
  },
  homeSendAddress: function(e){
    this.setData({
      homeSendAddress: e.detail.value
    })
  },
  homeTakeAddress: function(e){
    this.setData({
      homeTakeAddress: e.detail.value
    })
  },
  checkTime: function(){
    let _this = this;
    if(!_this.data.rentStartTime || !_this.data.rentEndTime){
      _this.dialog.showToast('请返回上一页选择租用日期');//自定义弹窗组件
      return;
    }
    let data = {
      beginTime: formatTimeStamp(_this.data.rentStartTime),
      endTime: formatTimeStamp(_this.data.rentEndTime),
      no: _this.data.carCode
    }
    wx.request({
      method: "GET",
      url: config.checkTime_url,
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        console.log(res.data.data);
        if (res.data.result == "100") {//调用接口返回数据成功，即为该日期内可用
          debugger;
          let carInfo = res.data.data.carInfo;
          let storeAddress = res.data.data.address;//店面地址
          let sendPrice= res.data.data.sendPrice;//送车费用
          let getPrice= res.data.data.getPrice;//取车费用
          _this.setData({carInfo,storeAddress,sendPrice,getPrice})
          _this.calcOnRentPrice();
          _this.calcPrice()
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  calcPrice: function(){
    let _this = this;
    let sendPrice = this.data.sendPrice;
    let getPrice = this.data.getPrice;
    let onHomeSwitch = this.data.onHomeSwitch;
    if(!_this.data.isHomeSend && _this.data.isHomeTake){
      sendPrice = 0;
      getPrice = getPrice;
    }else if(_this.data.isHomeSend && !_this.data.isHomeTake){
      sendPrice = sendPrice;
      getPrice = 0;
    }else if(!_this.data.isHomeSend && !_this.data.isHomeTake){
      sendPrice = 0;
      getPrice = 0;
      onHomeSwitch = false;
    }else{
      sendPrice = sendPrice;
      getPrice = getPrice;
    }
    let onHomePrice = Number(sendPrice) + Number(getPrice);

    let rentPrice = this.data.rentPrice;//车辆租金 总
    let totalPrice = Number(onHomePrice) + Number(rentPrice);

    this.setData({onHomePrice,onHomeSwitch,totalPrice})
  },
  calcOnRentPrice: function(){
    let discountPrice = this.data.carInfo.discountPrice;
    let differenceDay = this.data.differenceDay;
    let rentPrice = Number(discountPrice) * Number(differenceDay);
    this.setData({rentPrice})
  },
  addOrder: function(){
    let _this = this;
    if(!_this.data.rentStartTime || !_this.data.rentEndTime){
      _this.dialog.showToast('请返回上一页选择租用日期');//自定义弹窗组件
      return;
    }else if(_this.data.isHomeSend && !_this.data.homeSendAddress){
      _this.dialog.showToast('请输入送车上门地址');//自定义弹窗组件
      return;
    }else if(_this.data.isHomeTake && !_this.data.homeTakeAddress){
      _this.dialog.showToast('请输入上门取车地址');//自定义弹窗组件
      return;
    }
    let data = {
      beginTime: formatTimeStamp(_this.data.rentStartTime),
      endTime: formatTimeStamp(_this.data.rentEndTime),
      getAddress: _this.data.isHomeSend ? _this.data.homeSendAddress : null,
      sendAddress: _this.data.isHomeTake ? _this.data.homeTakeAddress : null,
      no: _this.data.carCode
    }
    debugger
    wx.request({
      method: "GET",
      url: config.addOrder_url,
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      success(res) {
        debugger;
        console.log(res.data.data);
        if(res.data.code == '105' && res.data.message.indexOf('手机') !=-1){//请填写手机号——没有绑定手机号
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }else if(res.data.code == '105' && res.data.message.indexOf('实名') !=-1){//请实名认证——没有认证身份证和驾驶证
          wx.navigateTo({
            url: '/pages/my/authentication/identity/identity',
          })
        }
        if (res.data.result == "100") {//调用接口返回数据成功
          wx.switchTab({
            url: 'pages/search/searchResult/searchResult',
          })
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