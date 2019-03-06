/* 
  数组随机排列
*/
exports.getRandomArray = function (arr) {
  if (arr && arr.length > 0) arr.sort(function () { return 0.5 - Math.random(); });
  return arr;
}

/* 
  获取手机屏幕分辨率
*/
exports.winSize = (function () {
  let sysInfo = wx.getSystemInfoSync()
  let winSize = {
    width: sysInfo.windowWidth,
    height: sysInfo.windowHeight
  }

  return winSize;
})();

/*
  JSON对象合并扩展
 */
exports.extend = (function () {
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
        //console.log(source)
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


/* 
  绘制圆角矩形
*/
exports.drawRoundRect = function (context, obj, x, y, w, h, r, c) {
  var pattern;
  if (obj) {
    pattern = context.createPattern(obj, "no-repeat");
  }

  //context.save();
  var min_size = Math.min(w, h);
  if (r > min_size / 2) r = min_size / 2;
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  !obj && context.stroke();
  context.closePath();

  if (pattern || c) {
    context.fillStyle = pattern || c;
    context.fill();
  }
  //context.restore();
}

//文件或文件夹, 不存在则创建
var fileMgr = wx.getFileSystemManager()
function hasFile(filePath) {
  var path = wx.env.USER_DATA_PATH + '/' + filePath
  fileMgr.access({
    path: path,
    fail: function (res) {
      //创建目录
      ownMkdir(filePath)
    }
  })
}
//创建文件夹
function ownMkdir(filePath) {
  if (filePath.indexOf("/") != -1) {
    var arr = filePath.split('/')
    var folder = wx.env.USER_DATA_PATH + '/';
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].indexOf(".") == -1) {
        folder += arr[i] + '/'
        fileMgr.mkdir({
          dirPath: folder,
          recursive: true
        })
      }
    }
  }
}

//加载文件
exports.loadFile = function (server, filePath) {
  //判断文件夹是否存在
  hasFile(filePath)

  var tempFilePath = wx.env.USER_DATA_PATH + '/' + filePath
  var url = tempFilePath
  try {
    fileMgr.readFileSync(tempFilePath)
  } catch (e) {
    url = server + filePath + '?' + Math.random()
    //缓存文件
    downloadFile(url, tempFilePath)
  }
  return url
}


//下载文件
function downloadFile(url, newFilePath) {
  wx.downloadFile({
    url: url,
    success: function (res) {
      fileMgr.saveFile({
        tempFilePath: res.tempFilePath,
        filePath: newFilePath
      })
    }
  })
}

/* 
  日期格式化
*/
exports.FormatDate = function (d) {
  var change = function (t) {
    if (t < 10) {
      return "0" + t;
    } else {
      return t;
    }
  }

  var d = d || new Date();
  var year = d.getFullYear();
  var month = change(d.getMonth() + 1);
  var day = change(d.getDate());
  var hour = change(d.getHours());
  var minute = change(d.getMinutes());
  var second = change(d.getSeconds());
  var time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

  return time;
}

/*
 小程序跳转
*/
exports.navigateTo = function (appid, path) {
  wx.navigateToMiniProgram({
    appId: appid,
    path: path,
    extraData: {
      path: path || ''/*, //此处path：?chid=0001&subchid=whys
      time: performance.now()*/
    }
  });
}