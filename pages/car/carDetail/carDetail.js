// pages/car/carDetail/carDetail.js
const config = require('../../../config/config');
const { formatTimeStamp,formatDate } = require('../../../utils/util');
const dateTimePicker = require('../../../utils/dateTimePicker.js');
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

    // rentStartTime:'',
    // rentEndTime:'',
    rentEndTime_mini:'',//租用结束时间，最早为租用起始时间的后一天

    carInfo: null,//存放接口数据
    carCode: '',//车辆no


    dateTimeArray: null,
    dateTime: null,
    dateTimeArray1: null,
    dateTime1: null,
    startYear: 2020
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");

    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj.dateTimeArray.pop();
    var lastTime = obj.dateTime.pop();
    var lastArray1 = obj1.dateTimeArray.pop();
    var lastTime1 = obj1.dateTime.pop();
    
    this.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime
    });

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

  // bindStartDateChange: function(e) {
  //   this.setData({
  //     rentStartTime: e.detail.value,
  //     rentEndTime_mini: formatDate(new Date(e.detail.value).getTime() + 24*60*60*1000) //租用结束时间，最早为租用起始时间的后一天
  //   })
  // },
  // bindEndDateChange: function(e) {
  //   this.setData({
  //     rentEndTime: e.detail.value
  //   })
  // },
  changeDateTime(e){
    this.setData({ dateTime: e.detail.value });
  },
  changeDateTime1(e) {
    this.setData({ dateTime1: e.detail.value });
  },
  changeDateTimeColumn(e){
    var arr = this.data.dateTime, 
        dateArr = this.data.dateTimeArray;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray: dateArr,
      dateTime: arr
    });
  },
  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, 
        dateArr = this.data.dateTimeArray1;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({ 
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
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
    let rentStartDate,rentStartTime,rentEndDate,rentEndTime;
    let dateTimeArray = _this.data.dateTimeArray;
    let dateTime = _this.data.dateTime;
    let dateTimeArray1 = _this.data.dateTimeArray1;
    let dateTime1 = _this.data.dateTime1;
    rentStartDate = dateTimeArray[0][dateTime[0]] + '-' + dateTimeArray[1][dateTime[1]] + '-' + dateTimeArray[2][dateTime[2]];
    rentStartTime = dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]];
    rentEndDate = dateTimeArray1[0][dateTime1[0]] + '-' + dateTimeArray1[1][dateTime1[1]] + '-' + dateTimeArray1[2][dateTime1[2]];
    rentEndTime = dateTimeArray1[3][dateTime1[3]] + ':' + dateTimeArray1[4][dateTime1[4]];
    let beginTime = rentStartDate+' '+rentStartTime;
    let endTime = rentEndDate+' '+rentEndTime;
    // if(!_this.data.rentStartTime || !_this.data.rentEndTime){
    //   _this.dialog.showToast('请选择租用日期');//自定义弹窗组件
    //   return;
    // }
    if(!dateTime || !dateTime1){
      _this.dialog.showToast('请选择租用日期');//自定义弹窗组件
      return;
    }
    let data = {
      // beginTime: formatTimeStamp(_this.data.rentStartTime),
      // endTime: formatTimeStamp(_this.data.rentEndTime),
      beginTime: formatTimeStamp(beginTime),
      endTime: formatTimeStamp(endTime),
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
            // url: `/pages/car/bookCar/bookCar?rentStartTime=${_this.data.rentStartTime}&rentEndTime=${_this.data.rentEndTime}&carCode=${_this.data.carCode}`,
            url: `/pages/car/bookCar/bookCar?rentStartDate=${rentStartDate}&rentStartTime=${rentStartTime}&rentEndDate=${rentEndDate}&rentEndTime=${rentEndTime}&carCode=${_this.data.carCode}`,
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