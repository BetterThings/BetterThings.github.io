// Copyright Notice:
//					intl.js
//			Copyright©2012-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile culture specific functions

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.intl");
msos.require("msos.i18n.culture");
msos.require("msos.common");

msos.intl.version = new msos.set_version(13, 11, 5);


msos.intl.culture = {};

msos.intl.culture_select_elm  = null;
msos.intl.calendar_select_elm = null;
msos.intl.keyboard_select_elm = null;


// Hash of culture parameters, used as the base to which each culture file will "extend" parameters particular
// to that culture. Important: Do not modify these. Just add overriding parameters in 'msos/intl/xx_xx.js' files
msos.intl.base = {
	// A unique name for the culture in the form <language code>-<country/region code>
	name: "base",
	// the name of the culture in the english language
	englishName: "English (default)",
	// the name of the culture in its own language
	nativeName: "English (default)",
	// whether the culture uses right-to-left text
	isRTL: false,
	// "language" is used for so-called "specific" cultures.
	// For example, the culture "es-CL" means "Spanish, in Chili".
	language: "en",
	// numberFormat defines general number formatting rules, like the digits in
	// each grouping, the group separator, and how negative numbers are displayed.
	numberFormat: {
		// [negativePattern]
		// Note, numberFormat.pattern has no "positivePattern" unlike percent and currency,
		// but is still defined as an array for consistency with them.
		//   negativePattern: one of "(n)|-n|- n|n-|n -"
		pattern: ["-n"],
		// number of decimal places normally shown
		decimals: 2,
		// string that separates number groups, as in 1,000,000
		",": ",",
		// string that separates a number from the fractional portion, as in 1.99
		".": ".",
		// array of numbers indicating the size of each number group.
		// TODO: more detailed description and example
		groupSizes: [3],
		// symbol used for positive numbers
		"+": "+",
		// symbol used for negative numbers
		"-": "-",
		// symbol used for NaN (Not-A-Number)
		'NaN': "NaN",
		// symbol used for Negative Infinity
		negativeInfinity: "-Infinity",
		// symbol used for Positive Infinity
		positiveInfinity: "Infinity",
		percent: {
			// [negativePattern, positivePattern]
			//   negativePattern: one of "-n %|-n%|-%n|%-n|%n-|n-%|n%-|-% n|n %-|% n-|% -n|n- %"
			//   positivePattern: one of "n %|n%|%n|% n"
			pattern: ["-n %", "n %"],
			// number of decimal places normally shown
			decimals: 2,
			// array of numbers indicating the size of each number group.
			// TODO: more detailed description and example
			groupSizes: [3],
			// string that separates number groups, as in 1,000,000
			",": ",",
			// string that separates a number from the fractional portion, as in 1.99
			".": ".",
			// symbol used to represent a percentage
			symbol: "%"
		},
		currency: {
			// [negativePattern, positivePattern]
			//   negativePattern: one of "($n)|-$n|$-n|$n-|(n$)|-n$|n-$|n$-|-n $|-$ n|n $-|$ n-|$ -n|n- $|($ n)|(n $)"
			//   positivePattern: one of "$n|n$|$ n|n $"
			pattern: ["($n)", "$n"],
			// number of decimal places normally shown
			decimals: 2,
			// array of numbers indicating the size of each number group.
			// TODO: more detailed description and example
			groupSizes: [3],
			// string that separates number groups, as in 1,000,000
			",": ",",
			// string that separates a number from the fractional portion, as in 1.99
			".": ".",
			// symbol used to represent currency
			symbol: "$"
		}
	},
	calendars: {
		standard: {
			// name that identifies the type of calendar this is
			name: "Gregorian_USEnglish",
			// separator of parts of a date (e.g. "/" in 11/05/1955)
			"/": "/",
			// separator of parts of a time (e.g. ":" in 05:44 PM)
			":": ":",
			// the first day of the week (0 = Sunday, 1 = Monday, etc)
			firstDay: 0,
			days: {
				// full day names
				names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
				// abbreviated day names
				namesAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
				// shortest day names
				namesShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
			},
			months: {
				// full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
				names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
				// abbreviated month names
				namesAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""]
			},
			// AM and PM designators in one of these forms:
			// The usual view, and the upper and lower case versions
			//   [ standard, lowercase, uppercase ]
			// The culture does not use AM or PM (likely all standard date formats use 24 hour time)
			//   null
			AM: ["AM", "am", "AM"],
			PM: ["PM", "pm", "PM"],
			eras: [
				// eras in reverse chronological order.
				// name: the name of the era in this culture (e.g. A.D., C.E.)
				// start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
				// offset: offset in years from gregorian calendar
				{
					"name": "A.D.",
					"start": null,
					"offset": 0
				}
			],
			// when a two digit year is given, it will never be parsed as a four digit
			// year greater than this year (in the appropriate era for the culture)
			// Set it as a full year (e.g. 2029) or use an offset format starting from
			// the current year: "+19" would correspond to 2029 if the current year 2010.
			twoDigitYearMax: 2029,
			// set of predefined date and time patterns used by the culture
			// these represent the format someone in this culture would expect
			// to see given the portions of the date that are shown.
			patterns: {
				// short date pattern
				d: "M/d/yyyy",
				// long date pattern
				D: "dddd, MMMM dd, yyyy",
				// short time pattern
				t: "h:mm tt",
				// long time pattern
				T: "h:mm:ss tt",
				// long date, short time pattern
				f: "dddd, MMMM dd, yyyy h:mm tt",
				// long date, long time pattern
				F: "dddd, MMMM dd, yyyy h:mm:ss tt",
				// month/day pattern
				M: "MMMM dd",
				// month/year pattern
				Y: "yyyy MMMM",
				// S is a sortable format that does not vary by culture
				S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss"
			}
		}
	}
};

msos.intl.start = function () {
    "use strict";

    var str_txt = 'msos.intl.start -> ',
		cfg = msos.config,
		i18n_bdle = msos.i18n.culture.bundle,
        culture_select = cfg.intl.select_culture,
		culture_module = '',
		next = '',
        build_order = [],
		j = 0;

    msos.console.debug(str_txt + 'start.');

    // If locale base changed, then set new target for culture too
    if (cfg.culture.substr(0, 2) !== cfg.locale.substr(0, 2)) {
		msos.console.info(str_txt + 'locale change, culture: ' + cfg.culture + ', new target: ' + cfg.locale);
		cfg.culture = cfg.locale;
    }

	if (!i18n_bdle[cfg.culture]) {
		msos.console.error(str_txt + 'na culture: ' + cfg.culture);
		return;
	}

    for (next in i18n_bdle) {
        // Add this culture option to selection hash (subset of base language)
        culture_select[next] = i18n_bdle[next].native_name;
		// Get array of keys (to later get best match order)
		build_order.push(next);
    }

    function by_match_idx(a, b) {
        var x = cfg.culture.substr(0, j) === a.substr(0, j) ? 1 : 0,
            y = cfg.culture.substr(0, j) === b.substr(0, j) ? 1 : 0;

        return y - x;
    }

    // So we always have something
    build_order.push(cfg.locale);

    // Only unique items in array (true means don't bother to sort)
    build_order = _.uniq(build_order, true);

    // Sort build_order array by number of char's matched
    for (j = 0; j <= cfg.culture.length; j += 1) {
        build_order.sort(by_match_idx);
    }

    msos.console.debug(str_txt + 'culture codes, by best match: ', build_order);

    // Update msos.config.culture to best available
    cfg.culture = build_order[0];

	culture_module = cfg.culture.replace(/_/g, '.');

	// Now we know which culture, so ajax it in via 'require', then update
	msos.require(
		"msos.intl." + culture_module,
		function () {
			var l = 0,
				kb_obj;

			msos.intl.create();
			msos.intl.set_calendar();

			msos.intl.culture_select_func();
			msos.intl.calendar_select_func();
			msos.intl.keyboard_select_func();

			if (msos.keyboard
			 && msos.keyboard.get_tool) {
				kb_obj = msos.keyboard.get_tool();
				kb_obj.set_keyboard_layouts();
				kb_obj.character_load();
			}

			jQuery(msos.intl).trigger('intl.update');
		}
	);

    if (cfg.verbose) {
        msos.console.debug(str_txt + 'done, culture select: ', culture_select);
    } else {
        msos.console.debug(str_txt + 'done!');
    }
};

msos.intl.create = function () {
	"use strict";

	var temp_cr = 'msos.intl.create -> ',
		others = '',
		name_array = msos.config.culture.split('_'),
		intl_obj = msos.intl,	// initialize as base intl object
		i,
		non_std_cal = {};

	// Clear previous
	msos.intl.culture = {};

	msos.console.debug(temp_cr + 'start for: ', name_array);

    // Then build our just loaded intl object ref. (from name array)
    for (i = 0; i < name_array.length; i += 1) {
		intl_obj = intl_obj[name_array[i]];
    }

	// Now build our user's culture object
	jQuery.extend(
		true,
		msos.intl.culture,
		msos.intl.base,		// from the base above
		intl_obj			// then by extending the loaded msos.intl.xx.xx.xx culture file
	);

	// Now we extend any culture's calendars beyond the standard. Note: this is my best guess as to
	// what was supposed to be implemented, as this was not the case with globalize.js and their demo.
	for (others in msos.intl.culture.calendars) {
		if (others !== 'standard') {
			non_std_cal = {};
			// Fill missing params with those of the standard
			jQuery.extend(
				true,
				non_std_cal,
				msos.intl.culture.calendars.standard,
				msos.intl.culture.calendars[others]
			);
			msos.intl.culture.calendars[others] = non_std_cal;
		}
	}

	if (msos.config.verbose) {
		msos.console.debug(temp_cr + 'done, msos.intl.culture: ', msos.intl.culture);
	} else {
		msos.console.debug(temp_cr + 'done!');
	  }
};

msos.intl.set_calendar = function () {
    "use strict";

    var cal_txt = 'msos.intl.set_calendar -> ',
		culture_object = msos.intl.culture,
		calendar_select = {},
        calendar_key = '',
		calendar_value = '';

    msos.console.debug(cal_txt + 'start.');

	// Clear previous
	culture_object.calendar = null;

	if (!culture_object) {
		msos.console.error(cal_txt + 'msos.intl.culture undefined.');
	}

	// Define particular calendar to use, given available and user input
	for (calendar_key in culture_object.calendars) {

		// Get the name for each calendar
		calendar_value = culture_object.calendars[calendar_key].name;

		if (!calendar_value) {
			msos.console.error(cal_txt + 'missing name for key: ' + calendar_key);
		} else {

			// Build our selection options object
			if (calendar_value.match(/^Gregorian_/)) {

				// Create Gregorian object the first time (for an option group)
				if (!calendar_select.Gregorian) { calendar_select.Gregorian = {}; }

				calendar_select.Gregorian[calendar_key] = calendar_value.replace(/^Gregorian_/, '').replace(/_/g, ' ');
			} else {
				calendar_select[calendar_key] = calendar_value.replace(/_/g, ' ');
			}

			// Set calendar object to use
			if (msos.config.calendar === calendar_key) {
				// If a newly selected culture has an originally selected preference, use it
				culture_object.calendar = culture_object.calendars[calendar_key];
			}
		}
	}

	// User pref calendar not available, use 'standard' calendar for this culture
	if (!culture_object.calendar) {
		// Set to default for this culture
		culture_object.calendar = culture_object.calendars.standard;
		msos.config.calendar = 'standard';
	}

	// Set the cookie to our current i18n, culture settings
	msos.set_locale_cookie();

	msos.config.intl.select_calendar = calendar_select;

    if (msos.config.verbose) {
        msos.console.debug(cal_txt + 'done, calendar select:', calendar_select);
    } else {
        msos.console.debug(cal_txt + 'done!');
    }
};

msos.intl.on_culture_change = function () {
	"use strict";

	var temp_cc = 'msos.intl.on_culture_change -> ',
		i18n_bdle = msos.i18n.culture.bundle,
		culture_val = jQuery.trim(msos.intl.culture_select_elm.val()) || '';

	msos.console.debug(temp_cc + 'start, culture: ' + msos.config.culture);

	// Is selected culture different
	if (culture_val !== msos.config.culture
	 && i18n_bdle[culture_val]) {

		// Checked ok, so set it
		msos.config.culture = culture_val;

		msos.intl.start();

		msos.console.debug(temp_cc + 'updated: ' + msos.config.culture);
	}

	msos.console.debug(temp_cc + 'done!');
};

msos.intl.culture_select_func = function () {
	"use strict";

	var cfg = msos.config,
		com = msos.common;

	if (com.in_dom_jq_node(msos.intl.culture_select_elm)) {
		com.gen_select_menu(
			msos.intl.culture_select_elm,
			cfg.intl.select_culture,
			cfg.culture
		);
	}
};

msos.intl.on_calendar_change = function () {
	"use strict";

	var temp_clc = 'msos.intl.on_calendar_change -> ',
		culture_obj = msos.intl.culture,
		calendar_val = jQuery.trim(msos.intl.calendar_select_elm.val()) || '';

	msos.console.debug(temp_clc + 'start, calendar: ' + msos.config.calendar);

	if (calendar_val !== msos.config.calendar
	 && culture_obj.calendars[calendar_val]) {

		msos.config.calendar = calendar_val;

		// Just reset the calendar
		msos.intl.set_calendar();

		msos.console.debug(temp_clc + 'updated: ' + msos.config.calendar);
	}

	msos.console.debug(temp_clc + 'done!');
};

msos.intl.calendar_select_func = function (force) {
	"use strict";

	var cfg = msos.config,
		com = msos.common;

	if (com.in_dom_jq_node(msos.intl.calendar_select_elm)) {
		com.gen_select_menu(
			msos.intl.calendar_select_elm,
			cfg.intl.select_calendar,
			cfg.calendar
		);
	}
};

msos.intl.on_keyboard_change = function () {
	"use strict";

	var temp_kc = 'msos.intl.on_keyboard_change -> ',
		cfg = msos.config,
		keyboard_val = jQuery.trim(msos.intl.keyboard_select_elm.val()) || '',
		kb_obj;

	msos.console.debug(temp_kc + 'start, keyboard: ' + cfg.keyboard);

	if (keyboard_val !== cfg.keyboard
	 && cfg.i18n.select_kbrds_msos[keyboard_val]) {

		cfg.keyboard = keyboard_val;
		cfg.keyboard_locales.push(keyboard_val);

		// If the tool is present, update it too...
		if (msos.keyboard && msos.keyboard.get_tool) {
			kb_obj = msos.keyboard.get_tool();
			kb_obj.set_keyboard_layouts();
			kb_obj.character_load();
		}

		msos.console.debug(temp_kc + 'updated: ' + cfg.keyboard);
	}

	msos.console.debug(temp_kc + 'done!');
};

msos.intl.keyboard_select_func = function () {
	"use strict";

	var cfg = msos.config,
		com = msos.common;

	if (com.in_dom_jq_node(msos.intl.keyboard_select_elm)) {
		com.gen_select_menu(
			msos.intl.keyboard_select_elm,
			cfg.i18n.select_kbrds_msos,
			cfg.keyboard
		);
	}
};

msos.intl.set_selects = function (culture_elm, calendar_elm, kb_layout_elm) {
	"use strict";

	var temp_ss = 'msos.intl.set_selects',
		m_cfg = msos.config,
		debounce_culture_select =  _.debounce(msos.intl.on_culture_change,  100),
		debounce_calendar_select = _.debounce(msos.intl.on_calendar_change, 100),
		debounce_keyboard_select = _.debounce(msos.intl.on_keyboard_change, 100);

	msos.console.debug(temp_ss + " -> start.");

	jQuery(msos.intl).off('intl.update');

	if (culture_elm
	 && culture_elm.length
	 && msos.common.valid_jq_node(culture_elm, 'select')) {

		// Bind our onchange event
		culture_elm.change(debounce_culture_select);

		// Retain the dom node
		msos.intl.culture_select_elm = culture_elm;

		// Run update to fill initially
		msos.onload_func_done.push(msos.intl.culture_select_func);

		if (m_cfg.verbose) {
			msos.console.debug(temp_ss + " -> added culture: #" + culture_elm[0].id);
		}
	}

	if (calendar_elm
	 && calendar_elm.length
	 && msos.common.valid_jq_node(calendar_elm, 'select')) {

		// Bind our onchange event
        calendar_elm.change(debounce_calendar_select);

		// Retain the dom node
		msos.intl.calendar_select_elm = calendar_elm;

		// Run update to fill initially
		msos.onload_func_done.push(msos.intl.calendar_select_func);

		if (m_cfg.verbose) {
			msos.console.debug(temp_ss + " -> added calendar: #" + calendar_elm[0].id);
		}
	}

	if (kb_layout_elm
	 && kb_layout_elm.length
	 && msos.common.valid_jq_node(kb_layout_elm, 'select')) {

		// Bind our onchange event
		kb_layout_elm.change(debounce_keyboard_select);

		// Retain the dom node
		msos.intl.keyboard_select_elm = kb_layout_elm;

		// Run update to fill initially
		msos.onload_func_done.push(msos.intl.keyboard_select_func);

		if (m_cfg.verbose) {
			msos.console.debug(temp_ss + " -> added keyboard: #" + kb_layout_elm[0].id);
		}
	}

	msos.console.debug(temp_ss + " -> done!");
};


/*
 * Globalize
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Below is derived from jQuery Globalize
 */

// --------------------------
// Helper functions
// --------------------------

msos.intl.endsWith = function (value, pattern) {
    "use strict";
    return value.substr(value.length - pattern.length) === pattern;
};

msos.intl.startsWith = function (value, pattern) {
    "use strict";
    return value.indexOf(pattern) === 0;
};

msos.intl.truncate = function (value) {
    "use strict";

    var ciel_floor = value < 0 ? "ceil" : "floor";

    if (isNaN(value)) { return NaN; }

    return Math[ciel_floor](value);
};

msos.intl.getEra = function (date, eras) {
	"use strict";

	if (!eras) { return 0; }

	var start,
		ticks = date.getTime(),
		i = 0;

	for (i = 0; i < eras.length; i += 1) {
		start = eras[i].start;
		if (start === null || ticks >= start) { return i; }
	}
	return 0;
};

msos.intl.getEraYear = function (date, cal, era, sortable) {
	"use strict";

	var year = date.getFullYear();

	if (!sortable && cal.eras) {
		// convert normal gregorian year to era-shifted gregorian
		// year by subtracting the era offset
		year -= cal.eras[era].offset;
	}
	return year;
};

msos.intl.appendPreOrPostMatch = function (preMatch, strings) {
	"use strict";

	// appends pre- and post- token match strings while removing escaped characters.
	// Returns a single quote count which is used to determine if the token occurs
	// in a string literal.
	var quoteCount = 0,
		escaped = false,
		i = 0,
		c;

	for (i = 0; i < preMatch.length; i += 1) {
		c = preMatch.charAt(i);
		switch (c) {
			case "\'":
				if (escaped) {
					strings.push("\'");
				} else {
					quoteCount += 1;
				  }
				escaped = false;
			break;
			case "\\":
				if (escaped) {
					strings.push("\\");
				}
				escaped = !escaped;
			break;
			default:
				strings.push(c);
				escaped = false;
			break;
		}
	}
	return quoteCount;
};

msos.intl.expandFormat = function (cal, pattern_or_abrev) {
	"use strict";

	var pattern = '';

	if (cal.patterns[pattern_or_abrev]) {
		pattern = cal.patterns[pattern_or_abrev];
	} else if (pattern_or_abrev) {
		pattern = pattern_or_abrev;
	} else {
		pattern = cal.patterns.F;
		msos.console.warn('msos.intl.expandFormat -> used default pattern!');
	  }

	return pattern;
};

msos.intl.expandNumber = function (number, precision, formatInfo) {
	"use strict";

	var groupSizes = formatInfo.groupSizes,
		curSize = groupSizes[0],
		curGroupIndex = 1,
		factor = Math.pow(10, precision),
		rounded = Math.round(number * factor) / factor,
		numberString,
		right = '',
		split,
		exponent,
		stringIndex,
		sep = formatInfo[","],
		ret = '';

	if (!isFinite(rounded)) {
		rounded = number;
	}

	number = rounded;

	numberString = String(number);
	split = numberString.split(/e/i);
	exponent = split.length > 1 ? parseInt(split[1], 10) : 0;

	numberString = split[0];
	split = numberString.split(".");
	numberString = split[0];
	right = split.length > 1 ? split[1] : "";

	if			(exponent > 0) {
		right = msos.common.zero_pad(right, exponent, false);
		numberString += right.slice(0, exponent);
		right = right.substr(exponent);
	} else if	(exponent < 0) {
		exponent = -exponent;
		numberString = msos.common.zero_pad(numberString, exponent + 1);
		right = numberString.slice(-exponent, numberString.length) + right;
		numberString = numberString.slice(0, -exponent);
	}

	if (precision > 0) {
		right = formatInfo["."] +
			((right.length > precision) ? right.slice(0, precision) : msos.common.zero_pad(right, precision));
	} else {
		right = '';
	  }

	stringIndex = numberString.length - 1;

	while (stringIndex >= 0) {
		if (curSize === 0 || curSize > stringIndex) {
			return numberString.slice(0, stringIndex + 1) + (ret.length ? (sep + ret + right) : right);
		}
		ret = numberString.slice(stringIndex - curSize + 1, stringIndex + 1) + (ret.length ? (sep + ret) : "");

		stringIndex -= curSize;

		if (curGroupIndex < groupSizes.length) {
			curSize = groupSizes[curGroupIndex];
			curGroupIndex += 1;
		}
	}

	return numberString.slice(0, stringIndex + 1) + sep + ret + right;
};

msos.intl.formatDate = function (value, format) {
	"use strict";

	var temp_fd = 'msos.intl.formatDate -> ',
		culture = msos.intl.culture,
		cal = culture.calendar,
		convert = cal.convert,
		retstr = '',
		retarr = [],
		current,
		clength,
		names,
		part,
		eraDate,
		era,
		eras,
		sortable,
		hour,
		quoteCount = 0,
		tokenRegExp = /\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g,
		converted,
		padZeros = function (num, c) {
			var r,
				zeros = ["0", "00", "000"],
				s = String(num);

			if (c > 1 && s.length < c) {
				r = (zeros[c - 2] + s);
				return r.substr(r.length - c, c);
			}

			r = s;
			return r;
		},
		getPart = function (date, part) {
			if (converted) {
				return converted[part];
			}
			switch (part) {
				case 0: return date.getFullYear();
				case 1: return date.getMonth();
				case 2: return date.getDate();
				default: msos.console.error(temp_fd + 'invalid part value: ' + part);
			}
			return null;
		},
		index,
		ar,
		preMatch;

	if (msos.config.verbose) {
		msos.console.debug(temp_fd + 'start, abreviated format: ' + format);
	}

	if (_.isUndefined(cal) || _.isEmpty(cal)) {
		msos.console.error(temp_fd + 'error: calendar object na!');
		return null;
	}

	if (!format || !format.length || format === "i") {
		if (culture && culture.name.length) {
			if (convert) {
				// non-gregorian calendar, so we cannot use built-in toLocaleString()
				retstr = msos.intl.formatDate(value, cal.patterns.F);
			} else {
				eraDate = new Date(value.getTime());
				era = msos.intl.getEra(value, cal.eras);
				eraDate.setFullYear(msos.intl.getEraYear(value, cal, era));
				retstr = eraDate.toLocaleString();
			  }
		} else {
			retstr = value.toString();
		}
		return retstr;
	}

	eras = cal.eras;
	sortable = format === "s" ? true : false;

	format = msos.intl.expandFormat(cal, format);

	if (!sortable && convert) {
		converted = convert.fromGregorian(value);
	}

	for ( ; ; ) {
		// Save the current index
		index = tokenRegExp.lastIndex;
		// Look for the next pattern
		ar = tokenRegExp.exec(format);
		// Append the text before the pattern (or the end of the string if not found)
		preMatch = format.slice(index, ar ? ar.index : format.length);

		quoteCount += msos.intl.appendPreOrPostMatch(preMatch, retarr);

		if (!ar) { break; }

		// do not replace any matches that occur inside a string literal.
		if (quoteCount % 2) {

			retarr.push(ar[0]);

		} else {

			current = ar[0];
			clength = current.length;

			switch (current) {
				case "ddd":
					//Day of the week, as a three-letter abbreviation
				case "dddd":
					// Day of the week, using the full name
					names = (clength === 3) ? cal.days.namesAbbr : cal.days.names;
					retarr.push(names[value.getDay()]);
				break;
				case "d":
					// Day of month, without leading zero for single-digit days
				case "dd":
					// Day of month, with leading zero for single-digit days
					retarr.push(
						padZeros(getPart(value, 2), clength)
					);
				break;
				case "MMM":
					// Month, as a three-letter abbreviation
				case "MMMM":
					// Month, using the full name
					part = getPart(value, 1);
					retarr.push(cal.months[clength === 3 ? "namesAbbr" : "names"][part]);
				break;
				case "M":
					// Month, as digits, with no leading zero for single-digit months
				case "MM":
					// Month, as digits, with leading zero for single-digit months
					retarr.push(
						padZeros(getPart(value, 1) + 1, clength)
					);
				break;
				case "y":
					// Year, as two digits, but with no leading zero for years less than 10
				case "yy":
					// Year, as two digits, with leading zero for years less than 10
				case "yyyy":
					// Year represented by four full digits
					part = converted ? converted[0] : msos.intl.getEraYear(value, cal, msos.intl.getEra(value, eras), sortable);
					if (clength < 4) {
						part = part % 100;
					}
					retarr.push(
						padZeros(part, clength)
					);
				break;
				case "h":
					// Hours with no leading zero for single-digit hours, using 12-hour clock
				case "hh":
					// Hours with leading zero for single-digit hours, using 12-hour clock
					hour = value.getHours() % 12;
					if (hour === 0) { hour = 12; }
					retarr.push(
						padZeros(hour, clength)
					);
				break;
				case "H":
					// Hours with no leading zero for single-digit hours, using 24-hour clock
				case "HH":
					// Hours with leading zero for single-digit hours, using 24-hour clock
					retarr.push(
						padZeros(value.getHours(), clength)
					);
				break;
				case "m":
					// Minutes with no leading zero for single-digit minutes
				case "mm":
					// Minutes with leading zero for single-digit minutes
					retarr.push(
						padZeros(value.getMinutes(), clength)
					);
				break;
				case "s":
					// Seconds with no leading zero for single-digit seconds
				case "ss":
					// Seconds with leading zero for single-digit seconds
					retarr.push(
						padZeros(value.getSeconds(), clength)
					);
				break;
				case "t":
					// One character am/pm indicator ("a" or "p")
				case "tt":
					// Multicharacter am/pm indicator
					part = (value.getHours() < 12) ? (cal.AM ? cal.AM[0] : " ") : (cal.PM ? cal.PM[0] : " ");
					if (clength === 1)	{ retarr.push(part.charAt(0)); }
					else				{ retarr.push(part); }
				break;
				case "f":
					// Deciseconds
				case "ff":
					// Centiseconds
				case "fff":
					// Milliseconds
					retarr.push(
						padZeros(value.getMilliseconds(), 3).substr(0, clength)
					);
				break;
				case "z":
					// Time zone offset, no leading zero
				case "zz":
					// Time zone offset with leading zero
					hour = value.getTimezoneOffset() / 60;
					retarr.push(
						(hour <= 0 ? "+" : "-") + padZeros(Math.floor(Math.abs(hour)), clength)
					);
				break;
				case "zzz":
					// Time zone offset with leading zero
					hour = value.getTimezoneOffset() / 60;
					retarr.push(
						(hour <= 0 ? "+" : "-") + padZeros(Math.floor(Math.abs(hour)), 2)
						// Hard coded ":" separator, rather than using cal.TimeSeparator
						// Repeated here for consistency, plus ":" was already assumed in date parsing.
						+ ":" + padZeros(Math.abs(value.getTimezoneOffset() % 60), 2)
					);
				break;
				case "g":
				case "gg":
					if (cal.eras) {
						retarr.push(
							cal.eras[msos.intl.getEra(value, eras)].name
						);
					}
				break;
				case "/":
					retarr.push(cal["/"]);
				break;
				default:
					msos.console.error(temp_fd + 'invalid date format pattern: ' + current);
				break;
			}
		}
	}

	if (msos.config.verbose) {
		msos.console.debug(temp_fd + 'done, output: ' + retarr.join(''));
	}
	return retarr.join('');
};

msos.intl.formatNumber = function (value, format) {
	"use strict";

	var temp_fn = 'msos.intl.formatNumber -> ',
		culture = msos.intl.culture,
		nf = culture.numberFormat,
		number = Math.abs(value),
		precision = -1,
		pattern,
		current,
		formatInfo,
		patternParts = /n|\$|-|%/g,
		ret = '',
		index,
		ar;

	if (msos.config.verbose) {
		msos.console.debug(temp_fn + 'start, value: ' + value + ', format: ' + format);
	}

	if (_.isUndefined(culture) || _.isEmpty(culture)) {
		msos.console.error(temp_fn + 'error: culture object na!');
		return null;
	}

	if (_.isUndefined(nf) || _.isEmpty(nf)) {
		msos.console.error(temp_fn + 'error: nuber format object na!');
		return null;
	}

	if (!isFinite(value)) {
		if		(value ===  Infinity)	{ return nf.positiveInfinity; }
		else if (value === -Infinity)	{ return nf.negativeInfinity; }
		return nf['NaN'];
	}

	if (!format || format === "i")		{ return culture.name.length ? value.toLocaleString() : value.toString(); }

	format = format || "D";

	if (format.length > 1) { precision = parseInt(format.slice(1), 10); }

	current = format.charAt(0).toUpperCase();

	switch (current) {
		case "D":
			pattern = "n";
			number = msos.intl.truncate(number);
			if (precision !== -1) {
				number = msos.common.zero_pad(number, precision, true);
			}
			if (value < 0) { number = "-" + String(number); }
		break;
		case "N":
			formatInfo = nf;
			// fall through
		case "C":
			formatInfo = formatInfo || nf.currency;
			// fall through
		case "P":
			formatInfo = formatInfo || nf.percent;
			pattern = value < 0 ? formatInfo.pattern[0] : (formatInfo.pattern[1] || "n");
			if (precision === -1) { precision = formatInfo.decimals; }
			number = msos.intl.expandNumber((number * (current === "P" ? 100 : 1)), precision, formatInfo);
		break;
		default:
			msos.console.error(temp_fn + 'bad specifier: ' + current);
	}

	for ( ; ; ) {
		index = patternParts.lastIndex;
		ar = patternParts.exec(pattern);

		ret += pattern.slice(index, ar ? ar.index : pattern.length);

		if (!ar) { break; }

		switch (ar[0]) {
			case "n":
				ret += number;
			break;
			case "$":
				ret += nf.currency.symbol;
			break;
			case "-":
				// don't make 0 negative
				if (/[1-9]/.test(number)) { ret += nf["-"]; }
			break;
			case "%":
				ret += nf.percent.symbol;
			break;
		}
	}

	if (msos.config.verbose) {
		msos.console.debug(temp_fn + 'done, output: ' + ret);
	}

	return ret;
};

msos.intl.outOfRange = function (value, low, high) {
	"use strict";
	return value < low || value > high;
};

msos.intl.toUpper = function (value) {
	"use strict";
	// "he-IL" has non-breaking space in weekday names.
	return value.split("\u00A0").join(" ").toUpperCase();
};

msos.intl.toUpperArray = function (arr) {
	"use strict";

	var results = [],
		i = 0;

	for (i = 0; i < arr.length; i += 1) { results[i] = msos.intl.toUpper(arr[i]); }

	return results;
};

msos.intl.expandYear = function (cal, year) {
	"use strict";

	var now,
		era,
		curr,
		twoDigitYearMax;

	// expands 2-digit year into 4 digits.
	if (year < 100) {
		now = new Date();
		era  = msos.intl.getEra(now);
		curr = msos.intl.getEraYear(now, cal, era);
		twoDigitYearMax = cal.twoDigitYearMax;

		twoDigitYearMax = typeof twoDigitYearMax === "string" ?
			new Date().getFullYear() % 100 + parseInt(twoDigitYearMax, 10) : twoDigitYearMax;

		year += curr - (curr % 100);
		if (year > twoDigitYearMax) { year -= 100; }
	}
	return year;
};

msos.intl.getDayIndex = function (cal, value, abbr) {
	"use strict";

	var ret,
		days = cal.days,
		upperDays = cal._upperDays;

	if (!upperDays) {
		cal._upperDays = upperDays = [
			msos.intl.toUpperArray(days.names),
			msos.intl.toUpperArray(days.namesAbbr),
			msos.intl.toUpperArray(days.namesShort)
		];
	}

	value = msos.intl.toUpper(value);

	if (abbr) {
		ret = _.indexOf(upperDays[1], value);
		if (ret === -1) { ret = _.indexOf(upperDays[2], value); }
	} else {
		ret = _.indexOf(upperDays[0], value);
	  }

	return ret;
};

msos.intl.getMonthIndex = function (cal, value, abbr) {
	"use strict";

	var months =		 cal.months,
		monthsGen =		 cal.monthsGenitive || cal.months,
		upperMonths =	 cal._upperMonths,
		upperMonthsGen = cal._upperMonthsGen,
		i = 0;

	if (!upperMonths) {
		cal._upperMonths = upperMonths = [
			msos.intl.toUpperArray(months.names),
			msos.intl.toUpperArray(months.namesAbbr)
		];
		cal._upperMonthsGen = upperMonthsGen = [
			msos.intl.toUpperArray(monthsGen.names),
			msos.intl.toUpperArray(monthsGen.namesAbbr)
		];
	}

	value = msos.intl.toUpper(value);

	i = _.indexOf(abbr ? upperMonths[1] : upperMonths[0], value);

	if (i < 0) { i = _.indexOf(abbr ? upperMonthsGen[1]	: upperMonthsGen[0], value); }

	return i;
};

msos.intl.getParseRegExp = function (cal, format) {
	"use strict";

	// converts a format string into a regular expression with groups that
	// can be used to extract date fields from a date string.
	// check for a cached parse regex.
	var temp_pre = 'msos.intl.getParseRegExp -> ',
		re = cal._parseRegExp,
		reFormat,
		expFormat = msos.intl.expandFormat(cal, format).replace(/([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, "\\\\$1"),
		regexp = ["^"],
		groups = [],
		index = 0,
		quoteCount = 0,
		tokenRegExp = /\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g,
		match,
		preMatch,
		m,
		len,
		add,
		regexpStr,
		parseRegExp;

	if (!re) {
		cal._parseRegExp = re = {};
	} else {
		reFormat = re[format];
		if (reFormat) { return reFormat; }
	  }

	// iterate through each date token found.
	while ((match = tokenRegExp.exec(expFormat)) !== null) {

		preMatch = expFormat.slice(index, match.index);
		index = tokenRegExp.lastIndex;

		// don't replace any matches that occur inside a string literal.
		quoteCount += msos.intl.appendPreOrPostMatch(preMatch, regexp);
	
		if (quoteCount % 2) {

			regexp.push(match[0]);

		} else {

			// add a regex group for the token.
			m = match[0];
			len = m.length;

			switch (m) {
				case "dddd": case "ddd":
				case "MMMM": case "MMM":
				case "gg": case "g":
					add = "(\\D+)";
				break;

				case "tt": case "t":
					add = "(\\D*)";
				break;

				case "yyyy":
				case "fff":
				case "ff":
				case "f":
					add = "(\\d{" + len + "})";
				break;

				case "dd": case "d":
				case "MM": case "M":
				case "yy": case "y":
				case "HH": case "H":
				case "hh": case "h":
				case "mm": case "m":
				case "ss": case "s":
					add = "(\\d\\d?)";
				break;

				case "zzz":
					add = "([+-]?\\d\\d?:\\d{2})";
				break;

				case "zz": case "z":
					add = "([+-]?\\d\\d?)";
				break;

				case "/":
					add = "(\\/)";
				break;

				default:
					msos.console.error(temp_pre + 'invalid pattern: ' + m);
				break;
			}

			if (add) { regexp.push(add); }
			groups.push(match[0]);
		}
	}

	msos.intl.appendPreOrPostMatch(expFormat.slice(index), regexp);
	regexp.push("$");

	// allow whitespace to differ when matching formats.
	regexpStr = regexp.join("").replace(/\s+/g, "\\s+");
	parseRegExp = { "regExp": regexpStr, "groups": groups };

	// cache the regex for this format.
	re[format] = parseRegExp;

	return parseRegExp;
};

msos.intl.parseExact = function (value, format) {
	"use strict";

	// try to parse the date string by matching against the format string
	// while using the specified culture for date field names.
	value = jQuery.trim(value);

	var culture = msos.intl.culture,
		cal = culture.calendar,
		// convert date formats into regular expressions with groupings.
		// use the regexp to determine the input format and extract the date fields.
		parseInfo = msos.intl.getParseRegExp(cal, format),
		match = new RegExp(parseInfo.regExp).exec(value),
		groups,
		era = null,
		year = null,
		month = null,
		date = null,
		weekDay = null,
		hour = 0,
		hourOffset,
		min = 0,
		sec = 0,
		msec = 0,
		tzMinOffset = null,
		pmHour = false,
		j = 0,
		matchGroup,
		current,
		clength,
		matchInt,
		offsets,
		minOffset,
		eraName,
		i = 0,
		result,
		convert,
		defaultYear,
		adjustedMin;

	if (match === null) { return null; }

	if (_.isUndefined(cal) || _.isEmpty(cal)) {
		msos.console.error('msos.intl.parseExact -> error: calendar object na!');
		return null;
	}

	// found a date format that matches the input.
	groups = parseInfo.groups;

	// iterate the format groups to extract and set the date fields.
	for (j = 0; j < groups.length; j += 1) {
		matchGroup = match[j + 1];
		if (matchGroup) {
			current = groups[j];
			clength = current.length;
			matchInt = parseInt(matchGroup, 10);

			switch (current) {
				case "dd": case "d":
					// Day of month.
					date = matchInt;
					// check that date is generally in valid range, also checking overflow below.
					if (msos.intl.outOfRange(date, 1, 31)) { return null; }
				break;
				case "MMM": case "MMMM":
					month = msos.intl.getMonthIndex(cal, matchGroup, clength === 3);
					if (msos.intl.outOfRange(month, 0, 11)) { return null; }
				break;
				case "M": case "MM":
					// Month.
					month = matchInt - 1;
					if (msos.intl.outOfRange(month, 0, 11)) { return null; }
				break;
				case "y": case "yy":
				case "yyyy":
					year = clength < 4 ? msos.intl.expandYear(cal, matchInt) : matchInt;
					if (msos.intl.outOfRange(year, 0, 9999)) { return null; }
				break;
				case "h": case "hh":
					// Hours (12-hour clock).
					hour = matchInt;
					if (hour === 12) { hour = 0; }
					if (msos.intl.outOfRange(hour, 0, 11)) { return null; }
				break;
				case "H": case "HH":
					// Hours (24-hour clock).
					hour = matchInt;
					if (msos.intl.outOfRange(hour, 0, 23)) { return null; }
				break;
				case "m": case "mm":
					// Minutes.
					min = matchInt;
					if (msos.intl.outOfRange(min, 0, 59)) { return null; }
				break;
				case "s": case "ss":
					// Seconds.
					sec = matchInt;
					if (msos.intl.outOfRange(sec, 0, 59)) { return null; }
				break;
				case "tt": case "t":
					// AM/PM designator.
					// see if it is standard, upper, or lower case PM. If not, ensure it is at least one of
					// the AM tokens. If not, fail the parse for this format.
					pmHour = cal.PM && (matchGroup === cal.PM[0] || matchGroup === cal.PM[1] || matchGroup === cal.PM[2]);
					if (
						!pmHour && (
							!cal.AM || (matchGroup !== cal.AM[0] && matchGroup !== cal.AM[1] && matchGroup !== cal.AM[2])
						)
					) { return null; }
				break;
				case "f":
					// Deciseconds.
				case "ff":
					// Centiseconds.
				case "fff":
					// Milliseconds.
					msec = matchInt * Math.pow(10, 3 - clength);
					if (msos.intl.outOfRange(msec, 0, 999)) { return null; }
				break;
				case "ddd":
					// Day of week.
				case "dddd":
					// Day of week.
					weekDay = msos.intl.getDayIndex(cal, matchGroup, clength === 3);
					if (msos.intl.outOfRange(weekDay, 0, 6)) { return null; }
				break;
				case "zzz":
					// Time zone offset in +/- hours:min.
					offsets = matchGroup.split(/:/);
					if (offsets.length !== 2) { return null; }
					hourOffset = parseInt(offsets[0], 10);
					if (msos.intl.outOfRange(hourOffset, -12, 13)) { return null; }
					minOffset = parseInt(offsets[1], 10);
					if (msos.intl.outOfRange(minOffset, 0, 59)) { return null; }
					tzMinOffset = (hourOffset * 60) + (msos.intl.startsWith(matchGroup, "-") ? -minOffset : minOffset);
				break;
				case "z": case "zz":
					// Time zone offset in +/- hours.
					hourOffset = matchInt;
					if (msos.intl.outOfRange(hourOffset, -12, 13)) { return null; }
					tzMinOffset = hourOffset * 60;
				break;
				case "g": case "gg":
					eraName = matchGroup;
					if (!eraName || !cal.eras) { return null; }
					eraName = jQuery.trim(eraName.toLowerCase());
					for (i = 0; i < cal.eras.length; i += 1) {
						if (eraName === cal.eras[i].name.toLowerCase()) {
							era = i;
							break;
						}
					}
					// could not find an era with that name
					if (era === null) { return null; }
				break;
			}
		}
	}

	result = new Date();
	convert = cal.convert;
	defaultYear = convert ? convert.fromGregorian(result)[0] : result.getFullYear();
	if (year === null) {
		year = defaultYear;
	} else if (cal.eras) {
		// year must be shifted to normal gregorian year
		// but not if year was not specified, its already normal gregorian
		// per the main if clause above.
		year += cal.eras[(era || 0)].offset;
	  }
	// set default day and month to 1 and January, so if unspecified, these are the defaults
	// instead of the current day/month.
	if (month === null)	{ month = 0; }
	if (date === null)	{ date = 1; }
	// now have year, month, and date, but in the culture's calendar.
	// convert to gregorian if necessary
	if (convert) {
		result = convert.toGregorian(year, month, date);
		// conversion failed, must be an invalid match
		if (result === null) { return null; }
	} else {
		// have to set year, month and date together to avoid overflow based on current date.
		result.setFullYear(year, month, date);
		// check to see if date overflowed for specified month (only checked 1-31 above).
		if (result.getDate() !== date) { return null; }
		// invalid day of week.
		if (weekDay !== null && result.getDay() !== weekDay) { return null; }
	}
	// if pm designator token was found make sure the hours fit the 24-hour clock.
	if (pmHour && hour < 12) { hour += 12; }
	result.setHours(hour, min, sec, msec);
	if (tzMinOffset !== null) {
		// adjust timezone to utc before applying local offset.
		adjustedMin = result.getMinutes() - (tzMinOffset + result.getTimezoneOffset());
		// Safari limits hours and minutes to the range of -127 to 127.	 We need to use setHours
		// to ensure both these fields will not exceed this range.	adjustedMin will range
		// somewhere between -1440 and 1500, so we only need to split this into hours.
		result.setHours(result.getHours() + parseInt(adjustedMin / 60, 10), adjustedMin % 60);
	}
	return result;
};

msos.intl.parseNegativePattern = function (value, nf, negativePattern) {
	"use strict";

	var neg = nf["-"],
		pos = nf["+"],
		ret;
	
	switch (negativePattern) {
		case "n -":
			neg = " " + neg;
			pos = " " + pos;
			// fall through
		case "n-":
			if			(msos.intl.endsWith(value, neg)) {
				ret = ["-", value.substr(0, value.length - neg.length)];
			} else if	(msos.intl.endsWith(value, pos)) {
				ret = ["+", value.substr(0, value.length - pos.length)];
			  }
		break;
		case "- n":
			neg += " ";
			pos += " ";
			// fall through
		case "-n":
			if			(msos.intl.startsWith(value, neg)) {
				ret = ["-", value.substr(neg.length)];
			} else if	(msos.intl.startsWith(value, pos)) {
				ret = ["+", value.substr(pos.length)];
			  }
		break;
		case "(n)":
			if (msos.intl.startsWith(value, "(") && msos.intl.endsWith(value, ")")) {
				ret = ["-", value.substr(1, value.length - 2)];
			}
		break;
	}
	return ret || ["", value];
};


// --------------------------
// Culture formating functions
// --------------------------

msos.intl.format = function (value, format) {
	"use strict";

	var value_type = 'unknown';

	if			(value instanceof Date) {
		value_type = 'date';
		value = msos.intl.formatDate(value, format);
	} else if	(typeof value === "number") {
		value_type = 'number';
		value = msos.intl.formatNumber(value, format);
	}

	if (msos.config.verbose) {
		msos.console.debug('msos.intl.format -> returned: ' + value + ', for: ' + value_type);
	}

	return value;
};

msos.intl.parseDate = function (value, formats) {
	"use strict";

	var culture = msos.intl.culture,
		date = null,
		prop,
		patterns,
		i = 0,
		format;

	if (formats) {
		if (typeof formats === "string") {
			formats = [formats];
		}
		if (formats.length) {
			for (i = 0; i < formats.length; i += 1) {
				format = formats[i];
				if (format) {
					date = msos.intl.parseExact(value, format);
					if (date) { break; }
				}
			}
		}
	} else {
		patterns = culture.calendar.patterns;
		for (prop in patterns) {
			date = msos.intl.parseExact(value, patterns[prop]);
			if (date) { break; }
		}
	  }

	return date;
};

msos.intl.parseFloat = function (value, radix) {
	"use strict";

    var temp_pf = 'msos.intl.parseFloat -> ',
		culture = msos.intl.culture,
		regexHex = /^0x[a-f0-9]+$/i,
		regexInfinity = /^[+\-]?infinity$/i,
		regexParseFloat = /^[+\-]?\d*\.?\d*(e[+\-]?\d+)?$/,
		ret = NaN,
		nf = culture.numberFormat,
		signInfo,
		sign,
		num,
		exponent,
		intAndFraction,
		exponentPos,
		integer,
		fraction,
		decSep,
		decimalPos,
		groupSep,
		altGroupSep,
		p,
		expSignInfo;

	// radix argument is optional
	if (typeof radix !== "number") {
		msos.console.warn(temp_pf + 'radix set to 10!');
		radix = 10;
	}

	if (_.isUndefined(culture) || _.isEmpty(culture)) {
		msos.console.error(temp_pf + 'error: culture object na!');
		return null;
	}

	if (value.indexOf(nf.currency.symbol) !== -1) {
		// remove currency symbol
		value = value.replace(nf.currency.symbol, "");
		// replace decimal seperator
		value = value.replace(nf.currency["."], nf["."]);
	}

	// Remove percentage character from number string before parsing
	if ( value.indexOf(nf.percent.symbol) !== -1){
		value = value.replace(nf.percent.symbol, "" );
	}

	// trim leading and trailing whitespace
	value = jQuery.trim(value);

	// allow infinity or hexidecimal
	if			(regexInfinity.test(value)) {
		ret = parseFloat(value);
	} else if	(!radix && regexHex.test(value)) {
		ret = parseInt(value, 16);
	} else {
		// determine sign and number
		signInfo = msos.intl.parseNegativePattern(value, nf, nf.pattern[0]);
		sign = signInfo[0];
		num  = signInfo[1];

		// #44 - try parsing as "(n)"
		if (sign === "" && nf.pattern[0] !== "(n)") {
			signInfo = msos.intl.parseNegativePattern(value, nf, "(n)");
			sign = signInfo[0];
			num  = signInfo[1];
		}

		// try parsing as "-n"
		if (sign === "" && nf.pattern[0] !== "-n") {
			signInfo = msos.intl.parseNegativePattern(value, nf, "-n");
			sign = signInfo[0];
			num  = signInfo[1];
		}

		sign = sign || "+";

		// determine exponent and number
		exponentPos = num.indexOf("e");
	
		if (exponentPos < 0) { exponentPos = num.indexOf("E"); }
	
		if (exponentPos < 0) {
			intAndFraction = num;
			exponent = null;
		} else {
			intAndFraction = num.substr(0, exponentPos);
			exponent = num.substr(exponentPos + 1);
		  }

		// determine decimal position
		decSep = nf["."];
		decimalPos = intAndFraction.indexOf(decSep);

		if (decimalPos < 0) {
			integer = intAndFraction;
			fraction = null;
		} else {
			integer = intAndFraction.substr(0, decimalPos);
			fraction = intAndFraction.substr(decimalPos + decSep.length);
		  }

		// handle groups (e.g. 1,000,000)
		groupSep = nf[","];
		integer = integer.split(groupSep).join("");
		altGroupSep = groupSep.replace(/\u00A0/g, " ");

		if (groupSep !== altGroupSep) {
			integer = integer.split(altGroupSep).join("");
		}

		// build a natively parsable number string
		p = sign + integer;

		if (fraction !== null) {
			p += "." + fraction;
		}

		if (exponent !== null) {
			// exponent itself may have a number patternd
			expSignInfo = msos.intl.parseNegativePattern(exponent, nf, "-n");
			p += "e" + (expSignInfo[0] || "+") + expSignInfo[1];
		}
		if (regexParseFloat.test(p)) {
			ret = parseFloat(p);
		}
	}
	return ret;
};

msos.intl.parseInt = function (value, radix) {
	"use strict";
	return msos.intl.truncate(msos.intl.parseFloat(value, radix));
};


// This starts after msos.i18n.start
msos.onload_func_start.push(msos.intl.start);