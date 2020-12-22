// pages/search/searchResult/searchResult.js
const config = require('../../../config/config')
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    conditionData: [
      {name:'综合排序'},
      {name:'品牌'},
      {name:'日均租金'},
    ],
    currentTab: 0,
    showConditionPanel: false,
    brandData:{},//品牌列表
    searchValue: '',//搜索关键字
    queryData:{
      "brand": "",
      "brandType": "",//首页车型搜索
      "hot_flag": 0,
      "pageNo": 1,
      "pageSize": 10,
      "price_high": null,
      "price_low": null,
      "price_order": null,
      "searchStr": ""
    },
    loading_more: false,
    warn:'',//正在加载/已全部加载完成/暂无数据...等
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");

    let _this = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res.screenHeight);
          _this.setData({
              sv_height: res.screenHeight - 104
          });
      }
    });

    _this.getHotBrand();
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
    let queryData = this.data.queryData;
    queryData.brand = app.globalData.brand || null;
    queryData.searchStr = app.globalData.searchValue || null;
    queryData.brandType = app.globalData.brandType || null;
    let searchValue = app.globalData.searchValue || null;
    this.setData({queryData,searchValue})
    this.getCarListFunc();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.searchValue = '';
    app.globalData.brand = '';
    app.globalData.brandType = '';
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

  clickCondition: function(e){
    if (this.data.showConditionPanel && (this.data.currentTab == e.currentTarget.dataset.idx)){
      this.closeConditionPanel()
      return
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      showConditionPanel: true
    })
  },
  getSearchValue: function(e){
    this.setData({
      searchValue: e.detail.value
    })
  },
  closeConditionPanel: function(){
    this.setData({
      showConditionPanel: false
    })
  },

  getHotBrand: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.getHotBrand_url,
      success(res){
        console.log(res);
        if (res.data.result=="100"){//调用接口返回数据成功
          let brandData = JSON.parse(res.data.data);
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

  setQueryItem: function(e){
    let sortType = e.currentTarget.dataset.stype;
    let price_order,price_high,price_low;
    //undefined是未点击该类目；""是点击全部 传""
    if(e.currentTarget.dataset.order == undefined){
      price_order = this.data.queryData.price_order;
    }else if(e.currentTarget.dataset.order == ""){
      price_order = null;
    }else{
      price_order = Number(e.currentTarget.dataset.order);
    }
    if((this.data.queryData.price_low == Number(e.currentTarget.dataset.lprice) && this.data.queryData.price_high == Number(e.currentTarget.dataset.hprice))
        || (this.data.queryData.price_low == Number(e.currentTarget.dataset.lprice) && !e.currentTarget.dataset.hprice)){
      //再次点击,取消选中
      price_high = null;
      price_low = null;
    }else{
      price_high = e.currentTarget.dataset.hprice!=undefined ? Number(e.currentTarget.dataset.hprice) : this.data.queryData.price_high;
      price_low = e.currentTarget.dataset.lprice!=undefined ? Number(e.currentTarget.dataset.lprice) : this.data.queryData.price_low;
    }
    // let price_order = e.currentTarget.dataset.order!=undefined ? Number(e.currentTarget.dataset.order) : this.data.queryData.price_order;
    let brand = e.currentTarget.dataset.brand!=undefined ? e.currentTarget.dataset.brand : this.data.queryData.brand;
    // let price_high = e.currentTarget.dataset.hprice!=undefined ? Number(e.currentTarget.dataset.hprice) : this.data.queryData.price_high;
    // let price_low = e.currentTarget.dataset.lprice!=undefined ? Number(e.currentTarget.dataset.lprice) : this.data.queryData.price_low;
    let searchStr = this.data.searchValue;
    let brandType = this.data.queryData.brandType;
    let hot_flag = 0;
    let pageNo = 1;
    let pageSize = 10;
    let queryData = {brandType,price_order,brand,price_high,price_low,searchStr,hot_flag,pageNo,pageSize}
    debugger
    this.setData({queryData,showConditionPanel:false})
    this.getCarListFunc();
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
  refreshCarList: function(){//scroll-view 下拉刷新
    if (this.data.loading_more) {
      return;
    }
    let queryData = this.data.queryData;
    let pageNo =  1;
    queryData.pageNo = pageNo;
    this.setData({queryData})
    this.getCarListFunc();
  },
  loadMoreCarList: function(){//scroll-view 上拉加载
    if (this.data.loading_more || this.data.warn == '已全部加载完成') {
      return;
    }
    let queryData = this.data.queryData;
    let pageNo =  queryData.pageNo +1;
    queryData.pageNo = pageNo;
    this.setData({queryData})
    this.getCarListFunc();
  },
  goToCarDetail: function(e){
    wx.navigateTo({
      url: `/pages/car/carDetail/carDetail?carCode=${e.currentTarget.dataset.code}`
    })
  }
})