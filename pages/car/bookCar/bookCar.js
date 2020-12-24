// pages/car/bookCar/bookCar.js
const config = require('../../../config/config');
const { formatTimeStamp,formatDateDifference,formatDateTimeDifference } = require('../../../utils/util');
//获取应用实例
const app = getApp()
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
    vipServeSwitch: true,//是否优享服务
    // rentStartTime:'',//起租日期
    // rentEndTime:'',//结束日期
    rentStartDate:'',//起租日-日期
    rentStartTime:'',//起租日-时间
    rentEndDate:'',//结束日-日期
    rentEndTime:'',//结束日-时间
    beginTime:'',//起租日-日期 时间
    endTime:'',//结束日-日期 时间
    differenceDay: '',//租用天数
    carCode: '',//车辆no
    carInfo: null,//存放接口返回车辆信息
    storeAddress: '',//店面地址
    sendPrice: 0,//送车费用
    getPrice: 0,//取车费用
    onHomePrice: 0,//上门取送费 sendPrice/getPrice/sendPrice+getPrice
    basicRatio: 0,//基础服务费-系数
    basicPrice: 0,//基础服务费
    rentPrice: 0,//总租金 每天租金*租用天数
    totalPrice: 0,//租车费用总计，不含押金
    workDay:0,//租用天数-工作日
    vaDay:0,//租用天数-节假日
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

    let rentStartDate = options.rentStartDate,
    rentStartTime = options.rentStartTime,
    rentEndDate = options.rentEndDate,
    rentEndTime = options.rentEndTime;
    let beginTime = rentStartDate+' '+rentStartTime;
    let endTime = rentEndDate+' '+rentEndTime;

    this.setData({
      rentStartDate,rentStartTime,rentEndDate,rentEndTime,beginTime,endTime,
      // rentStartTime: options.rentStartTime,
      // rentEndTime: options.rentEndTime,
      // differenceDay: formatDateDifference(options.rentStartTime,options.rentEndTime) +1,
      //租车天数不用前端计算，用checkTime_url接口有返回字段：工作日租用天数workDay + 节假日租用vaDay↓
      // differenceDay: formatDateTimeDifference(beginTime,endTime),
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
  vipServeSwitchChange: function(e){
    let _this = this;
    _this.setData({
      vipServeSwitch: e.detail.value
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
    if(!_this.data.beginTime || !_this.data.endTime){
      _this.dialog.showToast('请返回上一页选择租用日期');//自定义弹窗组件
      return;
    }
    let data = {
      beginTime: formatTimeStamp(_this.data.beginTime),
      endTime: formatTimeStamp(_this.data.endTime),
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
          let carInfo = res.data.data.carInfo;
          let storeAddress = res.data.data.address;//店面地址
          let sendPrice= res.data.data.sendPrice;//送车费用
          let getPrice= res.data.data.getPrice;//取车费用
          let basicRatio = res.data.data.jiChu;//基础服务费
          let workDay = res.data.data.workDay;//租用天数-工作日
          let vaDay = res.data.data.vaDay;//租用天数-节假日
          let differenceDay = Number(workDay) + Number(vaDay)
          _this.setData({carInfo,storeAddress,sendPrice,getPrice,basicRatio,workDay,vaDay,differenceDay})
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
    let onHomePrice = Number(sendPrice) + Number(getPrice);//上门取送费

    let rentPrice = _this.data.rentPrice;//车辆租金 总

    let youxiangFee = _this.data.vipServeSwitch ? _this.data.carInfo.youxiangFee : 0;//优享服务费
    let basicPrice = _this.data.basicPrice;//基础服务费

    let totalPrice = (Number(onHomePrice) + Number(rentPrice) + Number(youxiangFee) + Number(basicPrice)).toFixed(2);

    this.setData({onHomePrice,onHomeSwitch,totalPrice})
  },
  calcOnRentPrice: function(){
    let discountPrice = this.data.carInfo.discountPrice;
    let holidayPrice = this.data.carInfo.holidayPrice;
    // let differenceDay = this.data.differenceDay;
    let workDay = this.data.workDay;
    let vaDay = this.data.vaDay;
    // let rentPrice = Number(discountPrice) * Number(differenceDay);
    let rentPrice = Number(discountPrice) * Number(workDay) + Number(holidayPrice) * Number(vaDay);

    let basicRatio = this.data.basicRatio;
    let basicPrice = (Number(rentPrice) * Number(basicRatio)).toFixed(2);

    this.setData({rentPrice,basicPrice})
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
      // beginTime: formatTimeStamp(_this.data.rentStartTime),
      // endTime: formatTimeStamp(_this.data.rentEndTime),
      beginTime: formatTimeStamp(_this.data.beginTime),
      endTime: formatTimeStamp(_this.data.endTime),
      getAddress: _this.data.isHomeSend ? _this.data.homeSendAddress : '',
      sendAddress: _this.data.isHomeTake ? _this.data.homeTakeAddress : '',
      no: _this.data.carCode,
      jiChu: _this.data.vipServeSwitch,//是否选择优享服务
    }
    wx.request({
      method: "GET",
      url: config.addOrder_url,
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      success(res) {
        console.log(res.data.data);
        if(res.data.code == '105' && (res.data.message.indexOf('登录') !=-1 || res.data.message.indexOf('手机') !=-1)){//未登录；请填写手机号——没有绑定手机号
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }else if(res.data.code == '105' && res.data.message.indexOf('实名') !=-1){//请实名认证——没有认证身份证
          wx.navigateTo({
            url: '/pages/my/authentication/identity/identity',
          })
        }else if(res.data.code == '105' && res.data.message.indexOf('驾驶证') !=-1){//请上传驾驶证——没有认证驾驶证
          wx.navigateTo({
            url: '/pages/my/authentication/driver/driver',
          })
        }
        if (res.data.result == "100") {//调用接口返回数据成功
          //意向下单后 跳转到订单列表，渲染意向下单tab
          wx.switchTab({//wx.switchTab不能传参，放在globalData里
            url: '/pages/order/order',
          })
          app.globalData.currentTab = 1;
          app.globalData.status = 'intention';
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  goToAgreement: function(e){
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/car/agreement/agreement?type=${type}`,
    })
  }
})