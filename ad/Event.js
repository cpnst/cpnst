import { winSize } from './Utils.js'

// 事件钩子处理
var eventHook = function (ctx) {
  this.hitAreas = [];
  this.width = ctx.canvas.width || winSize.width;
  this.height = ctx.canvas.height || winSize.height;
  this.eventTarget = ctx.canvas;

  this.eventHook = null;
};

eventHook.getInstance = function() {
  if (!this.instance) {
    this.instance = new eventHook();
  }

  return this.instance;
}

eventHook.prototype.init = function () {

};

/* 
  事件绑定 
*/
eventHook.prototype.on = function (name, cb) {
  var self = this;

  self.touchEvent = function (e) {
    e.stopPropagation();

    var eventObject = self.hitTest(e.touches[0].clientX, e.touches[0].clientY);
    cb && cb(eventObject);
  };

  window.canvas.addEventListener(name, self.touchEvent)
}

eventHook.prototype.off = function (name) {
  var self = this;
  self.touchEvent && window.canvas.removeEventListener(name, self.touchEvent);
};

/* 
  添加监听范围
*/
eventHook.prototype.appendHitArea = function (e) {
  var self = this;
  self.hitAreas.push(e)
}

/* 
  获取点击范围
*/
eventHook.prototype.hitTest = function (x, y) {
  var self = this;

  var scale = self.width / winSize.width
  x = x * scale
  y = y * scale
  for (var i = 0; i < self.hitAreas.length; i++) {
    var hit = self.hitAreas[i];
    if (x > hit.x && x < hit.w && y > hit.y && y < hit.h) {
      return hit;
    }
  }
}

module.exports = eventHook;