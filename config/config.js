// config.js
/**
 * 小程序后端接口配置文件
 */
var host = "http://120.55.50.219:8082"//测试服务

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

  //POST 图片上传接口 multipart/form-data
  imgUpload_url: `${host}/common/imgUpload.do`,
};
//对外把对象config返回
module.exports = config