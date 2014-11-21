/*
	Copyright (c) 2004-2012, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details

	Note: original module was dojo.date. Now is dojo.date and dojo.cldr combined,
	plus MSOS integreation
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.date");

msos.date.version = new msos.set_version(13, 11, 5);


msos.date.getDaysInMonth = function (dateObject) {
    "use strict";

    var month = dateObject.getMonth(),
        days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (month === 1 && msos.date.isLeapYear(dateObject)) {
        return 29;
    }
    return days[month];
};

msos.date.isLeapYear = function (dateObject) {
    "use strict";

    var year = dateObject.getFullYear();

    return !(year % 400) || (!(year % 4) && !! (year % 100)); // Boolean
};

msos.date.getTimezoneName = function (dateObject) {
    "use strict";

    var str = dateObject.toString(),
        tz = '',
        match, pos = str.indexOf('('),
        pat;

    if (pos > -1) {
        pos += 1;
        tz = str.substring(pos, str.indexOf(')'));
    }
    else {
        pat = /([A-Z\/]+) \d{4}$/;
        match = str.match(pat);
        if (match) {
            tz = match[1];
        }
        else {
            str = dateObject.toLocaleString();
            pat = / ([A-Z\/]+)$/;
            match = str.match(pat);
            if (match) {
                tz = match[1];
            }
        }
    }

    // Make sure it doesn't somehow end up return AM or PM
    return (tz === 'AM' || tz === 'PM') ? '' : tz; // String
};

msos.date.compare = function (date1, date2, portion) {
    "use strict";

    // Extra step required in copy for IE - see #3112
    date1 = new Date(+date1);
    date2 = new Date(+(date2 || new Date()));

    if (portion == "date") {
        date1.setHours(0, 0, 0, 0);
        date2.setHours(0, 0, 0, 0);
    }
    else if (portion == "time") {
        date1.setFullYear(0, 0, 0);
        date2.setFullYear(0, 0, 0);
    }

    if (date1 > date2) {
        return 1;
    }
    if (date1 < date2) {
        return -1;
    }
    return 0;
};

msos.date.add = function (date, interval, amount) {
    "use strict";

    var sum = new Date(+date),
        // convert to Number before copying to accomodate IE (#3112)
        fixOvershoot = false,
        property = "Date",
        days, weeks, mod, strt, adj = 0,
        trgt;

    switch (interval) {
    case "day":
        break;
    case "weekday":
        mod = amount % 5;
        if (!mod) {
            days = (amount > 0) ? 5 : -5;
            weeks = (amount > 0) ? ((amount - 5) / 5) : ((amount + 5) / 5);
        }
        else {
            days = mod;
            weeks = parseInt(amount / 5, 10);
        }

        strt = date.getDay();
        adj = 0;
        if (strt === 6 && amount > 0) {
            adj = 1;
        }
        else if (strt === 0 && amount < 0) {
            adj = -1;
        }

        trgt = strt + days;
        if (trgt === 0 || trgt === 6) {
            adj = (amount > 0) ? 2 : -2;
        }
        amount = (7 * weeks) + days + adj;
        break;
    case "year":
        property = "FullYear";
        fixOvershoot = true;
        break;
    case "week":
        amount *= 7;
        break;
    case "quarter":
        amount *= 3;

    case "month":
        fixOvershoot = true;
        property = "Month";
        break;
    default:
        property = "UTC" + interval.charAt(0).toUpperCase() + interval.substring(1) + "s";
    }

    if (property) {
        sum["set" + property](sum["get" + property]() + amount);
    }

    if (fixOvershoot && (sum.getDate() < date.getDate())) {
        sum.setDate(0);
    }

    return sum;
};

msos.date.difference = function (date1, date2, interval) {
    "use strict";

    date2 = date2 || new Date();
    interval = interval || "day";

    var yearDiff = date2.getFullYear() - date1.getFullYear(),
        delta = 1,
        m1, m2, q1, q2, days, weeks, mod, adj = 0,
        aDay, bDay, dtMark, dayMark;

    switch (interval) {
    case "quarter":
        m1 = date1.getMonth();
        m2 = date2.getMonth();
        // Figure out which quarter the months are in
        q1 = Math.floor(m1 / 3) + 1;
        q2 = Math.floor(m2 / 3) + 1;
        // Add quarters for any year difference between the dates
        q2 += (yearDiff * 4);
        delta = q2 - q1;
        break;
    case "weekday":
        days = Math.round(msos.date.difference(date1, date2, "day"));
        weeks = parseInt(msos.date.difference(date1, date2, "week"), 10);
        mod = days % 7;

        // Even number of weeks
        if (mod === 0) {
            days = weeks * 5;
        }
        else {
            // Weeks plus spare change (< 7 days)
            adj = 0;
            aDay = date1.getDay();
            bDay = date2.getDay();

            weeks = parseInt(days / 7, 10);
            mod = days % 7;
            // Mark the date advanced by the number of
            // round weeks (may be zero)
            dtMark = new Date(date1);
            dtMark.setDate(dtMark.getDate() + (weeks * 7));
            dayMark = dtMark.getDay();

            // Spare change days -- 6 or less
            if (days > 0) {
                switch (true) {
                    // Range starts on Sat
                case aDay === 6:
                    adj = -1;
                    break;
                    // Range starts on Sun
                case aDay === 0:
                    adj = 0;
                    break;
                    // Range ends on Sat
                case bDay === 6:
                    adj = -1;
                    break;
                    // Range ends on Sun
                case bDay === 0:
                    adj = -2;
                    break;
                    // Range contains weekend
                case (dayMark + mod) > 5:
                    adj = -2;
                }
            }
            else if (days < 0) {
                switch (true) {
                    // Range starts on Sat
                case aDay === 6:
                    adj = 0;
                    break;
                    // Range starts on Sun
                case aDay === 0:
                    adj = 1;
                    break;
                    // Range ends on Sat
                case bDay === 6:
                    adj = 2;
                    break;
                    // Range ends on Sun
                case bDay === 0:
                    adj = 1;
                    break;
                    // Range contains weekend
                case (dayMark + mod) < 0:
                    adj = 2;
                }
            }
            days += adj;
            days -= (weeks * 2);
        }
        delta = days;
        break;
    case "year":
        delta = yearDiff;
        break;
    case "month":
        delta = (date2.getMonth() - date1.getMonth()) + (yearDiff * 12);
        break;
    case "week":
        // Truncate instead of rounding
        // Don't use Math.floor -- value may be negative
        delta = parseInt(msos.date.difference(date1, date2, "day") / 7, 10);
        break;
    case "day":
        delta /= 24;
    case "hour":
        delta /= 60;
    case "minute":
        delta /= 60;
    case "second":
        delta /= 1000;
    case "millisecond":
        delta *= date2.getTime() - date1.getTime();
    }

    // Round for fractional values and DST leaps
    return Math.round(delta); // Number (integer)
};


// Below taken from dojo.cldr.supplemental and put here since I always use them
msos.date.getFirstDayOfWeek = function (locale) {
    "use strict";

    var firstDay = {
        mv: 5,
        ae: 6,
        af: 6,
        bh: 6,
        dj: 6,
        dz: 6,
        eg: 6,
        er: 6,
        et: 6,
        iq: 6,
        ir: 6,
        jo: 6,
        ke: 6,
        kw: 6,
        ly: 6,
        ma: 6,
        om: 6,
        qa: 6,
        sa: 6,
        sd: 6,
        so: 6,
        sy: 6,
        tn: 6,
        ye: 6,
        ar: 0,
        as: 0,
        az: 0,
        bw: 0,
        ca: 0,
        cn: 0,
        fo: 0,
        ge: 0,
        gl: 0,
        gu: 0,
        hk: 0,
        il: 0,
        jm: 0,
        jp: 0,
        kg: 0,
        kr: 0,
        la: 0,
        mh: 0,
        mn: 0,
        mo: 0,
        mp: 0,
        'in': 0,
        mt: 0,
        nz: 0,
        ph: 0,
        pk: 0,
        sg: 0,
        th: 0,
        tt: 0,
        tw: 0,
        um: 0,
        us: 0,
        uz: 0,
        vi: 0,
        zw: 0
    },
        country = msos.date._region(locale),
        dow = firstDay[country];

    return (dow === undefined) ? 1 : dow; /*Number*/
};

msos.date._region = function (locale) {
    "use strict";

    var tags = locale.split('-'),
        region = tags[1];

    if (!region) {
        region = {
            de: "de",
            en: "us",
            es: "es",
            fi: "fi",
            fr: "fr",
            he: "il",
            hu: "hu",
            it: "it",
            ja: "jp",
            ko: "kr",
            nl: "nl",
            pt: "br",
            sv: "se",
            zh: "cn"
        }[tags[0]];
    }
    else if (region.length === 4) {
        region = tags[2];
    }
    return region;
};

msos.date.getWeekend = function (locale) {
    "use strict";

    var weekendStart = {
        'in': 0,
        af: 4,
        dz: 4,
        ir: 4,
        om: 4,
        sa: 4,
        ye: 4,
        ae: 5,
        bh: 5,
        eg: 5,
        il: 5,
        iq: 5,
        jo: 5,
        kw: 5,
        ly: 5,
        ma: 5,
        qa: 5,
        sd: 5,
        sy: 5,
        tn: 5
    },
        weekendEnd = {
            af: 5,
            dz: 5,
            ir: 5,
            om: 5,
            sa: 5,
            ye: 5,
            ae: 6,
            bh: 5,
            eg: 6,
            il: 6,
            iq: 6,
            jo: 6,
            kw: 6,
            ly: 6,
            ma: 6,
            qa: 6,
            sd: 6,
            sy: 6,
            tn: 6
        },
        country = msos.date._region(locale),
        start = weekendStart[country],
        end = weekendEnd[country];

    if (start === undefined) {
        start = 6;
    }
    if (end === undefined) {
        end = 0;
    }

    return {
        start: start,
        end: end
    };
};