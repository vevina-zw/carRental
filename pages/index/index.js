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
      // {
      //   "brandIcon": "../../image/index/sort_BMW.png",
      //   "brandName": "宝马",
      // },
      // {
      //   "brandIcon": "../../image/index/sort_Audi.png",
      //   "brandName": "奥迪",
      // },
      // {
      //   "brandIcon": "../../image/index/sort_Mercedes.png",
      //   "brandName": "奔驰",
      // },
      // {
      //   "brandIcon": "../../image/index/sort_luxury.png",
      //   "brandName": "豪华跑车",
      // },
    ],
    carLists:[],
    queryData:{
      "hot_flag": 1,
      "pageNo": 1,
      "pageSize": 10,
    },
    loading_more: false,
    warn:'',//正在加载/已全部加载完成/暂无数据...等
  },
  onLoad: function () {
    this.dialog = this.selectComponent("#toast");
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getIndexBanner();
    this.getIndexBrand();
    this.getCarListFunc();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let _this = this;
    if (_this.data.loading_more) {
      return;
    }
    let queryData = _this.data.queryData;
    let pageNo =  1;
    queryData.pageNo = pageNo;
    _this.setData({queryData})
    _this.getCarListFunc();
    this.getIndexBanner();
    this.getIndexBrand();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let _this = this;
    if (_this.data.loading_more || _this.data.warn == '已全部加载完成') {
      return;
    }
    let queryData = _this.data.queryData;
    let pageNo =  queryData.pageNo +1;
    queryData.pageNo = pageNo;
    _this.setData({queryData})
    _this.getCarListFunc();
  },

  goToSearch: function(){
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  goToCarDetail: function(e){
    wx.navigateTo({
      url: `/pages/car/carDetail/carDetail?carCode=${e.currentTarget.dataset.code}`
    })
  },
  goSearch: function(e){
    let brand = e.currentTarget.dataset.brand ? e.currentTarget.dataset.brand: null;
    wx.switchTab({
      // url: `/pages/search/searchResult/searchResult?searchValue=$brand=${brand}`,
      url: '/pages/search/searchResult/searchResult',//wx.switchTab不能传参，放在globalData里
    })
    app.globalData.brandType = brand;
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
  },

  getCarListFunc: function(){
    let _this = this;
    _this.setData({loading_more:true})
    wx.request({
      method: "POST",
      url: config.getCarList_url,
      data: _this.data.queryData,
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(res.data.data);
        if (res.data.result == "100") {//调用接口返回数据成功
          console.log(res.data.data)
          let carLists = res.data.data.list;
          if (res.data.data.hasPrePage) {//如果不是第一页
            carLists = _this.data.carLists.concat(carLists);
          }else{
            carLists = carLists
          }

          _this.setData({carLists})
          
          let warn = ''
          if(!res.data.data.hasNextPage && !res.data.data.hasPrePage && res.data.data.list.length<=0){
            warn = '暂无数据'
          }else if(!res.data.data.hasNextPage){//无下一页
            warn = '已全部加载完成'
          }
          _this.setData({
            carLists,warn
          });
        }else{
           _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      },
      complete: function () {
        wx.stopPullDownRefresh();
        _this.setData({loading_more:false})
      }
    })
  },
})
