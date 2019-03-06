var TopCanvas = function() {
  this._gameCanvas = wx.createCanvas();
  // 游戏画布属性
  Object.defineProperty(this, "GameCanvas", {
    get: function() { return this._gameCanvas; }  
  });

  this.instance = null;
  this.init();
};

TopCanvas.prototype.init = function() {
  var self = this;

  // 关联主屏画布
  self.canvas = window.canvas;
  self.context = window.canvas.getContext('2d');
  self.width = window.canvas.width;
  self.height = window.canvas.height;

  self.children = new Array();
  self.children.push({
    layer: 0,                 // 画布层级，0为最低
    name: 'gameCanvas',       // 画布名称
    canvas: self._gameCanvas  // 画布对象
  });
  self.sortByLayer = function(x, y) { return x.layer - y.layer; };

  self.bindUpdate = self.update.bind(self);
  //self.update();
}

TopCanvas.prototype.update = function() {
  var self = this;

console.log('topcanvas')
  self.children.sort(self.sortByLayer);
  for (var i = 0; i < self.children.length; i++) {
    var _canvas = self.children[i].canvas;
    //self.context.globalCompositeOperation = 'lighter';
    self.context.drawImage(_canvas, 0, 0, self.width, self.height);
  }

  self.aniId = window.requestAnimationFrame(self.bindUpdate);
}

TopCanvas.prototype.append = function(name, child) {
  var self = this;
  self.children.push({
    layer: self.children.length,
    name: name,
    canvas: child
  });
}

TopCanvas.prototype.top = function(name, child) {
  var self = this;
  self.children.push({
    layer: 99999,
    name: name,
    canvas: child
  })
}

TopCanvas.prototype.pop = function(name) {
  var self = this;
  for(var i=0; i<self.children.length; i++) {
    if(self.children[i].name == name) {
      self.children.splice(i, 1);
      break;
    }
  }
}

TopCanvas.prototype.seek = function(name) {
  var self = this;
  for (var i = 0; i < self.children.length; i++) {
    if (self.children[i].name == name) {
      return i;
    }
  }

  return -1;
}

// 单例模式
TopCanvas.getInstance = function() {
  if(!this.instance) {
    this.instance = new TopCanvas();
  }

  return this.instance;
};

module.exports = TopCanvas;