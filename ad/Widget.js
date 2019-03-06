import { drawRoundRect, loadFile } from './Utils.js'

var Widget = function(ctx) {
  this.ctx = ctx
  this.currentVal = 10
  this.interVal = null
  this.start = false
  this.stop = false
  this.needUpdate = false

  Object.defineProperty(this, "LeftTime", {
    get: function() { return this.currentVal; }
  });
}

/*
  创建按钮
*/
Widget.prototype.createButton = function(conf) {
  var self = this;

  self.canvas = wx.createCanvas()
  self.context = self.canvas.getContext('2d')
  self.width = self.canvas.width = conf.w
  self.height = self.canvas.height = conf.h

  self.drawButton(conf)
  return true
}

/* 
  绘制按钮
*/
Widget.prototype.drawButton = function(conf) {
  var self = this;
  conf = conf || self.conf;

  self.context.lineWidth = conf.borderWidth;
  self.context.strokeStyle = conf.borderColor;
  drawRoundRect(self.context, null, 0, 0, self.width, self.height, conf.borderRadius, conf.fillColor)
  self.context.font = conf.font
  self.context.fillStyle = conf.color
  var x = 0, y = conf.h / 2 + 10
  if (conf.textAlign == 'center') {
    x = conf.w / 2
    self.context.textAlign = 'center'
  }
  self.context.fillText(conf.buttonText, x, y)

  self.ctx.drawImage(self.canvas, 0, 0, self.width, self.height, conf.x, conf.y, self.width, self.height)
}

/* 
  创建倒计时控件
*/
Widget.prototype.createLeftTimeWidget = function (conf) {
  var self = this;

  self.canvas = wx.createCanvas()
  self.context = self.canvas.getContext('2d')
  self.width = self.canvas.width = conf.w
  self.height = self.canvas.height = conf.h
  if (window.flushLeftTime == true){
    self.initVal = self.currentVal = 0
  }else{
  self.initVal = self.currentVal = conf.initVal}
  self.conf = conf

  self.drawLeftTimeWidget(conf)
}

/* 
  倒计时控件更新
*/
Widget.prototype.updateLeftTimeWidget = function() {
  var self = this;
  var updated = false;

  if (self.interVal == null && !self.start) {
    self.interVal = setInterval(() => {
      !self.start && (self.start = true);
      self.currentVal > 0 ? (self.currentVal--, self.needUpdate = true) : (clearInterval(self.interVal), self.stop = true, self.needUpdate = false);
    }, 1000)
  }

  if (!self.stop && self.needUpdate) {
    self.needUpdate = false
    // 渲染更新倒计时
    self.drawLeftTimeWidget(self.conf)
    updated = true;
  }

  return updated;
}

/* 
  绘制方法
*/
Widget.prototype.drawLeftTimeWidget = function(conf) {
  var self = this;

  conf = conf || self.conf;
  // 替换文本
  var text = conf.leftTimeText.replace('{0}', self.currentVal)

  self.context.clearRect(0, 0, self.width, self.height)
  if(self.currentVal > 0) {
    self.context.font = conf.font
    self.context.fillStyle = conf.color
    var x = 0, y = self.height / 2
    if (conf.textAlign == 'center') {
      x = self.width / 2
      self.context.textAlign = 'center'
    }
    self.context.fillText(text, x, y)

    self.ctx.drawImage(self.canvas, 0, 0, self.width, self.height, conf.x, conf.y, self.width, self.height)
  }
}

module.exports = Widget;