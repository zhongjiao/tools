/**
 * @file 数据格式化模块
 * @author iscowei
 * @date 17-05-18
 * @module wy/common/format
 */

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = `0${val}`;
  }
  return val;
}

function getWeek(date) {
  // Remove time components of date
  const targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

  // Take January 4th as it is always in week 1 (see ISO 8601)
  const firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Check if daylight-saving-time-switch occured and correct for it
  const ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
  targetThursday.setHours(targetThursday.getHours() - ds);

  // Number of weeks between target Thursday and first Thursday
  const weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
  return 1 + Math.floor(weekDiff);
}

function getDayOfWeek(date) {
  let dow = date.getDay();
  if (dow === 0) {
    dow = 7;
  }
  return dow;
}

function today() {
  const d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

const oneDayTime = 1000 * 60 * 60 * 24;

const format = {
  /**
   * @param {Date | Number} date Date对象
   * @param {String} mask 时间戳格式：yyyy-mm-dd HH:MM:ss
   * @param {Boolean} utc 世界时间
   * @param {Boolean} gmt 格林威治时间
   * @returns {string} result
   *
   * @example
   * import format from 'doc-vip/common/format'
   *
   * // 格式化日期
   * format.date()
   * format.date(new Date(), 'yyyy-mm-dd HH:MM')
   */
  date(date, mask, utc, gmt) {
    const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
    const timezone =
      /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
    const timezoneClip = /[^-+\dA-Z]/g;

    const masks = {
      default: 'yyyy-mm-dd HH:MM:ss',
      isoDateMinute: 'yyyy-mm-dd HH:MM',
      shortDate: 'm/d/yy',
      mediumDate: 'mmm d, yyyy',
      longDate: 'mmmm d, yyyy',
      fullDate: 'dddd, mmmm d, yyyy',
      shortTime: 'h:MM TT',
      mediumTime: 'h:MM:ss TT',
      longTime: 'h:MM:ss TT Z',
      isoDate: 'yyyy-mm-dd',
      isoTime: 'HH:MM:ss',
      isoDateTime: 'yyyy-mm-dd\'T\'HH:MM:sso',
      isoUtcDateTime: 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
      expiresHeaderFormat: 'ddd, dd mmm yyyy HH:MM:ss Z',
    };

    // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
    if (arguments.length === 1 && typeof date === 'string' && !/\d/.test(date)) {
      mask = date;
      date = undefined;
    }

    date = date || new Date();

    if (!(date instanceof Date)) {
      // modified by maplemiao, make it compatible for 10 digits unix timestamp
      if (typeof date === 'number' && date.toString().length === 10) {
        date = date * 1000;
      }
      // modified done
      date = new Date(date);
    }

    if (isNaN(date)) {
      throw TypeError('Invalid date');
    }

    mask = String(masks[mask] || mask || masks.default);

    // Allow setting the utc/gmt argument via the mask
    const maskSlice = mask.slice(0, 4);
    if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
      mask = mask.slice(4);
      utc = true;
      if (maskSlice === 'GMT:') {
        gmt = true;
      }
    }
    const flags = this.getFlags(date, utc, gmt, timezone, timezoneClip);

    return mask.replace(token, match => {
      if (match in flags) {
        return flags[match];
      }
      return match.slice(1, match.length - 1);
    });
  },

  getFlags(date, utc, gmt, timezone, timezoneClip) {
    // Internationalization strings
    const i18n = {
      dayNames: [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      monthNames: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    };
    const _ = utc ? 'getUTC' : 'get';
    const d = date[`${_}Date`]();
    const D = date[`${_}Day`]();
    const m = date[`${_}Month`]();
    const y = date[`${_}FullYear`]();
    const H = date[`${_}Hours`]();
    const M = date[`${_}Minutes`]();
    const s = date[`${_}Seconds`]();
    const L = date[`${_}Milliseconds`]();
    const o = utc ? 0 : date.getTimezoneOffset();
    const W = getWeek(date);
    const N = getDayOfWeek(date);
    const flags = {
      d,
      dd: pad(d),
      ddd: i18n.dayNames[D],
      dddd: i18n.dayNames[D + 7],
      m: m + 1,
      mm: pad(m + 1),
      mmm: i18n.monthNames[m],
      mmmm: i18n.monthNames[m + 12],
      yy: String(y).slice(2),
      yyyy: y,
      h: H % 12 || 12,
      hh: pad(H % 12 || 12),
      H,
      HH: pad(H),
      M,
      MM: pad(M),
      s,
      ss: pad(s),
      l: pad(L, 3),
      L: pad(Math.round(L / 10)),
      t: H < 12 ? 'a' : 'p',
      tt: H < 12 ? 'am' : 'pm',
      T: H < 12 ? 'A' : 'P',
      TT: H < 12 ? 'AM' : 'PM',
      // eslint-disable-next-line no-nested-ternary
      Z: gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
      o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + (Math.abs(o) % 60), 4),
      S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (((d % 100) - (d % 10) != 10) * d) % 10],
      W,
      N,
    };
    return flags;
  },

  /**
   * 美化日期输出
   * @param {Date|Number} date 日期对象或时间戳
   * @param {Boolean} hasTime 是否显示时间
   * @returns {String} result
   *
   * @example
   * import format from 'doc-vip/common/format'
   *
   * // 美化日期输出
   * format.prettyDate()  //output: 今天
   * format.prettyDate(new Date(), true) //output: 今天 20:30
   */
  prettyDate(date, hasTime = false) {
    const todayTime = today().getTime();
    date = date || new Date();

    if (!(date instanceof Date)) {
      // modified by maplemiao, make it compatible for 10 digits unix timestamp
      if (typeof date === 'number' && date.toString().length == 10) {
        date = date * 1000;
      }
      // modified done
      date = new Date(date);
    }

    if (isNaN(date)) {
      throw TypeError('Invalid date');
    }

    const nowYear = new Date().getFullYear();
    const y = date.getFullYear();

    if (y != nowYear) {
      // 非今年的
      let d = format.date(date, 'yyyy-mm-dd');
      d = d.split('-');
      return `${d[0]}年${d[1]}月${d[2]}日`;
    }

    const time = hasTime ? format.date(date, 'HH:MM') : '';
    const dateTime = date.getTime();

    if (dateTime >= todayTime && dateTime < todayTime + oneDayTime) {
      // 今天的
      return hasTime ? `今天 ${time}` : '今天';
    }
    if (dateTime < todayTime && dateTime >= todayTime - oneDayTime) {
      // 昨天的
      return hasTime ? `昨天 ${time}` : '昨天';
    } // 今年的
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());

    return hasTime ? `${m}月${d}日 ${time}` : `${m}月${d}日`;
  },

  /**
   * 格式化时长，转为以HH:MM:SS格式显示
   * @param {Number} seconds - 总秒数
   * @param {String} str 格式
   * @returns {String} - result
   */
  longTime(seconds, str) {
    const hour = Math.floor(seconds / 3600);
    const minute = Math.floor((seconds - hour * 3600) / 60);
    const second = Math.floor(seconds - minute * 60 - hour * 3600);
    if (str) {
      return str.replace('hh', pad(hour)).replace('mm', pad(minute)).replace('ss', pad(second));
    }
    if (hour) {
      return `${pad(hour)}:${pad(minute)}:${pad(second)}`;
    }
    return `${pad(minute)}:${pad(second)}`;
  },
  /**
   * 格式化文件大小，如果小于0 返回 '-'
   * @param {Number} bytes 文件大小
   * @param {Number} decimalDigits 保留小数位数
   * @param {Boolean} [withB=true] KB而非K
   * @returns {string} - result
   *
   * @example
   * // 格式化文件大小
   * format.size(12345, 2);
   */
  size(bytes, decimalDigits, withB = true) {
    const BYTE_UNITS = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'D', 'N', '...']; // 字节单位
    const BYTE_UNITS_B = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'DB', 'NB', '...']; // 字节单位
    let unit;

    if (bytes < 0 || typeof bytes !== 'number') {
      return '-';
    }

    bytes = parseInt(bytes);
    decimalDigits = parseInt(decimalDigits);
    decimalDigits = decimalDigits >= 0 ? decimalDigits : 2;

    if (!bytes) return '0 B';

    unit = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (unit > 4) {
      unit = 4; // 只显示到T的级别
    }
    const size = bytes / Math.pow(1024, unit);
    const decimalMag = Math.pow(10, decimalDigits); // 2位小数 -> 100，3位小数 -> 1000
    const decimalSize = Math.round(size * decimalMag) / decimalMag; // 12.345 -> 12.35

    return `${decimalSize} ${withB ? BYTE_UNITS_B[unit] : BYTE_UNITS[unit]}`;
  },
  /**
   * 将对象转为url参数，替代JQuery的$.param
   * @param {Object} obj 需要转换的对象
   * @param {String} separator 分割符
   * @param {Boolean} encode 是否需要encodeURIComponent
   * @returns {string} result
   *
   * @example
   * // 转换url参数
   * var obj={name:'tom','class': 12};
   * format.param(obj)
   * output: name=tom&class=12
   */
  param: function param(obj, separator = '&', encode = false) {
    if (obj == null) return '';
    const params = [];

    for (const o in obj) {
      params.push(`${o}=${encode ? encodeURIComponent(obj[o]) : obj[o]}`);
    }
    return params.join(separator);
  },
  /**
   * 提取页面url参数
   * @param {String} key 键值
   * @param {Boolean} decode 是否需要decodeURIComponent
   * @returns {any} - result
   *
   * @example
   * url: https://xxx.xxx.com/?page=1
   * format.query('page')
   * output: 1
   */
  query: function query(key, decode = false) {
    const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i'); // 匹配目标参数
    const result = window.location.search.substr(1).match(reg); // 对querystring匹配目标参数
    if (result) {
      if (decode) {
        return decodeURIComponent(result[2]);
      }
      return result[2];
    }
    return null;
  },

  /**
   * 格式化money
   * @param {Number} number 数额
   * @param {Number} places 小数点
   * @param {String} symbol 货币符号
   * @param {String} thousand 千分位间隔符
   * @param {decimal} decimal 小数点符
   * @return {String} 格式化后的money
   */
  money(number, places, symbol, thousand, decimal) {
    number = number || 0;
    places = !isNaN((places = Math.abs(places))) ? places : 2;
    symbol = symbol !== undefined ? symbol : '';
    thousand = thousand || ',';
    decimal = decimal || '.';

    const negative = number < 0 ? '-' : '';
    const i = `${parseInt((number = Math.abs(+number || 0).toFixed(places)), 10)}`;
    let j;
    j = (j = i.length) > 3 ? j % 3 : 0;

    return (
      symbol +
      negative +
      (j ? i.substr(0, j) + thousand : '') +
      i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thousand}`) +
      (places
        ? decimal +
          Math.abs(number - i)
            .toFixed(places)
            .slice(2)
        : '')
    );
  }
};

module.exports = format;
