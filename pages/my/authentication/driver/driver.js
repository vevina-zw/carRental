// pages/my/authentication/driver/driver.js
//获取接口配置
const config = require('../../../../config/config')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoPath3: [],
    photoPath4: [],

    licenseStartTime: '',//有效期开始时间 对应接口startDay
    licenseEndTime:'',//有效期结束时间 对应接口endDay
    token: '',
    no: '',//证件号
    firstDay: '',//初次领证时间
    type: '',//准驾类型
    firstImg: '',//驾驶证正面
    secondImg:'',//驾驶证反面
    userName: '',//姓名
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
    }
    
    if(options.userName){
      this.setData({
        userName: options.userName
      })
    }else if(app.globalData.userInfo){
      this.setData({
        userName: app.globalData.userInfo.userName
      })
    }else{
      this.queryUserInfo()
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
  
  bindStartDateChange: function(e) {
    this.setData({
      licenseStartTime: e.detail.value
    })
  },
  bindEndDateChange: function(e) {
    this.setData({
      licenseEndTime: e.detail.value
    })
  },
  bindFirstDayChange: function(e) {
    this.setData({
      firstDay: e.detail.value
    })
  },
  getLicenseNo: function(e){
    this.setData({
      no: e.detail.value
    })
  },
  getLicenseType: function(e){
    this.setData({
      type: e.detail.value
    })
  },

  //上传图片
  chooseImage: function chooseimage(e) {
    let _this = this;
    let photoTag = e.currentTarget.dataset.tag;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function success(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片 
        _this.setData({
          [photoTag]: res.tempFilePaths,//res.tempFilePaths为数组格式
        });
        _this.imgUpload(res.tempFilePaths, photoTag);
      }
    });
  },
  // 图片预览
  previewImage(e) {
    let _this = this;
    let photoTag = e.currentTarget.dataset.tag;
    wx.previewImage({
      urls: _this.data[photoTag],
      current: e.currentTarget.dataset.item,
    })
  },
  // 删除图片
  deleteImg: function (e) {
    let photoTag = e.currentTarget.dataset.tag;
    this.setData({
      [photoTag]: ''
    });
  },

  //图片上传接口
  imgUpload: function(tempFilePaths,tag){
    let _this = this;
    wx.uploadFile({
      method: "POST",
      url: config.imgUpload_url,
      filePath: tempFilePaths[0],
      name: "file",
      success(res){
        let data = JSON.parse(res.data)
        if (data.result=="100"){//调用接口返回数据成功
          // _this.setData({
          //   [tag]: data.data.src,
          // });
          if(tag =="photoPath3"){//驾驶证正面识别
            _this.setData({
              firstImg: data.data.src
            })
            _this.ocrDriver();
          }else if(tag =="photoPath4"){
            _this.setData({
              secondImg: data.data.src
            })
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

  //驾驶证正面识别
  ocrDriver: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.ocrDriver_url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      data: {
        url: _this.data.firstImg
      },
      success(res){
        if (res.data.result=="100"){//识别通过
          let no = res.data.data.drivingLicenseNo;//驾驶证 证件号
          let type = res.data.data.drivingLicenseType;//驾驶证 准驾类型
          let firstDay = res.data.data.drivingLicenseFirstGetDate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");//驾驶证 初次领证时间
          let licenseStartTime = res.data.data.drivingLicenseValidityDataStart.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");//驾驶证 有效起始时间
          let licenseEndTime = res.data.data.drivingLicenseValidityDataEnd.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");//驾驶证 有效结束时间
          _this.setData({no,type,firstDay,licenseStartTime,licenseEndTime})
        }else{//识别不通过
          _this.dialog.showToast(res.data.message+'请重新上传');
          _this.setData({
            photoPath3: [],
            firstImg: '',
          })
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);
        _this.setData({
          photoPath3: [],
          firstImg: '',
        })
      }
    })
  },

  //提交身份证实名
  addDriver: function(){
    let _this = this;
    if(!_this.data.firstImg || !_this.data.secondImg){
      _this.dialog.showToast('请上传驾驶证照片');
      return;
    }else if(!_this.data.no || !_this.data.firstDay || !_this.data.type || !_this.data.licenseStartTime || !_this.data.licenseEndTime){
      _this.dialog.showToast('请补全驾驶证信息');
      return;
    }
    let data = {
      startDay: _this.data.licenseStartTime,
      endDay: _this.data.licenseEndTime,
      no: _this.data.no,
      firstDay: _this.data.firstDay,
      type: _this.data.type,
      firstImg: _this.data.firstImg,
      secondImg: _this.data.secondImg,
      name: _this.data.userName
    }
    wx.request({
      method: "POST",
      url: config.addDriver_url,
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      data,
      success(res){
        if (res.data.result=="100"){//调用接口返回数据成功
          wx.switchTab({
            url: '/pages/my/my',
          })
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
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
          _this.setData({
            userName: data.userName
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