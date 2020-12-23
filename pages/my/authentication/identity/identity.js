// pages/my/authentication/identity/identity.js
//获取接口配置
const config = require('../../../../config/config')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoPath1: [],
    photoPath2: [],
    token: '',
    name: '',//姓名
    idNo: '',//身份证号
    frontUrl: '',//身份证正面
    backUrl:'',//身份证反面
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

  getName: function(e){
    this.setData({
      name: e.detail.value
    })
  },
  getIdNo: function(e){
    this.setData({
      idNo: e.detail.value
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
          if(tag =="photoPath1"){//身份证正面识别
            _this.setData({
              frontUrl: data.data.src
            })
            _this.ocrIdCard();
          }else if(tag =="photoPath2"){
            _this.setData({
              backUrl: data.data.src
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

  //身份证正面识别
  ocrIdCard: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.ocrIdCard_url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      data: {
        url: _this.data.frontUrl
      },
      success(res){
        if (res.data.result=="100"){//识别通过
          let name = res.data.data.userName;//身份证 姓名
          let idNo = res.data.data.idcardNo;//身份证号
          _this.setData({name,idNo});
        }else{//识别不通过
          _this.dialog.showToast(res.data.message+'请重新上传');
          _this.setData({
            photoPath1: [],
            frontUrl: '',
          })
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);
        _this.setData({
          photoPath1: [],
          frontUrl: '',
        })
      }
    })
  },

  //提交身份证实名
  addRealUser: function(){
    let _this = this;
    if(!_this.data.frontUrl || !_this.data.backUrl){
      _this.dialog.showToast('请上传身份证图片');
      return;
    }else if(!_this.data.name || !_this.data.idNo){
      _this.dialog.showToast('请填写身份证信息');
      return;
    }
    let data = {
      frontUrl: _this.data.frontUrl,
      backUrl: _this.data.backUrl,
      name: _this.data.name,
      idNo: _this.data.idNo
    }
    wx.request({
      method: "GET",
      url: config.addRealUser_url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      data,
      success(res){
        if (res.data.result=="100"){//调用接口返回数据成功
          wx.navigateTo({
            url: `/pages/my/authentication/driver/driver?userName=${_this.data.name}`,
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
})