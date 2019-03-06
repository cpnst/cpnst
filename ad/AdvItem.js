import { drawRoundRect, loadFile } from './Utils.js'

// 广告位
var advItem = function (master, conf) {
  this.ctx = master.context;
  this.conf = conf;

  var closeHitArea = this.init();
  if(closeHitArea) {

    window.clickAD = true
    console.log("=====10ADvItem=====", window.clickAD)
    closeHitArea.listeningObj = conf.closeButton.listening;
    master.event && master.event.appendHitArea(closeHitArea);
  }
}

advItem.prototype.init = function() {
  var self = this;

  drawRoundRect(self.ctx, null, self.conf.x, self.conf.y, self.conf.w, self.conf.h, self.conf.borderRadius, self.conf.bgColor)
  // 绘制关闭按钮
  if(self.conf.closeButton) {
    var conf = self.conf.closeButton;
    self.ctx.lineWidth = conf.borderWidth;
    self.ctx.strokeStyle = conf.borderColor;
    drawRoundRect(self.ctx, null, conf.x, conf.y, conf.w, conf.h, conf.borderRadius, conf.fillColor)
    self.ctx.font = conf.font
    self.ctx.fillStyle = conf.color
    var x = conf.x, y = conf.y + conf.h / 2 + 10
    if (conf.textAlign == 'center') {
      x += conf.w / 2
      self.ctx.textAlign = 'center'
    }
    self.ctx.fillText(conf.buttonText, x, y)

    return {
      x: conf.x,
      y: conf.y,
      w: conf.x + conf.w,
      h: conf.y + conf.h,
      type: 'close'
    };
  }

  return null;
}

advItem.prototype.createItem = function (conf, imgObj, cb) {
  var self = this;
  var itemCanvas = wx.createCanvas()
  var itemCtx = itemCanvas.getContext('2d')
  itemCtx.width = itemCanvas.width = conf.w
  itemCtx.height = itemCanvas.height = conf.h + 70

  var image = wx.createImage()
  image.onload = function() {
    drawRoundRect(itemCtx, image, 0, 0, image.width, image.height, conf.borderRadius)
    // 绘制图片标签
    if(conf.label) {
      var label = conf.label;
      var w = Math.abs(label.x), h = Math.abs(label.y), x = image.width - w, y = image.height - h;
      itemCtx.strokeStyle = 'white';
      drawRoundRect(itemCtx, null, x, y, w, h, 0, label.bgColor);
      itemCtx.font = label.font
      itemCtx.fillStyle = label.color
      itemCtx.textAlign = 'center'
      itemCtx.fillText(label.text, x + w / 2, y + h / 2 + 20)
    }

    // 添加图片标题
    if(imgObj.title) {
      var scale = image.width / itemCanvas.width
      var font = imgObj.font
      if (typeof font == "number") {
        font = font * scale;
        font = font + "px Arial"
      }
      else if (typeof font == "string") {
        var pos = font.indexOf("px");
        if (pos !== -1) {
          var fontSize = font.substring(0, pos);
          font = fontSize * scale
          font = font + "px Arial"
        }
      }

      itemCtx.font = font
      itemCtx.fillStyle = imgObj.color
      itemCtx.textAlign = "left"
      itemCtx.fillText(imgObj.title, 0, image.height + 60)
    }
    self.ctx.drawImage(itemCanvas, 0, 0, itemCanvas.width, itemCanvas.height, conf.x, conf.y, itemCanvas.width, itemCanvas.height)

    cb && cb({
      x: conf.x,
      y: conf.y,
      w: conf.x + itemCanvas.width,
      h: conf.y + itemCanvas.height,
      type: 'url',
      appid: imgObj.jumpTo,
      path: imgObj.path
    })
  }
  image.src = loadFile(imgObj.server, imgObj.imgUrl)
}

module.exports = advItem