/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details

	Note: Original module was dojo.date.locale. Now includes MSOS integreation.
*/

// Alterated to work under MobileSiteOS

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.date.locale");
msos.require("msos.date");
msos.require("msos.common");

msos.date.locale.version = new msos.set_version(13, 11, 6);


msos.date.locale.formatPattern = function (dateObject, bundle, options, pattern) {
    "use strict";

    var temp_pat = 'msos.date.locale.formatPattern -> ';

    if (msos.config.debug) {
        msos.console.debug(temp_pat + 'pattern: ', pattern);
    }

    return pattern.replace(/([a-z])\1*/ig, function (match) {
        var s, pad, c = match.charAt(0),
            l = match.length,
            m, propM, d, propD, firstDay = 0,
            timePeriod, h, offset, tz = [],
            widthList = ["abbr", "wide", "narrow"];

        switch (c) {
        case 'G':
            s = bundle[(l < 4) ? "eraAbbr" : "eraNames"][dateObject.getFullYear() < 0 ? 0 : 1];
            break;
        case 'y':
            s = dateObject.getFullYear();
            switch (l) {
            case 1:
                break;
            case 2:
                if (!options.fullYear) {
                    s = String(s);
                    s = s.substr(s.length - 2);
                    break;
                }
            default:
                pad = true;
            }
            break;
        case 'Q':
        case 'q':
            s = Math.ceil((dateObject.getMonth() + 1) / 3);
            pad = true;
            break;
        case 'M':
            m = dateObject.getMonth();
            if (l < 3) {
                s = m + 1;
                pad = true;
            }
            else {
                propM = ["months", "format", widthList[l - 3]].join("-");
                s = bundle[propM][m];
            }
            break;
        case 'w':
            firstDay = 0;
            s = msos.date.locale._getWeekOfYear(dateObject, firstDay);
            pad = true;
            break;
        case 'd':
            s = dateObject.getDate();
            pad = true;
            break;
        case 'D':
            s = msos.date.locale._getDayOfYear(dateObject);
            pad = true;
            break;
        case 'E':
            d = dateObject.getDay();
            if (l < 3) {
                s = d + 1;
                pad = true;
            }
            else {
                propD = ["days", "format", widthList[l - 3]].join("-");
                s = bundle[propD][d];
            }
            break;
        case 'a':
            timePeriod = (dateObject.getHours() < 12) ? 'am' : 'pm';
            s = options[timePeriod] || bundle['dayPeriods-format-wide-' + timePeriod];
            break;
        case 'h':
        case 'H':
        case 'K':
        case 'k':
            h = dateObject.getHours();
            // strange choices in the date format make it impossible to write this succinctly
            switch (c) {
            case 'h':
                // 1-12
                s = (h % 12) || 12;
                break;
            case 'H':
                // 0-23
                s = h;
                break;
            case 'K':
                // 0-11
                s = (h % 12);
                break;
            case 'k':
                // 1-24
                s = h || 24;
                break;
            }
            pad = true;
            break;
        case 'm':
            s = dateObject.getMinutes();
            pad = true;
            break;
        case 's':
            s = dateObject.getSeconds();
            pad = true;
            break;
        case 'S':
            s = Math.round(dateObject.getMilliseconds() * Math.pow(10, l - 3));
            pad = true;
            break;
        case 'v':
        case 'z':
            // We only have one timezone to offer; the one from the browser
            s = msos.date.locale._getZone(dateObject, true);
            if (s) {
                break;
            }
            l = 4;
        case 'Z':
            offset = msos.date.locale._getZone(dateObject, false);
            tz = [
            (offset <= 0 ? "+" : "-"), msos.common.zero_pad(Math.floor(Math.abs(offset) / 60), 2), msos.common.zero_pad(Math.abs(offset) % 60, 2)];
            if (l === 4) {
                tz.splice(0, 0, "GMT");
                tz.splice(3, 0, ":");
            }
            s = tz.join("");
            break;
        default:
            msos.console.error(temp_pat + 'invalid pattern char: ' + pattern);
        }
        if (pad) {
            s = msos.common.zero_pad(s, l);
        }
        return s;
    });
};

msos.date.locale._getZone = function (dateObject, getName) {
    "use strict";

    if (getName) {
        return msos.date.getTimezoneName(dateObject);
    }
    else {
        return dateObject.getTimezoneOffset();
    }
};

msos.date.locale.format = function (cal_type, dateObject, options) {
    "use strict";

    options = options || {};

    var temp_for = 'msos.date.locale.format -> ',
        output = '',
        formatLength = options.formatLength || 'short',
        str = [],
        pattern;

    msos.console.debug(temp_for + 'start, selector: ' + options.selector);

    if (options.selector === "year") {
        output = msos.date.locale.formatPattern(dateObject, cal_type, options, (cal_type["dateFormatItem-yyyy"] || "yyyy"));
        msos.console.debug(temp_for + 'done, output: ' + output);
        return output;
    }

    if (options.selector !== "date") {
        pattern = options.timePattern || cal_type["timeFormat-" + formatLength];
        if (pattern) {
            str.push(msos.date.locale.formatPattern(dateObject, cal_type, options, pattern));
        }
    }
    if (options.selector !== "time") {
        pattern = options.datePattern || cal_type["dateFormat-" + formatLength];
        if (pattern) {
            str.push(msos.date.locale.formatPattern(dateObject, cal_type, options, pattern));
        }
    }

    output = str.length === 1 ? str[0] : cal_type["dateTimeFormat-" + formatLength].replace(/\{(\d+)\}/g, function (match, key) {
        msos.console.debug(temp_for + 'date & time: ' + match + ', for key: ' + key);
        return str[key];
    }); // String
    msos.console.debug(temp_for + 'done, output: ' + output);
    return output;
};

msos.date.locale._parseInfo = function (cal_type, options) {
    "use strict";

    options = options || {};

    var temp_par = 'msos.date.locale._parseInfo -> ',
        output = {},
        formatLength = options.formatLength || 'short',
        datePattern = options.datePattern || cal_type["dateFormat-" + formatLength],
        timePattern = options.timePattern || cal_type["timeFormat-" + formatLength],
        pattern, tokens = [],
        re = null;

    msos.console.debug(temp_par + 'start, selector: ' + options.selector);

    if (options.selector == 'date') {
        pattern = datePattern;
    }
    else if (options.selector == 'time') {
        pattern = timePattern;
    }
    else {
        pattern = cal_type["dateTimeFormat-" + formatLength].replace(/\{(\d+)\}/g, function (match, key) {
            msos.console.debug(temp_par + 'date & time: ' + match + ', for key: ' + key);
            return [timePattern, datePattern][key];
        });
    }

    re = msos.date.locale._buildDateTimeRE(tokens, cal_type, options, pattern);
    output = {
        regexp: re,
        tokens: tokens
    };

    if (msos.config.verbose) {
        msos.console.debug(temp_par + 'done, output: ', output);
    }
    else {
        msos.console.debug(temp_par + 'done, pattern: ' + pattern);
    }
    return output;
};

msos.date.locale.parse = function (cal_type, value, options) {
    // ref. unicode.org (http://www.unicode.org/reports/tr35/tr35-4.html#Date_Format_Patterns)
    "use strict";

    // remove non-printing bidi control chars from input and pattern
    var controlChars = /[\u200E\u200F\u202A\u202E]/g,
        info = msos.date.locale._parseInfo(cal_type, options),
        tokens = info.tokens,
        re = new RegExp("^" + info.regexp.replace(controlChars, "") + "$"),
        match = re.exec(value.replace(controlChars, "")),
        temp_tx = 'msos.date.locale.parse -> ',
        widthList = ['abbr', 'wide', 'narrow'],
        result = [1970, 0, 1, 0, 0, 0, 0],
        // will get converted to a Date at the end
        amPm = "",
        test_formatting = null;

    msos.console.debug(temp_tx + 'start.');

    if (!value) {
        msos.console.error(temp_tx + 'failed: no value to check!');
        return null;
    }

    if (!match) {
        msos.console.warn(temp_tx + 'failed: no matches from regex: ' + "^" + info.regexp.replace(controlChars, "") + "$  for " + value.replace(controlChars, ""));
        return null;
    }

    test_formatting = function (v, i) {
        var org = String(v),
            token, l = 0,
            year, century, cutoff, num, months, map_months = [],
            days, map_days = [],
            am, pm, period;

        if (!i) {
            if (msos.config.verbose) {
                msos.console.debug(temp_tx + 'valid format: ' + org);
            }
            return true;
        }

        token = tokens[i - 1];
        l = token.length;

        switch (token.charAt(0)) {
        case 'y':
            if (l !== 2 && options.strict) {
                //interpret year literally, so '5' would be 5 A.D.
                result[0] = v;
            }
            else {
                if (v < 100) {
                    v = Number(v);
                    // choose century to apply, according to a sliding window
                    // of 80 years before and 20 years after present year
                    year = String(new Date().getFullYear());
                    century = year.substring(0, 2) * 100;
                    cutoff = Math.min(Number(year.substring(2, 4)) + 20, 99);
                    num = (v < cutoff) ? century + v : century - 100 + v;

                    result[0] = num;
                }
                else {
                    // we expected 2 digits and got more...
                    if (options.strict) {
                        return false;
                    }

                    // interpret literally, so '150' would be 150 A.D.
                    // also tolerate '1950', if 'yyyy' input passed to 'yy' format
                    result[0] = v;
                }
            }
            break;
        case 'M':
            if (l > 2) {
                months = cal_type['months-format-' + widthList[l - 3]].concat();
                map_months = [];
                if (!options.strict) {
                    //Tolerate abbreviating period in month part
                    //Case-insensitive comparison
                    v = v.replace(".", "").toLowerCase();
                    map_months = months.map(function (s) {
                        return s.replace(".", "").toLowerCase();
                    });
                }
                v = _.indexOf(map_months, v);
                if (v === -1) {
                    msos.console.warn(temp_tx + 'Could not parse month name: ' + org);
                    return false;
                }
            }
            else {
                v -= 1;
            }
            result[1] = v;
            break;
        case 'E':
        case 'e':
            days = cal_type['days-format-' + widthList[l - 3]].concat();
            map_days = [];
            if (!options.strict) {
                //Case-insensitive comparison
                v = v.toLowerCase();
                map_days = days.map(function (d) {
                    return d.toLowerCase();
                });
            }
            v = _.indexOf(map_days, v);
            if (v === -1) {
                msos.console.warn(temp_tx + 'Could not parse weekday name: ' + org);
                return false;
            }
            break;
        case 'D':
            result[1] = 0;
        case 'd':
            result[2] = v;
            break;
        case 'a':
            // am/pm
            am = options.am || cal_type['dayPeriods-format-wide-am'];
            pm = options.pm || cal_type['dayPeriods-format-wide-pm'];

            if (!options.strict) {
                period = /\./g;
                v = v.replace(period, '').toLowerCase();
                am = am.replace(period, '').toLowerCase();
                pm = pm.replace(period, '').toLowerCase();
            }
            if (options.strict && v != am && v != pm) {
                msos.console.warn(temp_tx + 'Could not parse am/pm part.');
                return false;
            }

            // we might not have seen the hours field yet, so store the state and apply hour change later
            amPm = (v == pm) ? 'p' : (v == am) ? 'a' : '';
            break;
        case 'K':
            //hour (1-24)
            if (v === 24) {
                v = 0;
            }
        case 'h':
            //hour (1-12)
        case 'H':
            //hour (0-23)
        case 'k':
            //hour (0-11)
            if (v > 23) {
                msos.console.warn(temp_tx + 'Illegal hours value.');
                return false;
            }

            // in the 12-hour case, adjusting for am/pm requires the 'a' part
            // which could come before or after the hour, so we will adjust later
            result[3] = v;
            break;
        case 'm':
            //minutes
            result[4] = v;
            break;
        case 's':
            //seconds
            result[5] = v;
            break;
        case 'S':
            //milliseconds
            result[6] = v;
            break;
        default:
            msos.console.error(temp_tx + 'unsupported pattern char: ' + token.charAt(0));
        }
        return true;
    };

    if (msos.config.verbose) {
        msos.console.info(temp_tx + 'validate, ref. regex: ' + "^" + info.regexp.replace(controlChars, "") + "$  for " + value.replace(controlChars, ""));
    }

    var valid = match.every(test_formatting),
        hours = +result[3],
        dateObject = null,
        allTokens, dateToken, monthToken;

    if (!valid) {
        msos.console.error(temp_tx + 'failed: ref. formatting test!');
        return null;
    }

    if (amPm === 'p' && hours < 12) {
        result[3] = hours + 12; //e.g., 3pm -> 15
    }
    else if (amPm === 'a' && hours === 12) {
        result[3] = 0; //12am -> 0
    }

    dateObject = new Date(result[0], result[1], result[2], result[3], result[4], result[5], result[6]); // Date
    if (options.strict) {
        dateObject.setFullYear(result[0]);
    }

    // Check for overflow.  The Date() constructor normalizes things like April 32nd...
    allTokens = tokens.join("");
    dateToken = allTokens.indexOf('d') !== -1;
    monthToken = allTokens.indexOf('M') !== -1;

    if ((monthToken && dateObject.getMonth() > result[1]) || (dateToken && dateObject.getDate() > result[2])) {
        msos.console.error(temp_tx + 'failed: ref. overflow condition!');
        return null;
    }

    // Check for underflow, due to DST shifts.  See #9366
    // This assumes a 1 hour dst shift correction at midnight
    // We could compare the timezone offset after the shift and add the difference instead.
    if ((monthToken && dateObject.getMonth() < result[1]) || (dateToken && dateObject.getDate() < result[2])) {
        dateObject = msos.date.add(dateObject, "hour", 1);
    }

    msos.console.debug(temp_tx + 'done, date object: ', dateObject);
    return dateObject; // Date
};

msos.date.locale._buildDateTimeRE = function (tokens, bundle, options, pattern) {
    "use strict";

    pattern = msos.common.escape_regex(pattern);
    if (!options.strict) {
        pattern = pattern.replace(" a", " ?a");
    } // no space before am/pm
    return pattern.replace(/([a-z])\1*/ig, function (match) {
        // Build a simple regexp.  Avoid captures, which would ruin the tokens list
        var s, c = match.charAt(0),
            l = match.length,
            p2 = '',
            p3 = '',
            am, pm;

        if (options.strict) {
            if (l > 1) {
                p2 = '0' + '{' + (l - 1) + '}';
            }
            if (l > 2) {
                p3 = '0' + '{' + (l - 2) + '}';
            }
        }
        else {
            p2 = '0?';
            p3 = '0{0,2}';
        }
        switch (c) {
        case 'y':
            s = '\\d{2,4}';
            break;
        case 'M':
            s = (l > 2) ? '\\S+?' : p2 + '[1-9]|1[0-2]';
            break;
        case 'D':
            s = p2 + '[1-9]|' + p3 + '[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6]';
            break;
        case 'd':
            s = '3[01]|[12]\\d|' + p2 + '[1-9]';
            break;
        case 'w':
            s = p2 + '[1-9]|[1-4][0-9]|5[0-3]';
            break;
        case 'E':
            s = '\\S+';
            break;
        case 'h':
            //hour (1-12)
            s = p2 + '[1-9]|1[0-2]';
            break;
        case 'k':
            //hour (0-11)
            s = p2 + '\\d|1[01]';
            break;
        case 'H':
            //hour (0-23)
            s = p2 + '\\d|1\\d|2[0-3]';
            break;
        case 'K':
            //hour (1-24)
            s = p2 + '[1-9]|1\\d|2[0-4]';
            break;
        case 'm':
        case 's':
            s = '[0-5]\\d';
            break;
        case 'S':
            s = '\\d{' + l + '}';
            break;
        case 'a':
            am = options.am || bundle['dayPeriods-format-wide-am'];
            pm = options.pm || bundle['dayPeriods-format-wide-pm'];
            if (options.strict) {
                s = am + '|' + pm;
            }
            else {
                s = am + '|' + pm;
                if (am != am.toLowerCase()) {
                    s += '|' + am.toLowerCase();
                }
                if (pm != pm.toLowerCase()) {
                    s += '|' + pm.toLowerCase();
                }
                if (s.indexOf('.') !== -1) {
                    s += '|' + s.replace(/\./g, "");
                }
            }
            s = s.replace(/\./g, "\\.");
            break;
        default:
            s = ".*";
        }
        if (tokens) {
            tokens.push(match);
        }
        return "(" + s + ")"; // add capture
    }).replace(/[\xa0 ]/g, "[\\s\\xa0]"); // normalize whitespace.  Need explicit handling of \xa0 for IE.
};

msos.date.locale.getNames = function (cal_type, item, type, context) {
    "use strict";

    var txt_dgn = 'msos.date.locale.getNames -> ',
		label,
		props = [item, context, type],
        key = '';

    if (msos.config.verbose) {
        msos.console.debug(txt_dgn + 'item: ' + item + ', type: ' + type + ', context: ' + context, cal_type);
    }

	if (!cal_type) {
		msos.console.error(txt_dgn + 'error, calendar type na for item: ' + item + ', type: ' + type + ', context: ' + context);
		return '';
	}

    if (context === 'standAlone') {
        key = props.join('-');
        label = cal_type[key];
        // Fall back to 'format' flavor of name
        if (!label || label[0] === 1) {
            label = undefined;
        }
    }
    props[1] = 'format';

    // return by copy so changes won't be made accidentally to the in-memory model
    return (label || cal_type[props.join('-')]).concat();
};

msos.date.locale.isWeekend = function (dateObject, locale) {
    "use strict";

    var weekend = msos.date.getWeekend(locale),
        day = (dateObject || new Date()).getDay();

    if (weekend.end < weekend.start) {
        weekend.end += 7;
        if (day < weekend.start) {
            day += 7;
        }
    }
    return day >= weekend.start && day <= weekend.end; // Boolean
};

msos.date.locale._getDayOfYear = function (dateObject) {
    "use strict";

    return msos.date.difference(new Date(dateObject.getFullYear(), 0, 1, dateObject.getHours()), dateObject) + 1; // Number
};

msos.date.locale._getWeekOfYear = function (dateObject, firstDayOfWeek) {
    "use strict";

    if (arguments.length === 1) {
        firstDayOfWeek = 0;
    } // Sunday
    var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1).getDay(),
        adj = (firstDayOfYear - firstDayOfWeek + 7) % 7,
        week = Math.floor((msos.date.locale._getDayOfYear(dateObject) + adj - 1) / 7);

    // if year starts on the specified day, start counting weeks at 1
    if (firstDayOfYear == firstDayOfWeek) {
        week += 1;
    }

    return week; // Number
};