// pages/login/login.js
//获取接口配置
const config = require('../../config/config')
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token:'',
    userInfo: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isBindPhone: false,//是否绑定手机号
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

    this.loadInitUserInfo();
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

    //判断是否有微信用户信息
    loadInitUserInfo(){
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo
        })
      } else if (this.data.canIUse){
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          this.setData({
            userInfo: res.userInfo
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            this.setData({
              userInfo: res.userInfo
            })
          }
        })
      }
    },
    //获取微信用户信息
    getUserInfo: function(e) {
      console.log(e)
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo
      })
      this.wxlogin();
    },
    //获取微信用户手机号
    getPhoneNumber: function(e){
      let _this = this;
      console.log('用户手机号',e);
      let code = '';
      let encryptedData= e.detail.encryptedData;
      let iv= e.detail.iv;
      wx.login({//调wx.login，获取code
        success(res) {
          if (res.code) {
            console.log("wxlogin↓");
            console.log(res.code);
            code = res.code;

            //发起网络请求 绑定手机号
            wx.request({
              method: "POST",
              url: config.bindWechatPhone_url,
              data: {
                encryptedData,
                iv,
                code
                // token: _this.data.token
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
                'token': _this.data.token
              },
              success(res){
                console.log(res);
                if (res.data.result=="100"){//调用接口返回数据成功
                  // wx.switchTab({
                  //   url: '/pages/my/my',
                  //   fail: function () {
                  //     console.log("跳转失败")
                  //   }
                  // })
                  wx.navigateBack()
                }else{
                  _this.dialog.showToast(res.data.message);//自定义弹窗组件
                }
              },
              fail(res) {//连接服务失败
                _this.dialog.showToast(res.errMsg);//自定义弹窗组件
              }
            })
          } else {
            _this.dialog.showToast(res.errMsg);//自定义弹窗组件
          }
        },
        fail(res) {
          _this.dialog.showToast(res.errMsg);//自定义弹窗组件
        }
      })
    },
    //微信登录
    wxlogin: function () {
      var _this = this;
      wx.login({
        success(res) {
          if (res.code) {
            console.log("wxlogin↓");
            console.log(res.code);
            console.log(_this.data.userInfo);
            //发起网络请求
            wx.request({
              method: "POST",
              url: config.wxLogin_url,
              data: {
                code: res.code,
                nickName: _this.data.userInfo.nickName,
                sex: _this.data.userInfo.gender,
                avatarUrl: _this.data.userInfo.avatarUrl
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success(res){
                console.log("wxloginsuccess↓");
                console.log(res);
                // _this.setData({
                //   sessionKey: res.data.session_key
                // });
                if (res.data.result=="100"){//调用接口返回数据成功
                  _this.setData({
                    token: res.data.data
                  })
                  wx.setStorageSync('token', res.data.data);
  
                  _this.queryUserInfo();
                  
                }else{
                  _this.dialog.showToast('登录失败！'+res.data.message);//自定义弹窗组件
                }
              },
              fail(res) {//连接服务失败
                _this.dialog.showToast(res.errMsg);//自定义弹窗组件
              }
            })
          } else {
            _this.dialog.showToast('登录失败！'+res.errMsg);//自定义弹窗组件
          }
        },
        fail(res) {//连接服务失败
          _this.dialog.showToast('登录失败！'+res.errMsg);//自定义弹窗组件
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
          console.log(res);
          if (res.data.result=="100"){//调用接口返回数据成功
            let data = res.data.data;
            if(data.phone){//已绑定手机号，则返回上一页
              // wx.switchTab({
              //   url: '/pages/my/my',
              //   fail: function () {
              //     console.log("跳转失败")
              //   }
              // })
              wx.navigateBack()
            }
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