//index.js
//获取接口配置
const config = require('../../config/config')
//获取应用实例
const app = getApp()

Page({
  data: {
    bannerData:[
      // "http://img.zcool.cn/community/014056564bd8596ac7251c94eb5559.jpg",
      // "http://img.zcool.cn/community/01e03b58047e96a84a0e282b09e8fc.jpg",
    ],
    indicatorDots: true,// 是否显示面板指示点
    vertical: false,// 滑动方向是否为纵向
    autoplay: true,// 自动切换
    circular: true,// 采用衔接滑动
    interval: 3000,// 自动切换时间间隔2s
    duration: 500,// 滑动动画时长0.5s
    indicatorColor: "rgba(255,255,255,.3)",//指示点颜色
    indicatorActiveColor: "#FFF",//指示点颜色

    brandData: [
      {
        "brandIcon": "../../image/index/sort_BMW.png",
        "brandName": "宝马",
      },
      {
        "brandIcon": "../../image/index/sort_Audi.png",
        "brandName": "奥迪",
      },
      {
        "brandIcon": "../../image/index/sort_Mercedes.png",
        "brandName": "奔驰",
      },
      {
        "brandIcon": "../../image/index/sort_luxury.png",
        "brandName": "豪华跑车",
      },
    ],


    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    
  },
  onLoad: function () {
    this.dialog = this.selectComponent("#toast");
    this.getIndexBanner();
    this.getIndexBrand();

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },


  goToSearch: function(){
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  goToCarDetail: function(){
    wx.navigateTo({
      url: '/pages/car/carDetail/carDetail'
    })
  },

  getIndexBanner: function(){
    let _this = this;
          wx.request({
            method: "GET",
            url: config.indexBanner_url,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success(res){
              console.log(res);
              if (res.data.result=="100"){//调用接口返回数据成功
                // bannerData
                let data = res.data.data;
                let bannerData = [];
                data.forEach(item=>{
                  bannerData.push(item.defaultPic)
                })
                _this.setData({bannerData})
              }else{
                _this.dialog.showToast(res.data.message);//自定义弹窗组件
              }
            },
            fail(res) {//连接服务失败
              _this.dialog.showToast(res.errMsg);//自定义弹窗组件
            }
          })
  },
  getIndexBrand: function(){
    let _this = this;
          wx.request({
            method: "GET",
            url: config.indexBrand_url,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success(res){
              console.log(res);
              if (res.data.result=="100"){//调用接口返回数据成功
                let brandData = res.data.data;
                _this.setData({brandData})
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
