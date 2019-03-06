/* 
  全局默认配置项
*/
const defaultOptions = {
  httpType: 'https',    /* http类型：http、https */
  host: 'api.jusie.net',     /* 服务器域名 */
  port: 80,       /* 服务器端口号 */
  directory: 'adv',  /* 配置文件目录 */
  configFile: 'AdWinConf.json', /* 配置文件名称 */
  appid: null,  /* 小程序appid */
  version: null,  /* version */
  preloadComplete: null,  /* 预加载回调事件 */
}

module.exports = defaultOptions;