require('libs/weapp-adapter-min')
window.REMOTE_SERVER_ROOT = 'https://api.jusie.net/';
// window.REMOTE_SERVER_ROOT = 'http://127.0.0.1:16000/';
window.GAME_VERSIONS = 10036
window.scrollTo = function () { };

require("./js/update.js")
//window.topCanvas = require('./ad/TopCanvas.js').getInstance();
var AdPlugin = require('./ad/index.js')
window.adPlugin = new AdPlugin()
window.adPlugin.preload({
  appid: 'wxfcedc57fd240b4ab',
  version: window.GAME_VERSIONS.toString(),
  httpType: 'https',
  host: 'api.jusie.net',
  port: 80
});
/*window.FootBannerCount = 0;
window.showbanner = function (opts) {
  var options = opts || {
    position: 'bottom',
    offsetY: -80,
    rules: function () {
      return true;
    }
  };
  console.log("35")
  window.adPlugin.createBannerAd();
  window.adPlugin.addBannerEventListener('banner1', function () {
    console.log("32==>window.FootBannerCount=>", window.FootBannerCount)
    if (window.FootBannerCount < 6) {
      window.AdvshowVideoAd();
    }
    else
      window.adPlugin.run();
    window.FootBannerCount++;
  })
};

window.Alshowbanner = false
window.adPlugin.showBanner();
wx.request({
  url: "https://api.jusie.net/adv/appid/feicheversion.json?" + Math.random(),
  dataType: 'json',
  method: 'GET',
  success: function (res) {
    console.log(res.data.version)
    if (res.data.version == "1.1.0") {
      window.showbanner();
    }
  },
})
window.clickAD =false*/
// var Parser = require('libs/xmldom/dom-parser')
// window.DOMParser = Parser.DOMParser

//require('llewan-weixin-sdk/index')
// require('js/weapp-adapter')
require('js/bannerAd.js')
require('libs/common.js')
require('js/gameapi.js')
require('js/script.js')
require('js/share.js')
var share = require('js/share.js').default
window.share = new share()
require('js/all.js')

window.onShowCallback = null;
window.timer = null;
wx.onShow(function() {
  
  /*setTimeout(function() {
    window.onShowCallback && window.onShowCallback()
  }, 100);*/
  if (window.onShowCallback != null) {
    // 判断分享界面返回时间是否超过3秒
    if (window.timer != null) {
      var d = new Date()
      var l = d.getTime() - window.timer.getTime()
      if(l > 2e3){
       window.onShowCallback();
      }
      window.onShowCallback = null;
      window.timer = null;
    }
  }
})
window.HitinGame = 0 
window.flushLeftTime = false
window.toHideBanner = false

const loadTask = wx.loadSubpackage({
  name: 'audio',
  success(res) {
  },
  fail(res) {
  }
})

loadTask.onProgressUpdate(res => {
  console.log('下载进度', res.progress)
  console.log('已经下载的数据长度', res.totalBytesWritten)
  console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
})

/*wx.onAccelerometerChange(function(res){
  console.log('重力：',res.x,res.y,res.z)
})
wx.startAccelerometer({
  interval: 'normal'
})*/