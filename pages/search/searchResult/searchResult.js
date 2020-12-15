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

    searchValue: '',
    queryData:{
      "brandCode": "",
      "hot_flag": 0,
      "pageNo": 1,
      "pageSize": 10,
      "price_high": 0,
      "price_low": 0,
      "price_order": 0,
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
    _this.getCarListFunc();
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

  clickCondition: function(e){
    if (this.data.currentTab == e.currentTarget.dataset.idx){
      return;
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
  setQueryItem: function(e){
    let sortType = e.currentTarget.dataset.stype;
    let price_order = Number(e.currentTarget.dataset.order) || 0;
    let brandCode = e.currentTarget.dataset.brand || null
    let price_high = Number(e.currentTarget.dataset.hprice) || null;
    let price_low = Number(e.currentTarget.dataset.lprice) || null;
    let searchStr = this.data.searchValue;
    let hot_flag = 0;
    let pageNo = 1;
    let pageSize = 10;
    let queryData = {price_order,brandCode,price_high,price_low,searchStr,hot_flag,pageNo,pageSize}
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
          if(!res.data.data.hasNextPage && !res.data.data.hasPrePage){
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