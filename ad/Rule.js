// 广告规则策略管理
import { FormatDate } from './Utils.js'
require('./Binding.js')

var rule = function () {
  this.init();
};

rule.prototype.init = function () {
  var self = this;

  var d = new Date();
  self['$DATE'] = FormatDate(d);
  self['$YEAR'] = d.getFullYear();  // 4位年份
  self['$MONTH'] = d.getMonth() + 1;    // 月份 1 - 12
  self['$DAY'] = d.getDate();      // 天数 1 - 31
  self['$WEEK'] = d.getDay();    // 星期x x=0-6 0表示星期天
  self['$HOUR'] = d.getHours(); // 小时 0-23
  self['$MINUTE'] = d.getMinutes(); // 分钟 0-59
  self['$SECOND'] = d.getSeconds(); // 秒 0-59
}

rule.prototype.test = function (exprList, op) {
  var self = this;

  var result = null;
  for (var i = 0; i < exprList.length; i++) {
    if (typeof exprList[i] != "string") continue;

    try {
      var expr = self.marco(exprList[i])
      if (result == null) {
        result = (window.binding.eval(expr)) === 'true' ? true : false;
        if (op == '||' && result == true) return result;
      }
      else {
        if (op == "||") {
          result = result || (window.binding.eval(expr) === 'true' ? true : false);
          if (result == true) return true;
        }
        else result = result && (window.binding.eval(expr) === 'true' ? true : false);
      }
    }
    catch (e) {
      console.log('rule failed:', e);
      result = null;
    }
  }

  return result == null ? false : result;
}

rule.prototype.marco = function (expr) {
  var self = this;
  var reg = new RegExp("\\$DATE", "g");
  reg.test(expr) && (expr = expr.replace(reg, self["$DATE"]));
  reg = new RegExp("\\$YEAR", "g");
  reg.test(expr) && (expr = expr.replace(reg, self["$YEAR"]));
  reg = new RegExp("\\$MONTH", "g");
  reg.test(expr) && (expr = expr.replace(reg, self["$MONTH"]));
  reg = new RegExp("\\$DAY", "g");
  reg.test(expr) && (expr = expr.replace(reg, self["$DAY"]));
  reg = new RegExp("\\$WEEK", "g");
  reg.test(expr) && (expr = expr.replace(reg, self["$WEEK"]));
  reg = new RegExp("\\$HOUR", "g");
  reg.test(expr) && (expr = expr.replace(reg, self["$HOUR"]));
  reg = new RegExp("\\$MINUTE", "g");
  reg.test(expr) && (expr = expr.replace(reg, self["$MINUTE"]));
  reg = new RegExp("\\$SECOND", "g");
  reg.test(expr) && (expr = expr.replace(reg, self["$SECOND"]));

  return expr;
}

module.exports = rule;