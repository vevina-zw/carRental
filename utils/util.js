const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 日期转化为时间戳
const formatTimeStamp = date =>{
  // ios兼容：年-月-日 需转为 年/月/日
  let dateT = date.replace(/-/g,'/');
  return new Date(dateT).getTime();
}

//时间戳转化为日期 年-月-日
const formatDate = date =>{
  var time = new Date(date);
  var year = time.getFullYear();
  var month = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1);
  var day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate();
  var timeVal = year + '-' + month + '-' + day;
  return timeVal;
};
//时间戳转化为时间 时:分
const formatTime1 = date0 => {
  var date = new Date(date0);
  // const year = date.getFullYear()
  // const month = date.getMonth() + 1
  // const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  // const second = date.getSeconds()
  // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  return [hour, minute].map(formatNumber).join(':')
}

//计算相隔天数
const formatDateDifference = (sDate1, sDate2) => {    //sDate1和sDate2是2006-12-18格式  
  var dateSpan,
      tempDate,
      iDays;
  sDate1 = Date.parse(sDate1);
  sDate2 = Date.parse(sDate2);
  dateSpan = sDate2 - sDate1;
  dateSpan = Math.abs(dateSpan);
  iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
  return iDays
};
const formatDateTimeDifference = (sDate1, sDate2) => {    //sDate1和sDate2是2006-12-18 12:40格式  
  // ios兼容：年-月-日 时:分 需转为 年/月/日 时:分
  let date1 = sDate1.indexOf('T') == -1 ? sDate1.replace(/-/g,'/') : sDate1;
  let date2 = sDate2.indexOf('T') == -1 ? sDate2.replace(/-/g,'/') : sDate2;
  var date3 = new Date(date2).getTime() - new Date(date1).getTime();   //时间差的毫秒数    
//计算出相差天数
  var days=Math.floor(date3/(24*3600*1000))

  //计算出小时数
  var leave1=date3%(24*3600*1000)    //计算天数后剩余的毫秒数
  var hours=Math.floor(leave1/(3600*1000))
  //计算相差分钟数
  var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
  var minutes=Math.floor(leave2/(60*1000))
  //计算相差秒数
  var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
  var seconds=Math.round(leave3/1000)
  // console.log(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒")

  //本项目租车时长逻辑 不足24小时算一天↓
  let differenDay = days;
  if(hours>0 || minutes>0 || seconds>0){
    differenDay = differenDay +1;
  }
  return differenDay;
};

const formatTimeLeft = (datetimeFrom,datetimeTo) => {//取倒计时（天时分秒）
  let time0 = new Date(datetimeFrom).getTime();//倒计时开始时间
  let time1 = new Date(datetimeTo).getTime();//倒计时结束时间
  let time2 = new Date().getTime();//当前时间
  if(time0>time2){//还没到倒计时开始时间
    return -1;
  }else if(time2>time1){//已过倒计时结束时间
    return -1;
  }

  // 计算目标与现在时间差（毫秒）
  let mss = time1 - time2;
   
  // 将时间差（毫秒）格式为：天时分秒
  let days = parseInt(mss / (1000 * 60 * 60 * 24));
  let hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = parseInt((mss % (1000 * 60)) / 1000);
  if(days<=0 && hours>0){
    return hours + "时" + minutes + "分" + seconds + "秒"
  }else if(days<=0 && hours<=0){
    return minutes + "分" + seconds + "秒"
  }else{
    return days + "天" + hours + "时" + minutes + "分" + seconds + "秒"
  }
}

//request封装
const wxRequest = (method, url, data, callback, errFun) =>{
  /**
  * 封装wx.request请求
  * method： 请求方式
  * url: 请求地址
  * data： 要传递的参数
  * callback： 请求成功回调函数
  * errFun： 请求失败回调函数
  **/
  wx.request({
    url: url,
    method: method,
    data: data,
    header: {
      'content-type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    dataType: 'json',
    success: function (res) {
      if (res.statusCode != 200) {
        wx.showToast({
          title: res.errMsg || "服务器异常",
          icon: 'none'
        })
        return;
      } else if (res.data.code == -100 || res.data.code == -106 || res.data.code == -109) {//未登录/登录失效
        /**
        -100 未登录；-106 token无效；-109 工程师id为空；-102 手机号码已注册,请登陆；-110  此手机号码未注册 跳转到注册页
        **/
        wx.redirectTo({
          url: '/pages/login/login'
        })
        return;
      } else if (res.data.code != 1) {
        wx.showToast({
          title: res.data.msg || "服务器异常",
          icon: 'none'
        })
        return;
      }
      //成功
      callback(res);
    },
    fail: function (err) {
      wx.showToast({
        title: err.errMsg || "链接服务器失败",
        icon: 'none'
      })
      // errFun(err);
    }
  })
}

module.exports = {
  formatTime,formatTimeStamp,formatDate,formatTime1,formatDateDifference,formatDateTimeDifference,formatTimeLeft,wxRequest
}
