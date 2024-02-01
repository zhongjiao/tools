/**
 * 业务代码请使用constants.BROWSER
 * （这个方法只给constants基础库使用，业务层代码禁止直接使用browser）
 *
 * @todo 添加桌面浏览器判断
 *
 * @typedef {Object} BROWSER
 * @property {Array} iPad - 是否是iPad环境，数组第二项是iPad版本
 * @property {Array} iPhone - 是否是iPhone环境，数组第二项是iPhone版本
 * @property {Array} iPod - 是否是iPod环境，数组第二项是iPod版本
 * @property {Array} Android - 是否是Android环境，数组第二项是Android版本
 * @property {Array} wp - 是否是Windows Phone环境，数组第二项是Windows Phone版本
 * @property {Array} Weixin - 是否是Weixin App内置环境，数组第二项是Weixin版本
 * @property {Array} QQ - 是否是手机QQ App内置环境，数组第二项是QQ版本
 * @property {Array} Qzone - 是否Qzone App内置环境，数组第二项是Qzone版本
 * @property {Array} QQMusic - 是否QQMusic内置环境，数组第二项是QQ音乐版本
 * @property {Array} WeiyunYyb - 是否是应用宝内微云页面
 * @property {Array} Weiyun - 是否微云App内置环境，数组第二项是微云版本。ua.match(/weiyun\/([\d.]+)/i)
 * @property {Array} MQQBrowser - 是否是移动端QQ浏览器容器下，注意不一定是移动端QQ浏览器，微信和手Q内置的都算，ua.match(/MQQBrowser\/([\d.]+)/i)
 * @property {Array} QQBrowserSide - QQ浏览器10.0版本的侧边栏窗口，数组第二项是QQ浏览器版本
 * @property {Array} QQBrowser - 是否PC端QQ浏览器，注意不一定是PC端QQ浏览器，Windows Wechat内置的浏览器也是，ua.match(/QQBrowser\/([\d.]+)/i);
 * @property {Array} QBCore - PC QQ 和 PC weixin 内置浏览器内核
 * @property {Array} isIOS - 是否是iOS系统，iPad || iPhone || iPod
 * @property {Boolean} isMobile - 是否是移动端，iPad || iPhone || iPad || wp || Android
 * @property {Boolean} isSpider - 是否主流爬虫
 */

module.exports = ua => {
  const iPad = ua.match(/iPad.*OS\s([\d_]+)/i);
  const iPhone = !iPad && ua.match(/iPhone\sOS\s([\d_]+)/i);
  const iPod = ua.match(/iPod.*OS\s([\d_]+)/i);
  const Android = ua.match(/Android\s+([\d.]+)/i) || ua.match(/Android/i);
  const wp = ua.match(/Windows Phone ([\d.]+)/i);
  const isIOS = checkIOS(iPad, iPhone, iPod);
  const isMobile = checkMobile(iPad, iPhone, iPod, Android, wp);

  // 企业微信（企业微信不算微信
  const wxWork = ua.match(/wxwork\/([\d.]+)/i);
  const Weixin = !wxWork && ua.match(/MicroMessenger\/([\d.]+)/i);
  // QQ音乐
  const QQMusic = ua.match(/QQMusic\/([\d.]+)/i);
  const TXDocs = ua.match(/TencentDocs\/([\d.]+)/i);

  const QQ = isMobile && !TXDocs && ua.match(/QQ\/([\d.]+)/i);
  const Qzone = ua.match(/Qzone\/.*_(\d+\.\d+\.\d+)_/i);
  const TIM = QQ && ua.match(/TIM\/([\d.]+)/i);
  const MiniProgram =
    ua.match(/miniprogram|miniapp(?!enable)/i) ||
    ('__wxjs_environment' in window && window.__wxjs_environment === 'miniprogram');
  // const QQMiniProgram = ('__qqjs_environment' in window && window.__qqjs_environment === 'miniprogram');

  // 应用宝内微云页面
  const WeiyunYyb = ua.match(/WeiyunYyb/i);
  const Weiyun = ua.match(/weiyun\/([\d.]+)/i);
  const MQQBrowser = ua.match(/MQQBrowser\/([\d.]+)/i);
  const QQBrowserSide = ua.match(/Mobile/i) && ua.match(/PCQQBrowser\sQQBrowser\/(\d+\.\d+\.\d+\.\d+)/i);
  // 必看
  const Bikan = ua.match(/ua-bikan-app\/([\d.]+)/i);
  const QQBrowser = ua.match(/QQBrowser\/([\d.]+)/i);
  // ipad QQ浏览器
  const PadQQBrowser = ua.match(/MQBHD\/([\d.]+)/i);
  // QBCore内核，PC QQ 和 PC weixin 内置浏览器内核
  const QBCore = !isMobile && ua.match(/QBCore\/([\d.]+)/i);

  const isSpider =
    /Baiduspider|Googlebot|Yahoo|Sosospider|iaskspider|SinaWeiboBot|(Sogou.*spider)|YodaoBot|msnbot|Bingbot|360Spider|spider/i.test(
      ua
    );

  // 这里ua是小写
  const isHarmonyOS = /harmonyos/.test(ua) || /tdocshm/.test(ua);

  const isIap = (QQ && isIOS && !TXDocs) || (TXDocs && isIOS);

  const isIapQQ = QQ && isIOS && !TXDocs;

  return {
    // mobile
    iPad,
    iPhone,
    iPod,
    Android,
    wp,

    wxWork,
    Weixin,
    QQ,
    TIM,
    Qzone,
    Weiyun,
    MQQBrowser,
    QQBrowserSide,
    Bikan,
    QQMusic,
    WeiyunYyb,
    TXDocs,
    MiniProgram,

    isIOS,
    isMobile,
    // desktop
    QQBrowser,
    QBCore,
    // ipad
    PadQQBrowser,
    // spider
    isSpider,
    // 鸿蒙
    isHarmonyOS,
    // iap支付
    isIap,
    isIapQQ,
  };
};

function checkIOS(iPad, iPhone, iPod) {
  return iPad || iPhone || iPod;
}

function checkMobile(iPad, iPhone, iPod, Android, wp) {
  return !!(iPad || iPhone || iPod || Android || wp);
}
