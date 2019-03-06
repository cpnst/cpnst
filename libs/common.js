
window.FileSystemManager = wx.getFileSystemManager()
window.muted1 = !1;

//文件或文件夹, 不存在则创建
function hasFile(filePath){
	var path = wx.env.USER_DATA_PATH + '/' + filePath
	window.FileSystemManager.access({
		path : path,
		fail : function(res) {
			//创建目录
			ownMkdir(filePath)
		}
	})
}
//创建文件夹
function ownMkdir(filePath){
	if (filePath.indexOf("/") != -1) {
		var arr = filePath.split('/')
		var folder = wx.env.USER_DATA_PATH + '/';
		for (var i = 0; i < arr.length; i++) {
		  	if (arr[i].indexOf(".") == -1) {
		  		folder += arr[i] + '/'
		  		FileSystemManager.mkdir({
					dirPath : folder,
					recursive : true
				})
		  	}
		}
	}
}

//加载文件
window.loadFile = function(filePath){
	//判断文件夹是否存在
	hasFile(filePath)
	var tempFilePath = wx.env.USER_DATA_PATH + '/' + filePath
	var url = tempFilePath
	try{
		FileSystemManager.readFileSync(tempFilePath)
	}catch(e){
		url = window.REMOTE_SERVER_ROOT + filePath + '?' + Math.random()
		//缓存文件
		downloadFile(url, tempFilePath)
	}
	return url
}


//下载文件
function downloadFile(url, newFilePath){
	wx.downloadFile({ 
		url : url,
		success : function(res) {
			window.FileSystemManager.saveFile({
				tempFilePath : res.tempFilePath,
				filePath : newFilePath
			})
		}
	})
}


//背景音乐
window.mainMusic = wx.createInnerAudioContext();
window.mainMusic.loop = true
window.mainMusic.volume = 0.5
window.mainMusic.obeyMuteSwitch = true
// window.mainMusic.autoplay = true
window.mainMusic.src = 'music/main.mp3'

window.musicOn = false
window.mainMusic.onPlay(function(){
  console.log('切换为主场景背景音乐')
	if (window.musicOn) {
		window.mainMusic.stop()
	}
  window.gameMusic.stop()
  window.music = window.mainMusic;
})

window.mainMusicAutoPlay = function (musicOn) {
  console.log('切换为主场景背景音乐2')
	window.musicOn = musicOn
    if (!musicOn) {
        window.mainMusic.play()
    }else{
        window.mainMusic.stop()
    }
}

window.gameMusic = wx.createInnerAudioContext();
window.gameMusic.loop = true
window.gameMusic.volume = 0.5
window.gameMusic.obeyMuteSwitch = true
window.gameMusic.src = 'music/game.mp3'

window.gameMusic.onPlay(function () {
  console.log('切换为游戏场景背景音乐')
  if (window.musicOn) {
    window.gameMusic.stop()
  }
  window.mainMusic.stop()
  window.music = window.gameMusic;
})

window.music = window.mainMusic
wx.onShow(function (res) {
  if (!window.muted1){
    //window.mainMusic.play();
    window.music.play();
  }
})

//所有音乐
window.HitSoundAudios = [
  "beep",
  "crash0",
  "crash1",
  "scoreTotal1",
  "overtake0",
  "overtake1",
  "overtake2",
  "rev0",
  "horn0",
  "horn1",
  "buyUpgrade",
  "engine0",
  "buyBike",
  "rev1",
  "raceFail",
  "mapBut",
  "closePass0",
  "closePass1",
  "closePass2",
  "stageSuccess",
  "inDraft",
  "coin0",
  "engine1",
  "engine2",
  "click",
  "scoreTotal0",
  "raceStart",
  "coin1",
  "silence"
]

window.HitAudios = []

window.listenerAudioPlay = function (key) {
    if (HitSoundAudios.indexOf(key) != -1) {
        if (typeof(HitAudios[key]) === 'object') {
            HitAudios[key].play()  
        }else{
          let src = 'audio/' + key + '.mp3'
            let soundAudio = wx.createInnerAudioContext()
            soundAudio.src = src
            soundAudio.obeyMuteSwitch = true
            HitAudios[key] = soundAudio  
          HitAudios[key].play();
        }
    }
}


window.audioStop = function(){
  console.log(HitAudios);
  for(let i =0;i<window.HitAudios.length;i++){
    HitAudios[i].stop();
  }
  HitAudios =  [];
}



// 设置屏幕常亮
wx.setKeepScreenOn({
    keepScreenOn: true
})




//分享
window.SHARE_TITLE = [
  '【新邀请】比赛极限漂移，谁才是赛道上的王者？',
  'battle是什么，我用一场show来证明！',
  '有人@你，我领到豪车了，数量有限，你赶紧也领！'
]

window.SHARE_IMAGEURL = [
  'images/share_menu.jpg',
  'images/share_main.jpg',
  'images/share_bike.jpg'
]

//群排名分享
window.GroupShare = function(){
	let num = window.GROUPRANKING_TITLE.length
	let index = Math.floor(Math.random() * num)
	wx.shareAppMessage({
        title: window.GROUPRANKING_TITLE[index],
        imageUrl: window.SHARE_IMAGEURL[index],
        query: 'key1=GroupShare',
        success:function(res){
        	if (res.shareTickets[0] !== undefined){
        		window.shareTicket = res.shareTickets[0]
    			window.butEventHandler('groupRanking')	
        	}
        }
    })
}

// 新分享接口
window.FriendShare2 = function(cb = null) {
  console.log('调用分享接口')
  let titlenum = window.SHARE_TITLE.length
  let imgnum = window.SHARE_IMAGEURL.length
  let index = Math.floor(Math.random() * titlenum)
  window.onShowCallback = cb;
  wx.shareAppMessage({
    title: window.SHARE_TITLE[index],
    imageUrl: window.SHARE_IMAGEURL[index],
    success: function () {
      console.log('分享成功回调')
    },
    fail: function() {
      console.log('分享失败回调')
    },
    cancel: function() {
      console.log('分享取消回调')
      window.onShowCallback = null;
    },
    complete: function() {
      console.log('分享完成回调')
    }
  }); 
};


//分享
window.FriendShare = function(cb = null, n){
  console.log("===friendshare===", n)
  console.log("199==>", window.gameConf.versionCheck)
	let titlenum = window.SHARE_TITLE.length
  let imgnum = window.SHARE_IMAGEURL.length
  let index = Math.floor(Math.random() * titlenum)
  if(n && n >=0 && n <=2) index = n
  //let imgindex = Math.floor(Math.random() * imgnum)
	wx.shareAppMessage({
    title: window.SHARE_TITLE[index],
        // imageUrl : window.loadFile(window.SHARE_IMAGEURL[index])
    imageUrl: window.SHARE_IMAGEURL[index],
    success: function() {
      if ((compareVersion(wx.getSystemInfoSync().SDKVersion, "2.3.0") >= 0)) {
        window.timer = null;
        window.onShowCallback = null;
      }
      console.log("213==>")
      cb && cb();
    }
  });
  //sdk.shareAppMessage({ type: n, success: cb });
  if (window.gameConf.versionCheck) {
    if (compareVersion(wx.getSystemInfoSync().SDKVersion, "2.3.0") >= 0) {
      
      cb && (window.onShowCallback = cb, window.timer = new Date());
      console.log("219==>", window.onShowCallback, window.timer)
    }
  }
}



//右上角分享
wx.showShareMenu({
    withShareTicket:true
})
wx.onShareAppMessage(function(res){
	let num = window.SHARE_TITLE.length
	//let index = Math.floor(Math.random() * num)
  let index = 0
    return {
        title : window.SHARE_TITLE[index],
        // imageUrl : window.loadFile(window.SHARE_IMAGEURL[index])
        imageUrl : window.SHARE_IMAGEURL[index]
    }
})

//获取最高成绩
window.setHiscode = function(hiscode){
	// console.log('hiscode ==> ' + hiscode)
	//个人成绩 给  赋值排行榜
	// let getOpenDataContext = wx.getOpenDataContext()
	window.openDataContext.postMessage({
			type : 'setScore',
			score : hiscode
	})
}

//显示banner广告
// var bannerTimer;
// window.bannerAd = null;
// window.showBannerAd = function(offsetX, offsetY) {
//   if (window.gameConf.showbannerAd == 0) return;

//   var show = function() {
//     offsetX = offsetX || 0;
//     offsetY = offsetY || 0;

//     let winSize = wx.getSystemInfoSync();
//     let bannerHeight = 80;
//     let bannerWidth = 300;
//     (window.bannerAd) && (window.bannerAd.destroy());
//     window.bannerAd = wx.createBannerAd({
//       adUnitId: 'adunit-46b6391acca59e7e', //填写广告id
//       style: {
//         left: (winSize.windowWidth - bannerWidth) / 2 + offsetX,
//         top: winSize.windowHeight - bannerHeight + offsetY,
//         width: bannerWidth
//       }
//     });
//     window.bannerAd.show();
//     bannerAd.onResize(res => {
//       bannerAd.style.top = winSize.windowHeight - bannerAd.style.realHeight + offsetY
//     })
//   };

//   if(window.gameConf.bannerInterval != 0)
//     bannerTimer = setInterval(show, window.gameConf.bannerInterval);
//   return show();
// }

//window.destroyBannerAd = function() {
//  if (window.bannerAd) {
//    bannerTimer && clearInterval(bannerTimer);
//    window.bannerAd.destroy();
//    window.bannerAd = null;
//  }
//}

//激励视频3e01221f8ae8c5a7
//video广告
//video广告
window.AdvshowVideoAd = function () {
  console.log("激励视频")
  //window.adPlugin.hideBanner();
  window.videoAd = wx.createRewardedVideoAd({
    adUnitId: 'adunit-2d1d862fb4a9293c'
  })
  window.videoAd.load()
    .then(() => window.videoAd.show())
    .catch(err => window.adPlugin.run(),
    
    )
  window.videoAd.onClose(function (res) {
    console.log('Close VIDEO - res', res)
    window.adPlugin.showBanner()
  })
  window.videoAd.onError(function(err) {
    console.log(err.errMsg);
  })
}

window.showVideoAd = function (cb) {
  let videoAd = wx.createRewardedVideoAd({
    adUnitId: 'adunit-2d1d862fb4a9293c'
  })

  videoAd.onClose(function (isEnded) {
    cb && cb(isEnded);
    cb = null;
  })

  videoAd.onError(function(err) {
    console.log(err.errMsg);
    window.FriendShare(function () {
      cb && cb({ isEnded: !0 });
      cb = null;
    });
  })

  videoAd.load()
    .then(() => videoAd.show())
    /*.catch(err => {
      console.log(err.errMsg);
      window.FriendShare(function () {
        cb && cb({ isEnded: !0 });
        cb = null;
      });
    })*/
}
// 提示
window.showToast = function(text, icon) {
  wx.showToast({
    title: text,
    duration: 2500,
    icon: icon || 'none'
  })
}

// 倒计时
window.checkLeftTime = function(d) {
  var leftTime = !1;

  var s = new Date(d);
  var e = new Date();
  var t = window.gameConf.leftTimeInterval - (e.getTime() - s.getTime());
  if (t > 0) {
    var hours = Math.floor(t / 36e5); //时
    var l = t % 36e5;
    var minutes = Math.floor(l / 6e4);  //分
    l = l % 6e4;
    var seconds = Math.floor(l / 1e3);  //秒

    leftTime = !0;
  }

  return leftTime;
};
// 免费加速
window.FreedSpeedcheckLeftTime = function (d) {  
  var leftTime = !1;

  var s = new Date(d);
  var e = new Date();
  var t = window.gameConf.freeSpeed - (e.getTime() - s.getTime());
  if (t > 0) {
    var hours = Math.floor(t / 36e5); //时
    var l = t % 36e5;
    var minutes = Math.floor(l / 6e4);  //分
    l = l % 6e4;
    var seconds = Math.floor(l / 1e3);  //秒

    leftTime = !0;
  }

  return leftTime;
};
//计算免费加速剩余时间
window.FreedSpeedgetLeftTimeFormatString = function (d) {
  var str = '';

  var s = new Date(d);
  var e = new Date();
  var t = /*24 * 36e5*/window.gameConf.freeSpeed - (e.getTime() - s.getTime());
  if (t > 0) {
    var hours = Math.floor(t / 36e5); //时
    var l = t % 36e5;
    var minutes = Math.floor(l / 6e4);  //分
    l = l % 6e4;
    var seconds = Math.floor(l / 1e3);  //秒

    var format = function (i) {
      return i < 10 ? ('0' + i) : i;
    }

    str =format(minutes);
    str += ':' + format(seconds);
  }

  return str;
}
window.getLeftTimeFormatString = function(d) {
  var str = '';

  var s = new Date(d);
  var e = new Date();
  var t = /*24 * 36e5*/window.gameConf.leftTimeInterval - (e.getTime() - s.getTime());
  if (t > 0) {
    var hours = Math.floor(t / 36e5); //时
    var l = t % 36e5;
    var minutes = Math.floor(l / 6e4);  //分
    l = l % 6e4;
    var seconds = Math.floor(l / 1e3);  //秒

    var format = function(i) {
      return i < 10 ? ('0' + i) : i; 
    }

    str = format(hours);
    str += ':' + format(minutes);
    str += ':' + format(seconds);
  }
  
  return str;
}
//版本库比较
window.compareVersion = function(v1, v2) {
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
window.isCloseShareVersion = function(){
  return window.compareVersion(wx.getSystemInfoSync().SDKVersion, "2.3.0") >= 0 
}

/*
  JSON对象合并扩展
 */
var extend = (function () {
  var isObjFunc = function (name) {
    var toString = Object.prototype.toString
    return function () {
      return toString.call(arguments[0]) === '[object ' + name + ']'
    }
  }
  var isObject = isObjFunc('Object'),
    isArray = isObjFunc('Array'),
    isBoolean = isObjFunc('Boolean')
  return function extend() {
    var index = 0, isDeep = false, obj, copy, destination, source, i
    if (isBoolean(arguments[0])) {
      index = 1
      isDeep = arguments[0]
    }
    for (i = arguments.length - 1; i > index; i--) {
      destination = arguments[i - 1]
      source = arguments[i]
      if (isObject(source) || isArray(source)) {
        for (var property in source) {
          obj = source[property]
          if (isDeep && (isObject(obj) || isArray(obj))) {
            copy = isObject(obj) ? {} : []
            var extended = extend(isDeep, copy, obj)
            destination[property] = extended
          } else {
            destination[property] = source[property]
          }
        }
      } else {
        destination = source
      }
    }
    return destination
  }
})();



window.gameConf = {
  gameSpeed: 1, //0直接获取1分享获取2视频获取
  viewport: 0,      /* 视角类型，目前无用 */
  enableMultiple: 1,  /* 是否启用分享翻倍功能，1显示0隐藏 */
  shareTypeArr: [0, 1, 1, 1, 1], /* 分享类型：0直接获取1分享获取2视频获取，数组位置0主菜单免费豪车，1主菜单免费加速，2地图特殊关卡，3加时，4三倍金币 */
  versionCheck: 1,  /* 是否进行版本检查，针对2.3.0以上版本 */
  showbannerAd: 1,  /* 是否显示banner 0隐藏，1显示 */
  bannerInterval: 15000,  /* banner是否定时切换，0为不切换 */
  leftTimeInterval: 86400, /* 主菜单免费豪车 */
  freeSpeed: 180000,/* 免费加速间隔时长 */
  shareCoins: 1000, /* 分享获取金币数 */
  overTime: 1000,  /* 加时时长 */
  MoreGameid: "id72"
};
var getGameConf = function () {
  wx.request({
    url: window.REMOTE_SERVER_ROOT + 'moto/json/gameConf_new.json?' + Math.random(),
    dataType: 'json',
    method: 'GET',
    success: function (res) {
      for (var k in res.data) {
        console.log("525==>", window.GAME_VERSIONS.toString())
        if (k == window.GAME_VERSIONS.toString()) {
          window.gameConf = extend(window.gameConf, res.data[k]);
          console.log("528==>",window.gameConf);
          break;
        }
      }
    }
  })
};
getGameConf();


