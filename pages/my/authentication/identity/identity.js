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

  //图片上传接口
  imgUpload: function(tempFilePaths,tag){
    debugger
    let _this = this;
    wx.request({
      method: "POST",
      url: config.imgUpload_url,
      filePath: tempFilePaths[0],
      name: "file",
      // header: {
      //   "Content-Type": "multipart/form-data"
      // },
      // formData: {
      //   "file": tempFilePaths[0]
      // },
      success(res){
        if (res.data.result=="100"){//调用接口返回数据成功
          debugger
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
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
        // _this.setData({
        //   [photoTag]: res.tempFilePaths,//res.tempFilePaths为数组格式
        // });
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
})