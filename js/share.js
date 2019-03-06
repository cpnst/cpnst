/**
 * 分享
 */
var GAME_VERSIONS = "_" + window.GAME_VERSIONS;
var SHARE_CONFIG_KEY = "SHARE_CONFIG_KEY_1";
var SHARE_CONFIG_PATH = 'https://127.0.0.1:16000/'+'moto/share/shareConfig' + GAME_VERSIONS + '.json';
var SHARE_CONFIG_DATA = {
  "hotShareData": [
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_1.jpg",
      "text": "bigbang胜利恋情曝光，女方是圈外人，容貌不输艺人"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_2.jpg",
      "text": "赵丽颖给我发消息，告诉我这只是个炒作！"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_3.jpg",
      "text": "检测身边朋友对你是真情还是假意的时候到了"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_4.jpg",
      "text": "看见漂.亮的小姐姐要学会分享"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_5.jpg",
      "text": "【做梦】别人早已越过龙门，你还在转发锦鲤"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_6.jpg",
      "text": "锦鲤游世界的清单全曝光，游啊游，终于游回家了~"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_7.jpg",
      "text": "为什么有人看问题一针见血，而有人只能看懂皮毛？"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_8.jpg",
      "text": "10分钟，甲醛浓度骤降10倍！"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_9.jpg",
      "text": "人生千万不能犯的3个大忌！"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_10.jpg",
      "text": "凭什么：家长没批改孩子作业竟被老师嘲讽？"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_11.jpg",
      "text": "日本艺人会偷税漏税吗？收入真的这么低？"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_12.png",
      "text": "赵丽颖冯绍峰领证,半个娱乐圈都在祝福,4个男人没有送祝福"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_13.png",
      "text": "有一种同框叫远离贾玲,和她同框谁都赢不了她"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_14.png",
      "text": "继赵丽颖和冯绍峰官宣之后,他也\"交卷\"了,并且伴郎团相当的帅"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_15.png",
      "text": "去陈赫开的火锅店吃饭,结账时,账单上3个打字让人费解!"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_16.jpg",
      "text": "吃猪蹄真的能抗衰老?真正抗衰老的是此5种食物"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_17.png",
      "text": "终于有答案了,先有鸡还是先有蛋?已经有科学家给出了答案"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_18.png",
      "text": "火箭获22+4悍将,3换1初步达成协议,夺冠指日可待"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_19.png",
      "text": "中国最怪的两座城,一个3点日出,一个23点日落,像出国了一样"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_20.png",
      "text": "如果油价涨到了10元/升,会对老百姓的生活造成什么影响?"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_21.png",
      "text": "菜刀上放一根\"缝衣针\",解决了千家万户的难题,学会受用一生!"
    },
    {
      "imgSrc": "https://127.0.0.1:16000/moto/share/hot_share_22.png",
      "text": "广东又一\"空城\",曾繁华度比深圳还高,如今街道都变得萧条"
    }
  ],
  "isShareGameAccelerate":0,
  //"isShareDiscount":[0,0],
	//"bikeDiscountList":[0,0.4,0.1,0.1]
  "isShareDiscount": {
    "0": [0, 0],
    "1": [3, 3],
    "2": [3, 3],
    "3": [3, 3],
    "4": [3, 3],
    "5": [3, 3],
    "6": [3, 3],
    "7": [3, 3],
    "8": [3, 3]
  },
  "bikeDiscountList": {
    "0": [],
    "1": [0, 0.4, 0.1, 0.1],
    "2": [0, 0.4, 0.1, 0.1],
    "3": [0, 0.4, 0.1, 0.1],
    "4": [0, 0.4, 0.1, 0.1],
    "5": [0, 0.4, 0.1, 0.1],
    "6": [0, 0.4, 0.1, 0.1],
    "7": [0, 0.4, 0.1, 0.1],
    "8": [0, 0.4, 0.1, 0.1]
  }
};

exports.default =  class Share {
  constructor() {
    this.systemInfoSync = wx.getSystemInfoSync();
    this.config = wx.getStorageSync(SHARE_CONFIG_KEY) || SHARE_CONFIG_DATA;
    this.updataeTime = 0;
    this.updataeConfig();
  }
  /**
   * 分享配置加载失败
   */
  onFail(res){
    console.log("=======fail")
    console.log(res)
    console.log("=======fail")
    this.updataeTime = 0;
  }
  /**
   * 分享配置加载成功
   * res 配置数据
   */
  onSuccess(res) {
    console.log("=======Success")
    console.log(res)
    console.log("=======Success")
    if(res.statusCode == 200){
      this.config = res.data
      wx.setStorageSync(SHARE_CONFIG_KEY,this.config)
    }
  }
  /**
   * 分享配置加载完成
   * res 配置数据
   */
  onComplete() {
    
  }
  /**
   * 更新分享配置
   */
  updataeConfig() {
    console.log("performance.now() = ",performance.now())
    if(this.updataeTime &&  performance.now() - this.updataeTime < 1800){
      return
    }
    console.log("performance.now() 1")
    this.updataeTime = performance.now()
    wx.request({
      url:SHARE_CONFIG_PATH + "?" + Math.floor(performance.now()),
      method: 'GET',
      // header: {
      //   'content-type': 'application/json' // 默认值
      // },
      success: this.onSuccess.bind(this),
      fail: this.onFail.bind(this),
      complete: this.onComplete.bind(this)
    })
  }
  /**
   * 分享
   * callback 分享完成回调
   */
  onHotShare(callback){
    console.log("=======onShare")
    var callbackData = { isSuccess:false}
    // wx.onShareAppMessage();
    window.timer = new Date();

    var index = Math.floor((Math.random() * this.config.hotShareData.length))
    window.shareTicket = wx.shareAppMessage({
      title: this.config.hotShareData[index].text,
      imageUrl: this.config.hotShareData[index].imgSrc,
      complete: function (res) {
        console.log("onShare=======complete")
        console.log(res)
        callbackData.shareTickets = res.shareTickets
        callback && callback(callbackData)
      },
      success: function () {
        console.log("onShare=======success")
        //2.3.0以上版本不重复触发回调
        if ((compareVersion(wx.getSystemInfoSync().SDKVersion, "2.3.0") >= 0)) {
          window.timer = null;
          window.onShowCallback = null;
        }
        callbackData.isSuccess = true
      },
      fail: function () {
        console.log("onShare=======fail")
        callbackData.isSuccess = false
      }
    })
    if (compareVersion(this.systemInfoSync.SDKVersion, "2.3.0") >= 0) {
      window.onShowCallback = function(){
        callbackData.isSuccess = true
        callback && callback(callbackData)
        callback = null
      }
    }
  }
  getData(key){
    return this.config[key]
  }
}
//版本比较
var compareVersion = function(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  var len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (var i = 0; i < len; i++) {
    var num1 = parseInt(v1[i])
    var num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}