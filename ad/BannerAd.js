import { getRandomArray, loadFile, winSize, navigateTo } from './Utils.js'
import Rule from './Rule.js'
import EventHook from './Event.js'
var topCanvas = require('./TopCanvas.js').getInstance();

/* 
  广告banner控制
  1.创建流量主广告及自主广告
  2.显示、隐藏、销毁、随机切换
  3.可配置宽度、高度、偏离、相对位置（顶部、底部）
*/
var BannerAd = function () {
  this.init();
};

BannerAd.prototype.init = function () {
  this.stoped = !0;
  this.ad = null;
  this.canShow = !1;
}

BannerAd.prototype.create = function (conf, imgObj) {
  var self = this;
  var image = wx.createImage();
  self.canvas = wx.createCanvas();

  console.log("30==>self.canvas==>", canvas.width, canvas.height)
  console.log("33==>self.canvas.style==>", self.canvas.style)
  self.context = self.canvas.getContext('2d');
  self.canvas1 = wx.createCanvas();
  self.context1 = self.canvas1.getContext('2d');
  self.canvas1.width = 1200   //画布尺寸
  self.canvas1.height = 320  //画布尺寸
  console.log("140==>", self.canvas)
  self.sys = wx.getSystemInfoSync().pixelRatio;
  console.log("124==>", self.sys)

  self.canvas.width = self.canvas.width * self.sys   //画布尺寸
  self.canvas.height = self.canvas.height * self.sys  //画布尺寸
  self.width = self.canvas.width;
  self.height = self.canvas.height;
  self.conf = conf;
  self.imgObj = imgObj;
  console.log("44=>conf=>", self.conf, "==<imgObj=>", imgObj)
  // 根据广告策略随机生成广告
  var result = false;
  if (conf.rules && typeof (conf.rules) == 'function') { // 自定义规则
    result = conf.rules();
  }
  else {
    result = (new Rule()).test(conf.rules, conf.op);
  }
  if (result) {
    if (self.conf.type == 'wxBannerAd') {
      self.createWxBannerAd();  // 创建流量主广告
    }
    else {
      self.createBannerAd(imgObj);  // 创建自主广告
    }
  }
  self.canShow = result;

  return self.canShow;
}

BannerAd.prototype.show = function () {
  var self = this;
  console.log("BannerAd.prototype.show=>self.ad=>",self.ad)
  if (self.canShow == !0) {
    topCanvas.top('bannerAd', self.canvas);   // 加入画布顶层
    self.ad && self.ad.type == 'wxBannerAd' && self.ad.instance.show();
    (self.conf.type == 'wxBannerAd' && !self.ad) && (self.showed = !0);
    if (self.conf.interVal != 0) {
      self.bannerAdTimer = setInterval(function () {
        (self.conf.type == 'wxBannerAd') ? self.createWxBannerAd() : self.createBannerAd(self.imgObj);
      }, self.conf.interVal * 1000)


    }
  }
}

BannerAd.prototype.hide = function () {
  console.log("BannerAd.prototype.hide")
  var self = this;
  self.bannerAdTimer && clearInterval(self.bannerAdTimer);
  if (self.canShow == !0) {
    // console.log("88==>self.ad.instance==>", self.ad.instance)
    self.ad && self.ad.type == 'wxBannerAd' && self.ad.instance.hide();
    (self.conf.type == 'wxBannerAd' && !self.ad) && (self.showed = !1);
    topCanvas.pop('bannerAd');  // 从主画布删除
  }
}

BannerAd.prototype.createWxBannerAd = function () {
  var self = this;
  self.ad && self.ad.instance.destroy();
  console.log("=====BannerAd.prototype.createWxBannerAd=====")
  var bannerWidth = 300, bannerHeight = 80;
  var offsetX = self.conf.offsetX || 0;
  var offsetY = self.conf.offsetY || 0;
  var l = (winSize.width - bannerWidth) / 2 + offsetX;
  var t = self.conf.position == 'top' ? offsetY : (winSize.height - bannerHeight + offsetY);
  var bannerAd = wx.createBannerAd({
    adUnitId: self.conf.adUnitId,  // 广告id
    style: {
      left: l,
      top: t,
      width: bannerWidth
    }
  });
  bannerAd.onResize((res) => {
    bannerAd.style.top = self.conf.position == 'top' ? offsetY : (winSize.height - bannerAd.style.realHeight + offsetY);
  });
  bannerAd.onLoad(() => {

    self.ad = {
      type: 'wxBannerAd',
      id: self.conf.adUnitId,
      instance: bannerAd/*,
      created: !0,
      show: !1*/
    };

    if (self.showed == !0 ) bannerAd.show(),self.showed == !1;
    //edit11-21
  });
}

BannerAd.prototype.createBannerAd = function (imgObj) {
  console.log("131=========>", window.gameConf.Showbanner1)
  if (window.gameConf.Showbanner1 == 0) return;
  if (imgObj) {
    var self = this;
    console.log("133==>imgObj.bannerList", window.FootBannerCount)
    if (window.FootBannerCount < 6){
      console.log("133.1")
      var imgList = imgObj.VideoBannerList
    }
    else{
      console.log("133.2===>", imgObj.bannerList)
      var imgList = imgObj.bannerList
    }
    var imgItem = getRandomArray(imgList)[0];
    console.log("135==>",imgItem)
    var image = wx.createImage();

    image.onload = function () {

      // 屏幕自适应
      var deviceOrientation = (winSize.width / winSize.height > 1) ? "landscape" : "portrait";
      var scale = winSize.width / (deviceOrientation == "portrait" ? 320 : 568);
      var w = 300 * self.sys;   //image宽度
      var h = 80 * self.sys;    //image高度
      var offsetX = self.conf.offsetX || 0;
      var offsetY = self.conf.offsetY || 0;
      var x = (self.canvas.width - w) / 2 + offsetX;  //x轴偏移量
      var y = self.conf.position == 'top' ? offsetY : (self.canvas.height - h + offsetY);    //
      self.context.drawImage(image, 0, 0, image.width, image.height, x, y, w, h);
      self.ad = {
        type: 'bannerAd',
        id: self.conf.adUnitId,
        instance: self.canvas/*,
        created: !0,
        show: !1*/
      }

      self.bindEvent();
      self.event && self.event.appendHitArea({
        x: x,
        y: y,
        w: x + w,
        h: y + h,
        type: 'url',
        appid: imgItem.jumpTo,
        path: imgItem.path
      })
    };
    image.src = loadFile(imgItem.server, imgItem.imgUrl);
  }
}

BannerAd.prototype.destroy = function () {
  var self = this;

  self.bannerAdTimer && clearInterval(self.bannerAdTimer);
  if (self.canShow == !0) {
    if (self.ad && self.ad.type == 'wxBannerAd') {
      console.log('destroy')
      self.ad.instance.destroy();
      self.ad = null;
    }
    else {
      (self.conf.type == 'wxBannerAd' && !self.ad) && (self.showed = !1);
      self.context.clearRect(0, 0, self.width, self.height);
      self.ad = null;
    }
    self.event && self.event.off('touchstart');
    topCanvas.pop('bannerAd');
    self.canShow = !self.canShow;
  }
}

BannerAd.prototype.bindEvent = function () {
  var self = this;

  var eventCallFunc = function (eventObject) {
    if (self.canShow == !0 && eventObject) {
      if (topCanvas.seek('bannerAd') == -1) return;

      if (self.adCallback) {
        self.adCallback();
      }
      else
        navigateTo(eventObject.appid, eventObject.path);
    }
  };

  // 注册事件
  if (!self.event) {
    console.log('register event');
    self.event = new EventHook(self.context);
    self.event.on('touchstart', eventCallFunc);
  }
}

BannerAd.prototype.addAdUnitEvent = function (adUnitId, cb) {
  var self = this;
  if (self.conf.adUnitId == adUnitId) {
    self.adCallback = cb;
  }
}

module.exports = BannerAd;