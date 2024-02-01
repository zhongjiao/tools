/**
 * @file 基础库：在一个页面生命周期内不改变的常量封装；抹平server端和browser端的常量取值方式差异。
 *
 * node端使用方法:
 * ```javascript
 * const constants = require('doc-vip/common/constants');
 * ```
 * browser端使用方法：
 * ```javascript
 * import constants from 'doc-vip/common/constants';
 * ```
 * @author maplemiao <maplemiao@tencent.com>
 *
 * @module wy/common/constants
 * @example
 * // https://www.weiyun.com/disk/index.html?xplatform=1&y=1&a=1&appbox
 * {
 *    "IS_NODE_ENV": true,
 *    "IS_BROWSER_ENV": false,
 *    "PROTOCOL": "http:",
 *    "HOSTNAME": "www.weiyun.com",
 *    "PORT": 80,
 *    "PATHNAME": "/disk/index.html",
 *    "SEARCH": "xplatform=1&y=1&a=1&appbox",
 *    "HASH": "",
 *    "UA": "mozilla/5.0 (windows nt 6.1; wow64) applewebkit/537.36 (khtml, like gecko)
 *     chrome/39.0.2171.95 safari/537.36 micromessenger/6.5.2.501 nettype/wifi
 *     windowswechat qbcore/3.43.373.400 qqbrowser/9.0.2524.400",
 *    "BROWSER_NAME": "chrome",
 *    "BROWSER": {
 *     "iPad": null,
 *     "iPhone": null,
 *     "iPod": null,
 *     "Android": null,
 *     "wp": null,
 *     "Weixin": [
 *        "micromessenger/6.5.2.501",
 *        "6.5.2.501"
 *     ],
 *     "QQ": null,
 *     "Qzone": null,
 *     "Weiyun": null,
 *     "MQQBrowser": null,
 *     "isIOS": null,
 *     "isMobile": false,
 *     "QQBrowser": [
 *        "qqbrowser/9.0.2524.400",
 *        "9.0.2524.400"
 *     ],
 *     "isSpider": false
 *    },
 *    "OS_NAME": "windows",
 *    "APPID": 30012,
 *    "AID": "web_vip_center",
 *    "IS_HTTPS": false,
 *    "IS_QCLOUD_TEAM": false //是否是腾讯云cos版
 * }
 */
'use strict';

const browser = require('./browser');

/**
 *
 * @property {object} constants - 该模块返回结果
 * @property {boolean} constants.IS_BROWSER_ENV - 是否浏览器环境
 * @property {boolean} constants.IS_ELECTRON - 是否electron环境
 * @property {boolean} constants.IS_DEBUG - 是否debug模式
 * @property {boolean} constants.IS_ALPHA - 是否alpha用户，用于部分用户体验新功能
 * @property {string} constants.PROTOCOL - 协议 https: | http:
 * @property {string} constants.HOSTNAME - 主机名
 * @property {string} constants.PORT - 端口
 * @property {string} constants.PATHNAME - pathname，同location.pathname
 * @property {string} constants.SEARCH - search，同location.search
 * @property {string} constants.HASH - hash，同location.hash。__注意node端的该值固定为空字符串__
 * @property {string} constants.UA - user-agent
 * @property {string} constants.BROWSER_NAME - 浏览器名称
 * @property {BROWSER} constants.BROWSER - 浏览器具体判断
 * @property {string} constants.OS_NAME - 操作系统名称
 * @property {AID} constants.AID - 支付来源参数，根据入口不同而不同，透传给计平做支付来源统计使用
 * @property {boolean} constants.IS_HTTPS - 是否HTTPS
 * @property {Number} constants.BUSS_TYPE - 业务类型
 */
const constants = {};

Object.defineProperty(constants, 'IS_NODE_ENV', {
  enumerable: true,
  get: () => typeof process === 'object' && !window.navigator,
});
Object.defineProperty(constants, 'IS_BROWSER_ENV', {
  enumerable: true,
  get: () => typeof window === 'object' && typeof window.navigator === 'object',
});
Object.defineProperty(constants, 'IS_ELECTRON', {
  enumerable: true,
  get: () => constants.UA.indexOf('electron') > -1,
});
Object.defineProperty(constants, 'IS_DEBUG', {
  enumerable: true,
  get: () => {
    if (constants.SEARCH.indexOf('__debug__') > -1) {
      return 'url';
    }
    if (window.__debug__) {
      return 'window';
    }
    if (require('./cookie').get('debug') === 'on') {
      return 'cookie';
    }

    // 系统测试环境, 分支名是release开头, 进正式环境
    if (typeof BRANCH_NAME === 'string' && (BRANCH_NAME.startsWith('release') || BRANCH_NAME.startsWith('hotfix'))) {
      return false;
    }

    const envId = require('./cookie').get('env_id');
    const envName = require('./cookie').get('env_name');

    // 系统测试环境, 分支名是release开头, 进正式环境
    if (typeof envName === 'string' && envName.startsWith('release')) {
      return false;
    }

    if (typeof envId === 'string' && (envId.startsWith('sit-') || envId === 'sit' || envId === 'uat')) {
      return 'routeproxy';
    }

    if (process.env.NODE_ENV !== 'production') {
      return 'dev';
    }

    return false;
  },
});
Object.defineProperty(constants, 'IS_ALPHA', {
  enumerable: true,
  get: () =>
    constants.SEARCH.indexOf('__alpha__') > -1 || !!window.__alpha__ || require('./cookie').get('alpha') === 'on',
});
Object.defineProperty(constants, 'UA', {
  enumerable: true,
  get: () => {
    const result = window.navigator && window.navigator.userAgent;

    return (result || '').toLowerCase();
  },
});
Object.defineProperty(constants, 'PROTOCOL', {
  enumerable: true,
  get: () => {
    if (process.env.PLATFORM === 'electron') {
      // electron时protocol为file:，这里纠正一下，便于页面http请求
      return constants.IS_DEBUG ? 'http:' : 'https:';
    }
    return window.location.protocol || '';
  },
});
Object.defineProperty(constants, 'DOMAIN', {
  enumerable: true,
  get: () =>
    constants.HOSTNAME.indexOf('weiyun.com') > -1 ? 'weiyun.com' : constants.HOSTNAME.split('.').slice(1).join('.'),
});
Object.defineProperty(constants, 'HOSTNAME', {
  enumerable: true,
  get: () => window.location.hostname || '',
});
Object.defineProperty(constants, 'PORT', {
  enumerable: true,
  get: () => window.location.port || '',
});
Object.defineProperty(constants, 'PATHNAME', {
  enumerable: true,
  get: () => window.location.pathname || '',
});
Object.defineProperty(constants, 'SEARCH', {
  enumerable: true,
  get: () => window.location.search || '',
});
Object.defineProperty(constants, 'HASH', {
  enumerable: true,
  get: () => window.location.hash || '',
});
Object.defineProperty(constants, 'URL', {
  enumerable: true,
  get: () =>
    // @attention
    // 忽略端口号，因为在node端获取的端口号是不准确的
    // 另外服务器端的Hash是空的
    `${constants.PROTOCOL}//${constants.HOSTNAME}${constants.PATHNAME}${constants.SEARCH}${constants.HASH}`,
});
Object.defineProperty(constants, 'BROWSER_NAME', {
  enumerable: true,
  get: () => {
    // 移动端app内，返回宿主环境
    if (constants.BROWSER.isMobile) {
      if (constants.BROWSER.Weixin) {
        return 'weixin';
      }
      if (constants.BROWSER.QQ) {
        return 'qq';
      }
      if (constants.BROWSER.Qzone) {
        return 'qzone';
      }
      if (constants.BROWSER.Weiyun) {
        return 'weiyun';
      }
      if (constants.BROWSER.Bikan) {
        return 'bikan';
      }
    }

    // PC端
    if (constants.UA.indexOf('ie') > -1 && /(msie ([\d.]+)|rv:([\d.]+)\) like gecko)/.test(constants.UA)) {
      return 'ie';
    }
    if (constants.UA.indexOf('chrome') > -1) {
      return 'chrome';
    }
    if (constants.UA.indexOf('firefox') > -1) {
      return 'firefox';
    }
    if (constants.UA.indexOf('safari') > -1 && constants.UA.indexOf('chrome') === -1) {
      return 'safari';
    }
    if (constants.UA.indexOf('webkit') > -1) {
      return 'webkit';
    }
    return 'unknown';
  },
});
Object.defineProperty(constants, 'BROWSER', {
  enumerable: true,
  get: () => browser(constants.UA),
});
Object.defineProperty(constants, 'OS_NAME', {
  enumerable: true,
  get: () => {
    // 排列顺序不可更改
    const OS_UA_MAP = {
      // mobile
      ipad: 'ipad',
      iphone: 'iphone',
      'windows phone': 'windows phone',
      android: 'android',
      // desktop
      windows: 'windows',
      win32: 'windows',
      macintosh: 'mac',
      'mac os x': 'mac',
      linux: 'linux',
    };

    for (const key in OS_UA_MAP) {
      if (constants.UA.indexOf(key) > -1) {
        return OS_UA_MAP[key];
      }
    }
    return 'unknown';
  },
});

Object.defineProperty(constants, 'AID', {
  enumerable: true,
  get: () => {
    const AID_PARAM_KEY = 'aid';

    const params = {};
    if (constants.SEARCH) {
      const parts = constants.SEARCH.replace(/^\?/, '').split('&');
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].split('=');
        let key;
        try {
          key = decodeURIComponent(part[0]);
          params[key] = decodeURIComponent(part.slice(1).join('='));
        } catch (e) {
          key = part[0];
          params[key] = part.slice(1).join('=');
        }
      }
    }

    if (params[AID_PARAM_KEY]) {
      // 如果直接有aid参数，则aid参数值即为所得
      return params[AID_PARAM_KEY];
    } // 如果没有aid参数，设置默认
    return constants.BROWSER.isMobile ? 'h5_default' : 'web_default';
  },
});

Object.defineProperty(constants, 'IS_HTTPS', {
  enumerable: true,
  get: () => constants.PROTOCOL === 'https:',
});

// 是否正在审核
Object.defineProperty(constants, 'IS_AS_REVIEW', {
  enumerable: true,
  get: () => {
    const isAsReview = require('./cookie').get('in_asreview');
    return isAsReview && isAsReview === '1';
  },
});

module.exports = constants;
