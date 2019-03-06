// 广告单元列表
let adUnitIdList = [
  'adunit-46b6391acca59e7e',
  'adunit-9e8ee81e4533b474',
  'adunit-7d89050c846510ee',
  'adunit-b65b26af1ae48c3a',
  'adunit-5b85fe469a70a8c0'
];

let winSize = wx.getSystemInfoSync();
let w = winSize.screenWidth / 2;
let h = winSize.screenHeight;
console.log('w,h',w,h)

// 创建并显示banner广告
window.showBannerAd = function(i) {
  console.log('==广告创建==',i);
  if (window.gameConf.showbannerAd == 0) { window.bannerTop = window.innerHeight - 60; return; }
  /*let winSize = wx.getSystemInfoSync();
  let bannerHeight = 80;
  let bannerWidth = 300;
  window.bannerAd && window.bannerAd.destroy();
  window.bannerAd = wx.createBannerAd({
    adUnitId: adUnitIdList[i - 1],
    style: {
      left: (winSize.windowWidth - bannerWidth) / 2,
      top: winSize.windowHeight - bannerHeight,
      width: bannerWidth
    }
  });*/



  window.destroyBannerAd();
  window.bannerAd = wx.createBannerAd({
    adUnitId: adUnitIdList[i - 1],
    style: {
      left: 0,
      top: 0,
      width: 300
    }
  });
  //console.log('here');
  bannerAd.onLoad(() => {
    console.log('加载广告位成功')
  });
  bannerAd.onError((res) => {
    console.log('加载广告位失败', res)
  });
  bannerAd.onResize(res => {
    console.log('onResize');
    //console.log('onResize', h, bannerAd.style.realHeight, bannerAd.style.top);
    if(bannerAd.style.realHeight) {
      let offset = 0
      if (winSize.model.search("iPhone X") != -1) offset = 20
      bannerAd.style.left = w - bannerAd.style.realWidth / 2
      bannerAd.style.top = h - bannerAd.style.realHeight
      console.log('bannerAd', bannerAd.style.left, bannerAd.style.top);
      window.bannerTop = bannerAd.style.top - offset
      window.oldBannerTop = bannerAd.style.top
    }
    
    //console.log('==改变1==', bannerAd.style.left, bannerAd.style.top)
  });
  //console.log('show', h, bannerAd)
  window.bannerAd.show();
};
window.bannerTop = window.canvas.height - 120
// 隐藏banner广告
window.hideBannerAd = function(hide) {
  if (window.gameConf.showbannerAd == 0) return
  if(window.bannerAd) {
    hide == false ? window.bannerAd.show() : window.bannerAd.hide()
  }
};
// 销毁banner广告
window.destroyBannerAd = function() {
  if (window.gameConf.showbannerAd == 0) return
  window.bannerAd && window.bannerAd.destroy()
  window.bannerAd = null
};
let bannerOffset = 1
wx.onShow(function() {
  if(window.bannerAd) {
    var phone = wx.getSystemInfoSync();
    if(phone.model.search("iPhone X") != -1) {
      console.log("iphone X");
      window.bannerAd.style.top = window.oldBannerTop - bannerOffset
      if(bannerOffset == 0) bannerOffset = 1
      else bannerOffset = 0
    }
  }
});