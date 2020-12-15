// pages/car/carDetail/carDetail.js
const config = require('../../../config/config');
const { formatTimeStamp,formatDate } = require('../../../utils/util');
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerData:[
      // "http://img.zcool.cn/community/014056564bd8596ac7251c94eb5559.jpg",
      // "http://img.zcool.cn/community/01e03b58047e96a84a0e282b09e8fc.jpg",
      // "http://pic.90sjimg.com/back_pic/00/00/69/40/d678a42886e0232aaea0d6e69e9b1945.jpg",
    ],
    vertical: false,// 滑动方向是否为纵向
    autoplay: true,// 自动切换
    circular: true,// 采用衔接滑动
    interval: 3000,// 自动切换时间间隔2s
    duration: 500,// 滑动动画时长0.5s
    current: 0,

    carConfigInfoData: [
      {title:'车龄', value:'/年'},
      {title:'排量', value:'/T'},
      {title:'油型/电动', value:'/号汽油'},
      {title:'油箱容量', value:'/L'},
      {title:'座椅', value:'/位'}
    ],
    carConfigSignData: [ //布局要求个数为5的倍数，若不是则后面用空白数据补齐 {name:'' ,imgPath: ''}
      {name:'倒车影像', value: '../../../image/car/car_sign_icon1.png'},
      {name:'天窗', value: '../../../image/car/car_sign_icon2.png'},
      {name:'导航仪', value: '../../../image/car/car_sign_icon3.png'},
      {name:'真皮座椅', value: '../../../image/car/car_sign_icon4.png'},
      {name:'座椅加热', value: '../../../image/car/car_sign_icon5.png'},
    ],

    rentStartTime:'',
    rentEndTime:'',
    rentEndTime_mini:'',//租用结束时间，最早为租用起始时间的后一天

    carInfo: null,//存放接口数据
    carCode: '',//车辆no
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");

    let carCode = options.carCode || '';
    this.setData({carCode})

    this.getCarInfoFunc();
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

  bindStartDateChange: function(e) {
    this.setData({
      rentStartTime: e.detail.value,
      rentEndTime_mini: formatDate(new Date(e.detail.value).getTime() + 24*60*60*1000) //租用结束时间，最早为租用起始时间的后一天
    })
  },
  bindEndDateChange: function(e) {
    this.setData({
      rentEndTime: e.detail.value
    })
  },
  swiperChange: function(e){//banner设置当前页数
    var that = this;
    that.setData({
      current: e.detail.current
    })
  },
  goToBookCar: function(){
    // wx.navigateTo({
    //   url: `/pages/car/bookCar/bookCar?rentStartTime=${this.data.rentStartTime}&rentEndTime=${this.data.rentEndTime}`,
    // })
    this.checkTime();
  },

  getCarInfoFunc: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.getCarInfo_url,
      data: {
        no: _this.data.carCode
      },
      success(res) {
        debugger;
        console.log(res.data.data);
        if (res.statusCode == "200") {//调用接口返回数据成功
          let carConfigInfoData= [
            {title:'车龄', value:`${res.data.age}年`},
            {title:'排量', value:`${res.data.displacement}`},
            {title:'油型/电动', value:`${res.data.oilType}号汽油`},
            {title:'油箱容量', value:`${res.data.oilCapacity}L`},
            {title:'座椅', value:`${res.data.seatNum}位`}
          ];
          let carConfigSignData= res.data.icons;
          let bannerData = res.data.detailPic ? res.data.detailPic.split(',') : [];
          _this.setData({
            carInfo: res.data,
            carConfigInfoData,
            bannerData,
            carConfigSignData
          });
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  checkTime: function(){
    let _this = this;
    if(!_this.data.rentStartTime || !_this.data.rentEndTime){
      _this.dialog.showToast('请选择租用日期');//自定义弹窗组件
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
          wx.navigateTo({
            url: `/pages/car/bookCar/bookCar?rentStartTime=${_this.data.rentStartTime}&rentEndTime=${_this.data.rentEndTime}&carCode=${_this.data.carCode}`,
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