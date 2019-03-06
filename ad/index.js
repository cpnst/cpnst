import defaultOptions from './Config.js'
import { extend, getRandomArray, loadFile, winSize, navigateTo } from './Utils.js'
import EventHook from './Event.js'
import BannerItem from './BannerAd.js'
import AdvItem from './AdvItem.js'
import Widget from './Widget.js'
var topCanvas = require('./TopCanvas.js').getInstance();

/*
  定义广告插件
*/
var AdPlugin = function () {
  this.isshowBanner = false
  this.count = 0
  this.Alshowbanner = false
  this.closing = false
  this.components = []
  this.hitAreas = []
  this.needUpdate = false
  this.leftTimeVal = []
  this.bannerWidgets = []
  this.preloadCompleted = !1
  this.bindUpdate = this.update.bind(this);

  this.init();
}

/* 
  初始化
*/
AdPlugin.prototype.init = function () {
}

/*
  预加载处理，加载配置、图片资源等
*/
AdPlugin.prototype.preload = function (opts = {}) {
  var self = this;
  self.options = extend(defaultOptions, opts)

  // 加载配置文件
  self.options.baseUrl =
    self.options.httpType + '://' +
    self.options.host +
    (self.options.port === 80 ? '/' : (':' + self.options.port + '/')) +
    self.options.directory + '/';
  self.options.config = {}
  wx.request({
    url: self.options.baseUrl + self.options.configFile + '?' + Math.random(),
    method: 'GET',
    dataType: 'json',
    success: function (res) {
      var appid = self.loadConfig(res.data);
      if (appid) {
        var appConfigFileName = appid + (self.options.version ? ('_' + self.options.version) : '');
        wx.request({
          url: self.options.baseUrl + 'appid/' + appConfigFileName + '.json?' + Math.random(),
          method: 'GET',
          dataType: 'json',
          success: function (result) {
            for (var i in result.data.advList){
              if (result.data.advList[i].jumpTo == appid){
                result.data.advList.splice(i,1)  
              }
            }
            for (var k in result.data) {
              console.log("47.0==>",k)
              if (k == "bannerList"){
                console.log("74.0=>", result.data[k])
                var data = {}
                data.bannerList = result.data[k]
                self["bannerList"] = data
                // // self.bannerList.bannerList = result.data[k]
                // console.log("74.1==>", self[k][k])

                
              }   
              else{
              self[k] = result.data[k];}         }
            console.log("74==>",self)
            self.loadPic(result.data);
            self.loadfootPic()
            // self.options.preloadComplete && self.options.preloadComplete();
            // self.preloadCompleted = !0;

          }

        })
      }
    }
  })
}

/* 
  初始化配置
*/
AdPlugin.prototype.loadConfig = function (data) {
  var self = this;
  const appid = self.options.appid || 'default';

  // 判断当前手机模式为竖屏或横屏
  var deviceOrientation = (window.innerWidth / window.innerHeight > 1) ? "landscape" : "portrait";
  for (var key in data) {
    if (key.toLowerCase() == deviceOrientation) {
      var config = data[key];

      var defaultConfig = {};
      for (var i = 0; i < config.length; i++) {
        for (var j = 0; j < config[i].rules.length; j++) {
          if (config[i]['rules'][j].toLowerCase() == appid.toLowerCase()) {
            for (var k in config[i]) {
              self[k] = config[i][k]
            }
            return appid;
          }
          else if (config[i]['rules'][j].toLowerCase() == "default") {
            defaultConfig = config[i]
          }
        }
      }

      // 读取默认布局配置
      for (var k in defaultConfig) {
        self[k] = defaultConfig[k]
      }
      return appid;
    }
  }

  return null;
}

/* 
  预加载广告图片
*/
AdPlugin.prototype.loadPic = function (data) {
  var self = this;

  for (var i = 0; i < data.advList.length; i++) {
    data.advList[i].server = self.options.baseUrl;
    loadFile(self.options.baseUrl, data.advList[i].imgUrl);
  }
  for (var i = 0; i < data.bannerList.length; i++) {

    data.bannerList[i].server = self.options.baseUrl;
    console.log("131==>", data.bannerList[i].imgUrl)
    loadFile(self.options.baseUrl, data.bannerList[i].imgUrl);
  }
}


AdPlugin.prototype.loadfootPic = function () {
  var self = this;

  wx.request({
    url: "https://api.jusie.net/adv/banner/FootBanner.json?" + Math.random(),
    method: 'GET',
    dataType: 'json',
    success: function (result) {
      var Selction = result.data["Selction"];
      var FootBannerList = result.data[Selction]
      console.log("147==>", result.data[Selction])
      self["bannerList"]. VideoBannerList = FootBannerList
      console.log("74.1==>",self.bannerList)
      for (var i = 0; i < FootBannerList.length; i++) {

        FootBannerList[i].server = self.options.baseUrl;
        console.log("74.2==>", FootBannerList[i].imgUrl)
        loadFile(self.options.baseUrl, FootBannerList[i].imgUrl);
      }
      self.options.preloadComplete && self.options.preloadComplete();
      self.preloadCompleted = !0;

    }

  })



}

/*
  开始运行
*/

AdPlugin.prototype.run = function (cb) {

  var self = this;
  if (self.isshowBanner == false) {
    setTimeout(function () {
      window.adPlugin.hideBanner()
    }, 100)
    
  }
  self.destroyed = false

  // 判断当前是否存在banner，存在是先隐藏

  self.closing = false;
  self.drawAD = false;
  self.drawWidget = false;

  self.mainCanvas = wx.createCanvas()
  self.mainContext = self.mainCanvas.getContext('2d')
  topCanvas.append('adWin', self.mainCanvas)

  // 创建离屏画布
  self.canvas = wx.createCanvas()
  self.context = self.canvas.getContext('2d')
  console.log('==self.width==', self.width)
  self.canvas.width = self.width
  self.canvas.height = 3000 //高度设置为3000，解决iphonex等底部问题
  self.x = 0            // 画布初始位置x
  self.y = 3000         // 画布初始位置y

  self.clear(0, 0, self.canvas.width, self.canvas.height)

  // 设置标题
  self.context.font = self.title.font;
  self.context.fillStyle = self.title.color;
  (self.title.textAlign == 'center') && (self.context.textAlign = "center")   // 文本居中
  self.context.fillText(self.title.text, self.title.x, self.title.y)
  // 绑定事件
  self.bindEvent()

  self.aniId && window.cancelAnimationFrame(self.aniId);
  self.aniId = window.requestAnimationFrame(self.bindUpdate);
  self.cb = cb || null;
  cb && cb.onCreate && cb.onCreate();
}

/*
  更新
*/
AdPlugin.prototype.update = function () {
  //if(!this.running) return;
  var self = this;

  // 动画效果处理
  if (!self.closing) {
    if (self.y > 0) {
      // 从底部弹出广告层
      self.y -= 50;
      self.y < 0 && (self.y = 0);
      self.needUpdate = true;
    }
    else {
      if (self.components) {
        var removeComponents = [];
        for (var i = 0; i < self.components.length; i++) {
          switch (self.components[i].type) {
            case 'leftTimeWidget':
              self.clear(self.components[i].conf.x, self.components[i].conf.y, self.components[i].conf.w, self.components[i].conf.h)
              self.needUpdate = self.components[i].widget.updateLeftTimeWidget()
              self.components[i].stop = self.needUpdate;
              self.leftTimeVal[self.components[i].conf.id] = self.components[i].widget.LeftTime;
              self.components[i].widget.LeftTime == 0 && (
                self.clear(self.components[i].conf.x, self.components[i].conf.y, self.components[i].conf.w, self.components[i].conf.h),
                removeComponents.push(i)
              );
              break;
          }
        }

        for (var i = 0; i < removeComponents.length; i++) {
          self.components.splice(i, 1)
        }
      }

      if (!self.drawAD) (self.createAdvItems(self.adv), self.drawAD = true)
      else if (!self.drawWidget) {
        setTimeout(function () { self.createWidgets(self.widgets); self.drawWidget = true; }, 300);
      }
    }
  }
  else {


    self.destroy()

  }

  /*if (self.needUpdate) {
    self.needUpdate = false;
    self.draw();
  }*/
  self.draw()

  if (!self.destroyed)
    self.aniId = window.requestAnimationFrame(self.bindUpdate);
}

/* 
   画布绘制
*/
AdPlugin.prototype.draw = function () {
  var self = this;

  // 绘制到主屏
  if (window.canvas) {
    let contextType = 0;
    let context = window.canvas.getContext('2d');
    if (!context) { contextType = 1; context = window.canvas.getContext('webgl'); }
    if (context) {
      let w = self.canvas.width, h = self.canvas.height;
      let scale = winSize.width / self.canvas.width;
      //self.mainCanvas = wx.createCanvas()
      //self.mainContext = self.mainCanvas.getContext('2d')
      //self.mainContext.clearRect(0, 0, self.canvas.width * scale, self.canvas.height * scale);
      //self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
      /*console.log(scale, window.canvas.width, window.canvas.height, window.innerWidth, window.innerHeight, self.canvas.width, self.canvas.height, winSize.width, winSize.height)
      scale = 0.3*/
      self.mainContext.clearRect(0, 0, self.canvas.width, self.canvas.height);
      self.mainContext.drawImage(self.canvas, 0, 0, self.canvas.width, self.canvas.height, self.x, self.y, self.canvas.width * scale, self.canvas.height * scale)

      if (contextType == 0) {
        let scale = window.canvas.width / winSize.width;
        //console.log('==scale==', scale)
        context.drawImage(self.mainCanvas, 0, 0, w, h, 0, 0, w * scale, h * scale);
        /*context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);   // 设置屏幕原点为坐上角，重要！！
        let scale = window.canvas.width / winSize.width;  // 自适应屏幕自定义分辨率
        context.drawImage(self.mainCanvas, 0, 0, w, h, 0, 0, w * scale, h * scale);
        context.restore();*/
        //window.TopCanvas.append(self.mainCanvas);
        //topCanvas.append('adWin', self.mainCanvas);
        //if(!self.appended) { topCanvas.append('adWin', self.mainCanvas), self.appended = true }
      }
      else {
        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, self.mainCanvas);
      }
    }

  }
}

/* 
  加载广告位
*/
AdPlugin.prototype.createAdvItems = function (conf) {

  var self = this;
  var adv = new AdvItem(self, conf)

  var redraw = function (e) {
    self.needUpdate = true;
    self.event && self.event.appendHitArea(e);
  };

  var iRow = 1, iCol = 1;
  var imgItems = getRandomArray(self.advList);
  for (var i = 0; i < conf.items.length; i++) {
    if (iRow > conf.rows) break;

    conf.items[i].x = conf.x + conf.padding * iCol + (iCol - 1) * conf.items[i].w;
    conf.items[i].y = conf.y + conf.lineHeight + conf.padding * iRow + (iRow - 1) * (conf.items[i].h + 100);
    conf.items[i].borderRadius = conf.items[i].borderRadius || (conf.itemsBorderRadius || 0);
    conf.items[i].label = conf.label || null
    if (imgItems && imgItems.length > i)
      adv.createItem(conf.items[i], imgItems[i], redraw);
    else break;

    if (iCol < conf.cols) iCol++;
    else iRow++ , iCol = 1
  }
  
}

/* 
  事件绑定 
*/
AdPlugin.prototype.bindEvent = function () {
  var self = this;

  var eventCallFunc = function (eventObject) {
    if (eventObject) {
      if (eventObject.type == 'url') {
        navigateTo(eventObject.appid, eventObject.path);
      }
      else if (eventObject.type == 'close') {
        console.log("点击关闭")
        window.clickAD = false
        window.flushLeftTime = false
        if (eventObject.listeningObj) {
          var currentVal = self.leftTimeVal[eventObject.listeningObj.id]

          if (currentVal == eventObject.listeningObj.val) {

            self.closing = true
            console.log("run---self.closing==>", self.closing, currentVal)
            if (window.Alshowbanner == false) {
              console.log("goforshowBanner==>Alshowbanner", window.Alshowbanner)
              window.adPlugin.showBanner()
              window.Alshowbanner = true
              console.log("完成打开banner1==>", window.Alshowbanner)
            }
            console.log("完成打开banner2==>", window.Alshowbanner)

          }
        }
        else self.closing = true
      }
    }

  };

  // 注册事件
  console.log("352=>eventCallFunc=>",eventCallFunc)
  self.event = new EventHook(self.context);
  self.event.on('touchstart', eventCallFunc);
}

/*
  清屏
*/
AdPlugin.prototype.clear = function (x, y, w, h, c) {
  var self = this;

  self.context.clearRect(x, y, w, h)
  self.context.fillStyle = c || self.bgColor
  self.context.fillRect(x, y, w, h)
}

/*
  创建widgets
*/
AdPlugin.prototype.createWidgets = function (widgets) {

  if (widgets == undefined || widgets == null || widgets.length == 0) return;

  var self = this;
  for (var i = 0; i < widgets.length; i++) {
    switch (widgets[i].type) {
      case 'button':
        var component = new Widget(self.context)
        component.createButton(widgets[i])
        self.components.push({
          type: widgets[i].type,
          conf: widgets[i],
          widget: component
        })
        self.hitAreas.push({
          x: widgets[i].x,
          y: widgets[i].y,
          w: widgets[i].w,
          h: widgets[i].h,
          type: 'close'
        })
        break;
      case 'leftTimeWidget':
        var component = new Widget(self.context)
        component.createLeftTimeWidget(widgets[i])
        self.components.push({
          type: widgets[i].type,
          conf: widgets[i],
          widget: component
        })
        break;
    }
  }
}

/* 
  创建banner广告条
*/
AdPlugin.prototype.createBannerAd = function (opts) {
  var self = this;

  function waitDone() {
    return new Promise(function (resolve, reject) {
      var i = setInterval(function () {
        if (self.preloadCompleted == !0) resolve(), clearInterval(i);
      }, 10);
      
    })
  };

  waitDone().then(() => {
    console.log("453==>", self.bannerList)
    var bannerList;
    if (typeof opts === 'object' && !isNaN(opts.length)) {
      bannerList = opts;
    }
    else if (self.banners) {
      bannerList = self.banners;
    }
    console.log("408==>", bannerList)
    if (bannerList && !self.hide) {
      for (var i = 0; i < bannerList.length; i++) {
        var bannerWidget = new BannerItem();
        console.log("440===bannerList[i]==>", bannerList[i], ", self.bannerList==>",self.bannerList)
        self.bannerCreated = bannerWidget.create(bannerList[i], self.bannerList);
        self.bannerWidgets.push({
          name: bannerList[i].adUnitId,
          ins: bannerWidget
        });
        console.log("408==>bannerWidgets==>", self.bannerWidgets.ins)
      }
    }
  });

}

/* 
  显示banner
*/
AdPlugin.prototype.showBanner = function () {
  var self = this;
  //self.bannerWidget && self.bannerWidget.show();
  /*if(self.bannerWidgets) {
    for(var i=0; i<self.bannerWidgets.length; i++) self.bannerWidgets[i].show();
  }*/
  if (window.Alshowbanner == false) {
    window.Alshowbanner = true

    function waitDone() {
      return new Promise(function (resolve, reject) {
        var i = setInterval(function () {
          //console.log('re2', self.bannerCreated)
          if (self.bannerCreated == !0) resolve(), clearInterval(i);
        }, 10);
      })
    };

    waitDone().then(() => {
      console.log("显示banner", self.bannerWidgets)

      console.log("显示window.clickAD==》",window.clickAD)
      if (self.bannerWidgets) {
        for (var i = 0; i < self.bannerWidgets.length; i++) self.bannerWidgets[i].ins.show();
      }
    });
  }
}

/*
  隐藏banner
*/
AdPlugin.prototype.hideBanner = function () {
  var self = this;
  self.hide = true;
  window.Alshowbanner = false
  console.log("471==>hidebanner==>Alshowbanner==>", window.Alshowbanner)
  //self.bannerWidget && self.bannerWidget.hide();
  console.log("451==>", self.bannerWidgets)
  console.log("452++>", self.bannerAdTimer)
  if (self.bannerWidgets) {
    console.log("隐藏banner")
    window.toHideBanner = true
    for (var i = 0; i < self.bannerWidgets.length; i++) console.log("493==>self.bannerWidgets[i].ins==>", self.bannerWidgets[i].ins),self.bannerWidgets[i].ins.hide();
  }

  self.hide = false;
}

/* 
  销毁banner
*/
AdPlugin.prototype.destroyBanner = function () {
  var self = this;

  //self.bannerWidget && (self.bannerWidget.destroyAll());
  if (self.bannerWidgets) {
    for (var i = 0; i < self.bannerWidgets.length; i++) {
      self.bannerWidgets[i].ins.destroy();
    }
  }

}

AdPlugin.prototype.addBannerEventListener = function (adUnitId, cb) {
  var self = this;
  console.log("触发监听")
  function waitDone() {
    return new Promise(function (resolve, reject) {
      var i = setInterval(function () {
        //console.log('re2', self.bannerCreated)
        if (self.bannerCreated == !0) resolve(), clearInterval(i);
      }, 10);
    })
  };

  waitDone().then(() => {
    if (self.bannerWidgets) {
      for (var i = 0; i < self.bannerWidgets.length; i++) {
        if (self.bannerWidgets[i].name == adUnitId) self.bannerWidgets[i].ins.addAdUnitEvent(adUnitId, cb);
      }
    }
  });


}

/* 
  窗口销毁
*/
AdPlugin.prototype.destroy = function (cb) {

  var self = this;

  if (self.y < 3000) {   // 设置一个不可见高度，判断超过该
    self.y += 50;
    console.log("释放资源-1")
    self.needUpdate = true;
    self.event && self.event.off('touchstart');
    self.aniId && window.cancelAnimationFrame(self.bindUpdate);
    self.cb && self.cb.onDestroy && self.cb.onDestroy();
  }
  else {
    // 释放资源
    console.log("释放资源")
    self.event && self.event.off('touchstart');
    self.aniId && window.cancelAnimationFrame(self.bindUpdate);
    self.destroyed = true
    self.cb && self.cb.onDestroy && self.cb.onDestroy();

    topCanvas.pop('adWin');
  }
}

module.exports = AdPlugin;
