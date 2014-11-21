/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.3.0
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2013, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

/*global
    msos: false,
    jQuery: false,
    jquery: false,
    _: false
*/

msos.provide("jquery.tools.timeago");
msos.require("msos.i18n.timeago"); // This loads language specific time references.

jquery.tools.timeago.version = new msos.set_version(13, 6, 24);


// Certain languages have special rules
jquery.tools.timeago.numpf = {
    ar: function (n, str_ary) {
        "use strict";
        var plural = n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
        return str_ary[plural];
    },
    pl: function (num, str_ary) {
        "use strict";
        var n10 = num % 10;
        if ((n10 > 1) && (n10 < 5) && ((num > 20) || (num < 10))) {
            return str_ary[0];
        }
        return str_ary[1];
    },
    ru: function (num, str_ary) {
        "use strict";
        var n10 = num % 10;
        if ((n10 === 1) && ((num === 1) || (num > 20))) {
            return str_ary[0];
        }
        if ((n10 > 1) && (n10 < 5) && ((num > 20) || (num < 10))) {
            return str_ary[1];
        }
        return str_ary[2];
    },
    sl: function (num, str_ary) {
        "use strict";
        if (num === 2) {
            return str_ary[0];
        } else {
            return str_ary[1];
        }
    }
};

// 'bs', 'hr', 'uk' are the same function as 'ru'
jquery.tools.timeago.numpf.bs = jquery.tools.timeago.numpf.ru;
jquery.tools.timeago.numpf.hr = jquery.tools.timeago.numpf.ru;
jquery.tools.timeago.numpf.uk = jquery.tools.timeago.numpf.ru;


jquery.tools.timeago.start = function () {
    "use strict";

    var $t = {},
        functions;

    function distance(date) {
        return (new Date().getTime() - date.getTime());
    }

    function inWords(date) {
        return $t.inWords(distance(date));
    }

    jQuery.timeago = function (timestamp) {
        if (timestamp instanceof Date) {
            return inWords(timestamp);
        }
        if (typeof timestamp === "string") {
            return inWords(jQuery.timeago.parse(timestamp));
        }
        if (typeof timestamp === "number") {
            return inWords(new Date(timestamp));
        }
        return inWords(jQuery.timeago.datetime(timestamp));
    };

    $t = jQuery.timeago;

    function prepareData(element) {
        element = jQuery(element);
        if (!element.data("timeago")) {
            element.data("timeago", {
                datetime: $t.datetime(element)
            });
            var text = jQuery.trim(element.text());
            if ($t.settings.localeTitle) {
                element.attr("title", element.data('timeago').datetime.toLocaleString());
            } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
                element.attr("title", text);
            }
        }
        return element.data("timeago");
    }

    function refresh(that) {
        var data = prepareData(that),
            $s = $t.settings;

        if (!isNaN(data.datetime)) {
            if ($s.cutoff === 0 || distance(data.datetime) < $s.cutoff) {
                jQuery(that).text(inWords(data.datetime));
            }
        }
        return that;
    }

    jQuery.extend(jQuery.timeago, {
        settings: {
            refreshMillis: 60000,
            allowFuture: false,
            localeTitle: false,
            cutoff: 0,
            strings: {
                prefixAgo: null,
                prefixFromNow: null,
                suffixAgo: "ago",
                suffixFromNow: "from now",
                seconds: "less than a minute",
                minute: "about a minute",
                minutes: "%d minutes",
                hour: "about an hour",
                hours: "about %d hours",
                day: "a day",
                days: "%d days",
                month: "about a month",
                months: "%d months",
                year: "about a year",
                years: "%d years",
                wordSeparator: " ",
                numbers: []
            }
        },

        inWords: function (distanceMillis) {
            var $l = msos.i18n.timeago.bundle,
                prefix = $l.prefixAgo,
                suffix = $l.suffixAgo;

            if (this.settings.allowFuture) {
                if (distanceMillis < 0) {
                    prefix = $l.prefixFromNow;
                    suffix = $l.suffixFromNow;
                }
            }

            var seconds = Math.abs(distanceMillis) / 1000,
                minutes = seconds / 60,
                hours = minutes / 60,
                days = hours / 24,
                years = days / 365,
                separator = '';

            function substitute(stringOrArray, number) {
                var string = '',
                    value = ($l.numbers && $l.numbers[number]) || number;   // Don't see this used, but?

                if (_.isArray(stringOrArray)) {
                    string = jquery.tools.timeago.numpf[msos.config.locale](number, stringOrArray);
                } else {
                    string = stringOrArray;
                  }

                return string.replace(/%d/i, value);
            }

            var words = (seconds < 45  && substitute($l.seconds, Math.round(seconds)))
                     || (seconds < 90  && substitute($l.minute, 1))
                     || (minutes < 45  && substitute($l.minutes, Math.round(minutes)))
                     || (minutes < 90  && substitute($l.hour, 1))
                     || (hours   < 24  && substitute($l.hours, Math.round(hours)))
                     || (hours   < 42  && substitute($l.day, 1))
                     || (days    < 30  && substitute($l.days, Math.round(days)))
                     || (days    < 45  && substitute($l.month, 1))
                     || (days    < 365 && substitute($l.months, Math.round(days / 30)))
                     || (years   < 1.5 && substitute($l.year, 1))
                     || substitute($l.years, Math.round(years));

            separator = $l.wordSeparator || "";

            if ($l.wordSeparator === undefined) {
                separator = " ";
            }
            return jQuery.trim([prefix, words, suffix].join(separator));
        },
        parse: function (iso8601) {
            var s = jQuery.trim(iso8601);
            s = s.replace(/\.\d+/, ""); // remove milliseconds
            s = s.replace(/-/, "/").replace(/-/, "/");
            s = s.replace(/T/, " ").replace(/Z/, " UTC");
            s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2"); // -04:00 -> -0400
            return new Date(s);
        },
        datetime: function (elem) {
            var iso8601 = $t.isTime(elem) ? jQuery(elem).attr("datetime") : jQuery(elem).attr("title");
            return $t.parse(iso8601);
        },
        isTime: function (elem) {
            // jQuery's `is()` doesn't play well with HTML5 in IE
            return jQuery(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
        }
    });

    // functions that can be called via $(el).timeago('action')
    // init is default when no action is given
    // functions are called with context of a single element
    functions = {
        init: function () {
            var that = this,
                $s;

            refresh(this);
            $s = $t.settings;

            if ($s.refreshMillis > 0) {
                setInterval(function () { refresh(that); }, $s.refreshMillis);
            }
        },
        update: function (time) {
            jQuery(this).data('timeago', {
                datetime: $t.parse(time)
            });
            refresh(this);
        },
        updateFromDOM: function () {
            jQuery(this).data('timeago', {
                datetime: $t.parse($t.isTime(this) ? jQuery(this).attr("datetime") : jQuery(this).attr("title"))
            });
            refresh(this);
        }
    };

    jQuery.fn.timeago = function (action, options) {
        var fn = action ? functions[action] : functions.init;
        if (!fn) {
            throw new Error("Unknown function name '" + action + "' for timeago");
        }
        // each over objects here and call the requested function
        this.each(function () {
            fn.call(this, options);
        });
        return this;
    };
};

// Must wait until msos.i18n.timeago bundle is loaded.
msos.onload_func_start.push(jquery.tools.timeago.start);