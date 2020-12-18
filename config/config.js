// config.js
/**
 * 小程序后端接口配置文件
 */
var host = "https://hxc.ltb666.com"//测试服务

var config = {
  host,
  //POST 微信登录
  wxLogin_url: `${host}/app/wxLogin.do`,
  //获取用户信息
  queryUserInfo_url: `${host}/app/queryUserInfo`,
  //POST 查询是否绑定手机号
  // queryIsBindPhone_url: `${host}/app/queryIsBindPhone.do`,
  //POST 绑定手机号
  bindWechatPhone_url: `${host}/app/wechatBindPhone.do`,
  
  //GET 首页banner
  indexBanner_url: `${host}/wx_miniapp/queryIndexBannerList.do`,
  //GET 首页Icon
  indexBrand_url: `${host}/wx_miniapp/getBrandIcon.do`,
  //GET 查询热门牌子
  getHotBrand_url: `${host}/wx_miniapp/getHotBrand.do`,
  //GET 查询汽车列表
  getCarList_url: `${host}/wx_miniapp/getCarList.do`,

  //GET 获取车辆详情
  getCarInfo_url: `${host}/wx_miniapp/query-car-info`,
  //POST 检查租车时间是否可用
  checkTime_url: `${host}/wx_miniapp/order/check-time`,
  //GET 意向下单
  addOrder_url: `${host}/wx_miniapp/order/add-order`,
  
  //GET 订单列表
  orderList_url: `${host}/wx_miniapp/order/order-list`,
  //GET 订单详情
  orderInfo_url: `${host}/wx_miniapp/order/order-info`,

  //POST 图片上传接口 multipart/form-data
  imgUpload_url: `${host}/common/imgUpload.do`,
  //GET 身份证正面识别
  ocrIdCard_url: `${host}/wx/real-user/ocr-id-card`,
  //GET 驾照正面识别
  ocrDriver_url: `${host}/wx/real-user/ocr-driver`,
  //GET 提交身份证实名
  addRealUser_url: `${host}/wx/real-user/add-real-user`,
  //POST 提交驾驶证信息
  addDriver_url: `${host}/wx/real-user/add-driver`,

  //GET 生成微信预订单
  submitOrder_url: `${host}/wx_miniapp/order/submitOrder.do`,
  //GET 微信支付异步回调
  payResult_url: `${host}/wx_miniapp/order/pay-result`,
};
//对外把对象config返回
module.exports = config