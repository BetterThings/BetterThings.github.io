// Copyright Notice:
//					base.js
//			Copyright©2012-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile MobileSiteOS base object file.
	Use as the installation base for all your MobileSiteOS web apps.
*/


// --------------------------
// Our Global Object
// --------------------------
var msos = {

	// *******************************************
    // Edit these key/value pairs on initial setup
	// *******************************************

    // Edit msos.default_locale (to be your native or typical user language) using one of the
    // codes in 'msos.config.i18n.select_trans_msos'. This must correspond to the language used
    // for the files in the 'ROOT' of the '/msos/nls' folder (those used as default, which are currently 'en').
    default_locale: (document.getElementsByTagName('html')[0].getAttribute('lang') || 'en'),

	// Edit msos.default_translate to be your preferred initial 'translate to' language for
	// '/demo/msos_translate.html'.
	default_translate: 'fr',

    // Edit msos.default_country to be the country codes most likely used by your user's, based on browser
    // language locale code (note: use underscores for '-' in object item name). See 'msos.countrystate.country'
    // for ref. to available two-letter country codes for value.
    default_country: {
        en: 'US',
        fr: 'FR',
        de: 'DE'
    },

	// Edit msos.default_keyboard_locales to be the most utilized language (locale) by your user's.
	// Order is relative to there display. These codes are base on the available codes found in
	// msos.config.i18n.select_kbrds_msos
	default_keyboard_locales: [
		'en', 'fr', 'de', 'es'
	],

	// *******************************************
    // *** Do NOT edit the key/value pairs below ***
	// *******************************************

    base_site_url: '//' + document.domain,
	base_script_url: '',
	base_config_url: '',
	base_images_url: '',

    body: null,
    head: null,
    html: null,
    docl: null,

	ajax_loading_kbps: {},

	deferred_css: [],
	deferred_scripts: [],

	dom: {},

    form_inputs: null,
    form_validate: null,
    html_inputs: ['text', 'file', 'password', 'textarea', 'radio', 'checkbox', 'select'],
    html5_attributes: [
		// All possible HTML5 form input attributes
		'autocomplete', 'autofocus', 'list', 'placeholder', 'max', 'min', 'maxlength', 'multiple', 'pattern', 'required', 'step'
	],
    html5_inputs: [
		// All possible HTML5 input fields
		'search', 'tel', 'url', 'email', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'number', 'range', 'color'
	],

    i18n_order: [],
    i18n_queue: 0,

	log_methods: ['error', 'warn', 'info', 'debug', 'time', 'timeEnd', 'log'],

	onload_func_pre:	[],
    onload_func_start:	[],
    onload_functions:	[],
    onload_func_done:	[],
	onload_func_post:	[],

	ondisplay_size_change: [],

	onorientationchange_functions: [],
    onresize_functions: [],

    record_times: {},

    registered_files: {
        js: {},
        css: {},
        ico: {},
		ajax: {}
    },
    registered_folders: {
        msos: '',
        jquery: '',
        apps: ''
    },
    registered_modules: {
        msos: false
    },
    registered_templates: {},
    registered_tools: {},
    require_attempts: 0,
	require_deferred: 0,
    require_queue: 0
};


// *******************************************
// Base Configuration Settings
// Edit as deisired for all apps
// *******************************************

msos.config = {
	// Ref. -> set app specifics in '/js/config.js' file
    console: false,
	clear_cookies: false,
	clear_storage: false,
    debug: false,
	debug_css: false,
	debug_output: false,
	debug_script: false,
    mobile: false,
	verbose: false,
	visualevent: false,

    run_ads: false,
	run_size: false,
	run_analytics: false,
    run_onerror: false,
	run_overflowscroll: false,
    run_social: false,
	run_translate: false,
	run_amazon_prev: false,

    browser: {
        advanced: false,
        current: false,
        direction: '',
        editable: false,
        mobile: false,
        touch: false
    },

    // jQuery.ajax, 'cache' required scripts/templates (static files), false for testing
    cache: true,

    // Editable display or resource variables
    color: {
        bk: 'black',
        wh: 'white',
        dg: 'darkgrey',
        lg: 'lightgrey',
        sl: 'salmon',
        lb: 'lightblue',
        rd: 'red',
        be: 'beige'
    },

	connection: {
		type: 0,
		bandwidth: 10,
		metered: false
	},

    cookie: {
		// These are specific cookie names
        site_pref: { name: 'msos_site_pref', value: '', set: false, params: { expires: 30 } },		// Site Preferences -> core.uc.js & core.min.js
        site_i18n: { name: 'msos_site_i18n', value: '', set: false, params: { expires: 30 } },		// i18n -> msos.i18n & msos.intl
		site_cart: { name: 'msos_site_cart', value: '', set: false, params: { expires:  1 } },		// Google Cart -> msos.google.cart
		site_cltl: { name: 'msos_site_cltl', value: '', set: false, params: { expires: 15 } },		// Colortool -> msos.colortool.calc
		site_bdwd: { name: 'msos_site_bdwd', value: '', set: false, params: { expires:  1 } },		// Bandwidth -> core.uc.js & core.min.js 

		// These are base names
		site_tabs: { name: 'msos_site_tab_', params: { expires:  1 } },		// Tabs -> msos.tab
		site_sdmn: { name: 'msos_site_sdm_', params: { expires:  1 } },		// Slashdot Menu -> msos.sdmenu.js
		site_popu: { name: 'msos_site_pop_', params: { expires:  1 } }		// Popup Div's -> msos.popdiv
    },

	// All the T/F toggles used for debugging (see msos.debugform)
	debugging: [
		'console',
		'debug', 'debug_script', 'debug_css', 'debug_output',
		'mobile', 'verbose', 'visualevent',
		'run_ads', 'run_size', 'run_analytics', 'run_onerror',
		'run_overflowscroll', 'run_social', 'run_translate', 'run_amazon_prev',
		'use_date', 'use_color', 'use_number', 'use_range',
		'clear_cookies', 'clear_storage'
	],

    // Default settings and tests
    doctype: window.document.getElementsByTagName('html')[0].getAttribute('xmlns') ? 'xhtml5' : 'html5',

    file: {
        'file': (typeof window.File === "object" ? true : false),
        'reader': (typeof window.FileReader === "function" ? true : false),
        'list': (typeof window.FileList === "object" ? true : false),
        'blob': (typeof window.Blob === "object" ? true : false)
    },

    // Force the use of MSOS HTML5 shim widgets?
	force_shim: {
		inputs: {
			date: true,
			color: true,
			number: true,
			range: true,
			time: false,
			month: false,
			week: false
		},
		media: {
			// Future
			video: false,
			audio: false
		}
	},

	google: {
		no_translate: {},
		hide_tooltip: {}
	},

	// Set full url in config.js file
	hellojs_redirect: '/mobilesiteos/hello/redirect.html',

    // See 'msos.i18n' and the 'MSOS Available Language Matrix' for ref.
    i18n: {
        select_trans_msos: {},
        select_kbrds_msos: {}
    },

    // See 'msos.intl' for ref.
    intl: {
        select_culture: {},
        select_calendar: {}
    },

    // i18n Internationalization config and object definitions
     locale: (navigator.language || navigator.userLanguage || msos.default_locale).replace('-', '_').toLowerCase(),
    culture: (navigator.language || navigator.userLanguage || msos.default_locale).replace('-', '_').toLowerCase(),
    calendar: 'standard',

    json: (typeof JSON === 'object' && typeof JSON.stringify === 'function' && typeof JSON.parse === 'function' ? true : false),

    jquery_ui_theme: 'mobilesiteos',
    jquery_ui_avail: {
        base: 'Base (generic)',
        lightness: 'UI-Lightness',
		mobilesiteos: 'MobileSiteOS'
    },

	keyboard: '',
	keyboard_locales: [].concat(msos.default_keyboard_locales),

    gesture: (function () {
        "use strict";
        var el = document.createElement('div');
        el.setAttribute('ongesturestart', 'return;');
        return (typeof el.ongesturestart === 'function' ? true : false);
    }()),

	onerror_uri: 'http://' + window.location.hostname + '/onerror.html',

	orientation: (typeof window.orientation === 'number' ? true : false),
    orientation_change: ('onorientationchange' in window ? true : false),

	page_uri: window.location.href,

    pixel_ratio: window.devicePixelRatio || 1,

    popups_blocked: false,

	query: {},

    script_onerror: (function () {
        "use strict";
        var spt = document.createElement('script');
			spt.type = 'text/javascript';
			spt.setAttribute('onerror', "return;");
        if (typeof spt.onerror === 'function') {
            return true;
        }
        return ('onerror' in spt ? true : false);
    }()),

	script_preload: {
		available: false,
		async: false,
		defer: false,
		explicit: false,
		ordered: false,
		xhr_cache: false
	},

    scrolltop: (window.pageXOffset !== undefined || document.documentElement.scrollTop !== undefined ? true : false),

	size: 'phone',
	size_array: [],
    size_wide: {		// Note: these keys are the names used to call sizing CSS
		'desktop': 1080,
        'large': 960,
        'medium': 760,
        'small': 640,
        'tablet': 480,
        'phone': 320
    },

	social: {},

	storage: {
		sessionstorage: {
			site_bdwd: { name: 'msos_site_bdwd', value: '', set: false }
		},
		localstorage: {
			site_form: { name: 'msos_site_form', value: '', set: false }
		}
	},

    touch: {
        ontouchstart: ('ontouchstart' in window ? true : false),
        ontouchend: ('ontouchend' in document ? true : false),
        object: (typeof window.Touch === "object" ? true : false),
        event: (window.TouchEvent !== undefined ? true : false),
        create: ('createTouch' in document ? true : false),
		doc_touch: ('DocumentTouch' in window && document instanceof DocumentTouch ? true : false)
    },

    view_orientation: {
        layout: '',
        direction: '',
        method: '',
        numeric: 0
    },

    view_port: {
        height: 0,
        width: 0,
        delta_width: 0,
        delta_heigth: 0
    }
};


/*
 * Purl (A JavaScript URL parser) v2.3.1
 * Developed and maintanined by Mark Perkins, mark@allmarkedup.com
 * Source repository: https://github.com/allmarkedup/jQuery-URL-Parser
 * Licensed under an MIT-style license. See https://github.com/allmarkedup/jQuery-URL-Parser/blob/master/LICENSE for details.
 */

;(function(_global) {

    var tag2attr = {
            a       : 'href',
            img     : 'src',
            form    : 'action',
            base    : 'href',
            script  : 'src',
            iframe  : 'src',
            link    : 'href',
            embed   : 'src',
            object  : 'data'
        },

        key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'], // keys available to query

        aliases = { 'anchor' : 'fragment' }, // aliases for backwards compatability

        parser = {
            strict : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,  //less intuitive, more accurate to the specs
            loose :  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // more intuitive, fails on relative paths and deviates from specs
        },

        isint = /^[0-9]+$/;

    function parseUri( url, strictMode ) {
        var str = decodeURI( url ),
        res   = parser[ strictMode || false ? 'strict' : 'loose' ].exec( str ),
        uri = { attr : {}, param : {}, seg : {} },
        i   = 14;

        while ( i-- ) {
            uri.attr[ key[i] ] = res[i] || '';
        }

        // build query and fragment parameters
        uri.param['query'] = parseString(uri.attr['query']);
        uri.param['fragment'] = parseString(uri.attr['fragment']);

        // split path and fragement into segments
        uri.seg['path'] = uri.attr.path.replace(/^\/+|\/+$/g,'').split('/');
        uri.seg['fragment'] = uri.attr.fragment.replace(/^\/+|\/+$/g,'').split('/');

        // compile a 'base' domain attribute
        uri.attr['base'] = uri.attr.host ? (uri.attr.protocol ?  uri.attr.protocol+'://'+uri.attr.host : uri.attr.host) + (uri.attr.port ? ':'+uri.attr.port : '') : '';

        return uri;
    }

    function getAttrName( elm ) {
        var tn = elm.tagName;
        if ( typeof tn !== 'undefined' ) return tag2attr[tn.toLowerCase()];
        return tn;
    }

    function promote(parent, key) {
        if (parent[key].length === 0) return parent[key] = {};
        var t = {};
        for (var i in parent[key]) t[i] = parent[key][i];
        parent[key] = t;
        return t;
    }

    function parse(parts, parent, key, val) {
        var part = parts.shift();
        if (!part) {
            if (isArray(parent[key])) {
                parent[key].push(val);
            } else if ('object' == typeof parent[key]) {
                parent[key] = val;
            } else if ('undefined' == typeof parent[key]) {
                parent[key] = val;
            } else {
                parent[key] = [parent[key], val];
            }
        } else {
            var obj = parent[key] = parent[key] || [];
            if (']' == part) {
                if (isArray(obj)) {
                    if ('' !== val) obj.push(val);
                } else if ('object' == typeof obj) {
                    obj[keys(obj).length] = val;
                } else {
                    obj = parent[key] = [parent[key], val];
                }
            } else if (~part.indexOf(']')) {
                part = part.substr(0, part.length - 1);
                if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                parse(parts, obj, part, val);
                // key
            } else {
                if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                parse(parts, obj, part, val);
            }
        }
    }

    function merge(parent, key, val) {
        if (~key.indexOf(']')) {
            var parts = key.split('[');
            parse(parts, parent, 'base', val);
        } else {
            if (!isint.test(key) && isArray(parent.base)) {
                var t = {};
                for (var k in parent.base) t[k] = parent.base[k];
                parent.base = t;
            }
            if (key !== '') {
                set(parent.base, key, val);
            }
        }
        return parent;
    }

    function parseString(str) {
        return reduce(String(str).split(/&|;/), function(ret, pair) {
            try {
                pair = decodeURIComponent(pair.replace(/\+/g, ' '));
            } catch(e) {
                // ignore
            }
            var eql = pair.indexOf('='),
                brace = lastBraceInKey(pair),
                key = pair.substr(0, brace || eql),
                val = pair.substr(brace || eql, pair.length);

            val = val.substr(val.indexOf('=') + 1, val.length);

            if (key === '') {
                key = pair;
                val = '';
            }

            return merge(ret, key, val);
        }, { base: {} }).base;
    }

    function set(obj, key, val) {
        var v = obj[key];
        if (typeof v === 'undefined') {
            obj[key] = val;
        } else if (isArray(v)) {
            v.push(val);
        } else {
            obj[key] = [v, val];
        }
    }

    function lastBraceInKey(str) {
        var len = str.length,
            brace,
            c;
        for (var i = 0; i < len; ++i) {
            c = str[i];
            if (']' == c) brace = false;
            if ('[' == c) brace = true;
            if ('=' == c && !brace) return i;
        }
    }

    function reduce(obj, accumulator){
        var i = 0,
            l = obj.length >> 0,
            curr = arguments[2];
        while (i < l) {
            if (i in obj) curr = accumulator.call(undefined, curr, obj[i], i, obj);
            ++i;
        }
        return curr;
    }

    function isArray(vArg) {
        return Object.prototype.toString.call(vArg) === "[object Array]";
    }

    function keys(obj) {
        var key_array = [];
        for ( var prop in obj ) {
            if ( obj.hasOwnProperty(prop) ) key_array.push(prop);
        }
        return key_array;
    }

    function purl( url, strictMode ) {
        if ( arguments.length === 1 && url === true ) {
            strictMode = true;
            url = undefined;
        }
        strictMode = strictMode || false;
        url = url || window.location.toString();

        return {

            data : parseUri(url, strictMode),

            // get various attributes from the URI
            attr : function( attr ) {
                attr = aliases[attr] || attr;
                return typeof attr !== 'undefined' ? this.data.attr[attr] : this.data.attr;
            },

            // return query string parameters
            param : function( param ) {
                return typeof param !== 'undefined' ? this.data.param.query[param] : this.data.param.query;
            },

            // return fragment parameters
            fparam : function( param ) {
                return typeof param !== 'undefined' ? this.data.param.fragment[param] : this.data.param.fragment;
            },

            // return path segments
            segment : function( seg ) {
                if ( typeof seg === 'undefined' ) {
                    return this.data.seg.path;
                } else {
                    seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1; // negative segments count from the end
                    return this.data.seg.path[seg];
                }
            },

            // return fragment segments
            fsegment : function( seg ) {
                if ( typeof seg === 'undefined' ) {
                    return this.data.seg.fragment;
                } else {
                    seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1; // negative segments count from the end
                    return this.data.seg.fragment[seg];
                }
            }

        };

    }

    _global.purl = purl;

}(msos));


// *******************************************
// Script Basics (No jQuery, underscore.js, Backbone.js)
// *******************************************

msos.parse_query = function () {
    "use strict";

	var url = msos.purl(),	// Get current page url
		key = '',
        cfg = '',
		result = url.param();

    for (key in result) {
        if (result[key] === 'true')		{ result[key] = true; }
        if (result[key] === 'false')	{ result[key] = false; }
    }

    // Update msos.config if new info passed in by query string
    for (cfg in msos.config) {
        if (result[cfg] || result[cfg] === false) {
            msos.config[cfg] = result[cfg];
        }
    }

	// Verbose output implies debugging too.
	if (msos.config.verbose) { msos.config.debug = true; }

    return result;
};

// Run immediately so inputs are evaluated
msos.config.query = msos.parse_query();

// Sort 'size_wide' object into consistent 'size_array' for resizeable displays
Object.keys(msos.config.size_wide).map(
		function (k) {
			return [k, msos.config.size_wide[k]];
		}
	).sort(
		function (a, b) {
			if (a[1] < b[1]) return -1;
			if (a[1] > b[1]) return  1;
			return 0;
		}
	).forEach(
		function (d) {
			msos.config.size_array.push(d[0]);
		}
	);

msos.console = (function () {
	"use strict";

	var console_obj = { queue: [] },
		console_win = window.console,
		idx = msos.log_methods.length - 1,
		aps = Array.prototype.slice;

	// From AngularJS
    function formatError(arg) {
      if (arg instanceof Error) {
        if (arg.stack) {
          arg = (arg.message && arg.stack.indexOf(arg.message) === -1)
              ? 'Error: ' + arg.message + '\n' + arg.stack
              : arg.stack;
        } else if (arg.sourceURL) {
          arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
        }
      }
      return arg;
    }

	while (idx >= 0) {

		(function (method) {

			console_obj[method] = function () {

				var cfg = msos.config,
					filter = cfg.query.debug_filter || '',
					i = 0;
			
				if (method === 'debug' && !cfg.debug) { return; }

				var args = aps.apply(arguments),
					name = args[0] ? args[0].replace(/\W/g, '_') : 'missing_args',
					console_org = console_win[method] || console_win.log,
					log_output = [],
					out_args = [];

				if (method === 'debug' && cfg.verbose && filter && /^[0-9a-zA-Z.]+$/.test(filter)) {
					filter = new RegExp('^' + filter.replace('.', "\."));
					if (!name.match(filter)) { return; }
				}

				if (method === 'time' || method === 'timeEnd') {
					msos.record_times[name + '_' + method] = (new Date()).getTime();
				}

				// if msos console output, add this
				if (cfg.console) {

					log_output = [method].concat(args);

					if (method === 'time' || method === 'timeEnd') {
						log_output.push(msos.record_times[name + '_' + method]);
					}

					console_obj.queue.push(log_output);
				}

				// if window console, add it
				if (console_win) {
					if (console_org.apply) {
						for (i = 0; i < args.length; i += 1) {
							out_args.push(formatError(args[i]));
						}
						// Do this for normal browsers
						console_org.apply(console_win, out_args);
					} else {
						// Do this for IE9
						var message = args.join(' ');
						console_org(message);
					}
				}
			};

		}(msos.log_methods[idx]));

		idx -= 1;
	}

	return console_obj;
}());

msos.console.time('base');
msos.console.info('msos/base -> start.');


// --------------------------
// MSOS Helper Functions
// --------------------------
msos.var_is_null = function (variable) {
    "use strict";

    if (variable === undefined)	{ return true;  }
    if (variable === null)		{ return true;  }
    return false;
};

msos.var_is_empty = function (variable) {
    "use strict";

    if (msos.var_is_null(variable))	{ return true;  }
    if (variable === '')			{ return true;  }
	return false;
};

msos.do_nothing = function (evt) {
    'use strict';

    evt.preventDefault();
    evt.stopPropagation();
};

msos.do_abs_nothing = function (evt) {
    'use strict';

    evt.preventDefault();
    evt.stopImmediatePropagation();
};

msos.new_time = function () {
	"use strict";
	return (new Date()).getTime();
};

msos.set_version = function (mjr, mnr, pth) {
	"use strict";

	var self = this;

	self = {			// loosely translates to:
		major: mjr,		// year
		minor: mnr,		// month
		patch: pth,		// day
		toString: function () {
			return 'v' + self.major + '.' + self.minor + '.' + self.patch;
		}
	};

	return self;
};

msos.gen_namespace = function (b) {
	"use strict";

	var a = window,
		c = 0;

	b = b.split('.');

	for (c = 0; c < b.length; c += 1) {
		a = a[b[c]] || (a[b[c]] = {});
	}

	return a;
};

msos.generate_url_name = function (url) {
	"use strict";

	var path,
		parts = [],
		name = '';

	path = msos.purl(url).attr('path');

	parts = path.split('/');

	// Remove first two "commom" elements and clean up for use as key
	name = parts.slice(2).join(':');
	name = name.replace(/[^0-9a-zA-Z]/g, '_');

	return name;
};

msos.run_function_array = function (name) {
	"use strict";

	var temp_fa = 'msos.run_func_array -> ',
		m = 0;

	name = name || 'missing';

	msos.console.debug(temp_fa + 'start: ' + name);

	if (!msos[name] || !(_.isArray(msos[name]))) {
		msos.console.error(temp_fa + 'for: ' + name + ', failed.');
		return;
	}

	for (m = 0; m < msos[name].length; m += 1) {

		msos.console.debug(temp_fa + 'index: ' + m);

		try {
			msos[name][m]();
		} catch (e) {
			msos.console.error(temp_fa + 'for: ' + name, e);
		}
	}

	// Clear all functions
	msos[name] = [];

	msos.console.debug(temp_fa + 'done: ' + name);
};


// --------------------------
// Get Script url Location
// --------------------------
msos.get_js_base = function () {
    "use strict";

    var temp_gsl = 'msos.get_js_base -> ',
		scripts_array,
		current_script,
		script_url;

	msos.console.debug(temp_gsl + 'start.');

    scripts_array = document.getElementsByTagName('script');
    current_script = scripts_array[scripts_array.length - 1]; // last available script is this one when called
    script_url = current_script.src;
    script_url = script_url.slice(0, script_url.lastIndexOf('/') + 1) || '';

	// No reason to continue
    if (!script_url) { throw new Error(temp_gsl + 'failed!'); }

	msos.console.debug(temp_gsl + 'done, uri: ' + script_url);
	return script_url;
};

// Run immediately to get the current 'base.js' location
msos.base_script_url = msos.get_js_base();


// --------------------------
// Apply Resource (relative) Locations
// --------------------------
msos.resource_url = function (folder, resource_file) {
    "use strict";
    // Always relative to 'msos' folder
    return msos.base_script_url.replace(/\/msos\//, '/' + folder + '/') + resource_file;
};


// --------------------------
// Get and Set Cookies Function
// --------------------------
msos.cookie = function (name, value, params) {
    "use strict";

    var temp_coo = 'msos.cookie -> ',
		expires = '',
		date = null,
		path = '',
		domain = '',
		secure = '',
		baked = '',
		cookies = [],
		cookie = '',
		found_cookie_value = '',
		i = 0;

	if (msos.config.verbose) {
		msos.console.debug(temp_coo + 'start, ' + (value ? 'set' : 'get') + ' for ' + name);
	}

	// name and value given, set cookie
    if (value !== undefined) {

        params = params || { expires: 90, path : '/'};

		// Delete cookie for 'null' value
        if (value === null) {
            value = '';
            params.expires = -1;
			msos.console.debug(temp_coo + 'delete: ' + name);
        }

        if (params.expires && (typeof params.expires === 'number' || params.expires.toUTCString)) {
            if (typeof params.expires === 'number') {
                date = new Date();
                date.setTime(date.getTime() + (params.expires * 86400000));
            } else {
                date = params.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }

        path =   params.path    ? '; path='   + (params.path)   : '; path=/';
        domain = params.domain  ? '; domain=' + (params.domain) : '';
        secure = params.secure  ? '; secure'                    : '';
		baked = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');

        document.cookie = baked;

		if (msos.config.verbose) {
			msos.console.debug(temp_coo + 'done, set: ' + baked);
		}

		return true;
    }

	found_cookie_value = '';

	if (document.cookie && document.cookie !== '') {
		cookies = document.cookie.split(';');
		for (i = 0; i < cookies.length; i += 1) {
			cookie = cookies[i];
			cookie = cookie.replace(/^\s+|\s+$/g, '');
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				found_cookie_value = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}

	if (msos.config.verbose) {
		msos.console.debug(temp_coo + 'done, get: ' + (found_cookie_value || "na"));
	}

	return found_cookie_value;
};

msos.clear_cookies = function () {
	"use strict";

	var temp_cc = 'msos.clear_cookies -> ',
		idx = 0,
		names = ['site_pref', 'site_i18n', 'site_cart', 'site_cltl', 'site_bdwd'],
		site_cookie;

	msos.console.debug(temp_cc + 'start.');

	for (idx = 0; idx < names.length; idx += 1) {
		site_cookie = msos.config.cookie[names[idx]] || 0;
		if (site_cookie) {
			// Delete the cookie
			msos.cookie(site_cookie.name, null);
		}
	}

	msos.console.debug(temp_cc + 'done!');
};

//Clear cookies for testing, debugging
if (msos.config.clear_cookies) { msos.clear_cookies(); }

msos.set_locale = function () {
	"use strict";

	var temp_gl = 'msos.set_locale -> ',
		cfg = msos.config,
		cookie_obj = cfg.cookie.site_i18n,
		cookie_array = [];

    if (cookie_obj.value) { cookie_array = cookie_obj.value.split(':'); }

	msos.console.debug(temp_gl + 'start, cookie: ' + (cookie_obj.value || 'na'));

    // Check user input, then cookie, then browser or default
    cfg.locale =   cfg.query.locale		|| cookie_array[0] || cfg.locale	|| msos.default_locale;
    cfg.culture =  cfg.query.culture	|| cookie_array[1] || cfg.culture	|| cfg.locale;
    cfg.calendar = cfg.query.calendar	|| cookie_array[2] || cfg.calendar;

	msos.console.debug(temp_gl + 'done, locale: ' + cfg.locale + ', culture: ' + cfg.culture + ', calendar: ' + cfg.calendar);
};

msos.set_locale_cookie = function () {
	"use strict";

	var temp_sl = 'msos.set_locale_cookie -> ',
		cookie_obj = msos.config.cookie.site_i18n;

	msos.console.debug(temp_sl + 'start.');

    cookie_obj.value = msos.config.locale + ':' + msos.config.culture + ':' + msos.config.calendar;

	msos.cookie(
        cookie_obj.name,
        cookie_obj.value,
        cookie_obj.params
    );

	msos.console.debug(temp_sl + 'done, value: ' + cookie_obj.value );
    cookie_obj.set = true;
};


// --------------------------
// Browser detection & testing
// --------------------------
msos.get_viewport = function (for_win) {
    "use strict";

    var d = for_win.document,
		dd = d.documentElement,
		b = d.body || d.getElementsByTagName("body")[0],
		port = { width: 0, height: 0 },
		temp_txt = "msos.get_viewport -> ";

    if	(for_win.innerWidth !== undefined) {
		port.width  = for_win.innerWidth;
		port.height = for_win.innerHeight;
		temp_txt += 'innerWidth/Height spec';
    } else if	(dd && dd.clientWidth) {
		port.width  = dd.clientWidth;
		port.height = dd.clientHeight;
		temp_txt += 'documentElement.clientWidth/Height spec';
    } else if	(b && b.clientWidth) {
		port.width  = b.clientWidth;
		port.height = b.clientHeight;
		temp_txt += 'body.clientWidth/Height spec';
    } else {
		if (window !== for_win)	{ temp_txt += 'failed for (popup window), this'; }
		else					{ temp_txt += 'failed for this'; }
      }

    if (window === for_win) { msos.config.view_port = port; }

    msos.console.debug(temp_txt + ' browser.');
    return port;
};

msos.browser_orientation = function () {
    "use strict";

    var orient_ref = msos.config.view_orientation,
		v_port_ref = msos.get_viewport(window),
		temp_txt = 'msos.browser_orientation -> ';

    if (window.orientation !== undefined) {
		switch (window.orientation) {
			case 0:
				orient_ref.layout = "portrait";
				orient_ref.direction = 'normal';
				orient_ref.numeric = 0;
			break;
			case -90:
				orient_ref.layout = "landscape";
				orient_ref.direction = 'right';
				orient_ref.numeric = -90;
			break;
			case 90:
				orient_ref.layout = "landscape";
				orient_ref.direction = 'left';
				orient_ref.numeric = 90;
			break;
			case 180:
				orient_ref.layout = "portrait";
				orient_ref.direction = 'flipped';
				orient_ref.numeric = 180;
			break;
			default:
				orient_ref.layout = v_port_ref.width / v_port_ref.height < 1.1 ? "portrait" : "landscape";
				orient_ref.direction = 'normal';
				orient_ref.numeric = v_port_ref.width / v_port_ref.height < 1.1 ? 0 : 90;
		}
		orient_ref.method = 'window.orientation(' + window.orientation + ')';
    } else {
		orient_ref.layout = v_port_ref.width / v_port_ref.height < 1.1 ? "portrait" : "landscape";
		orient_ref.direction = 'normal';
		orient_ref.method = 'document.documentElement';
		orient_ref.numeric = v_port_ref.width / v_port_ref.height < 1.1 ? 0 : 90;
      }

    msos.console.debug(temp_txt + 'layout: ' + orient_ref.layout + ', dir: ' + orient_ref.direction + ' for ' + orient_ref.method);

    return orient_ref;
};

msos.browser_current = function () {
    "use strict";

    var temp_txt = 'msos.browser_current -> ',
		failed = [];

    if (!window.focus)              { failed.push('window.focus'); }
    if (!document.images)           { failed.push('document.images'); }
    if (!document.styleSheets)      { failed.push('document.styleSheets'); }
    if (!document.open)             { failed.push('document.open'); }
    if (!document.close)            { failed.push('document.close'); }
    if (!window.document.write)     { failed.push('document.write'); }
	if (!document.addEventListener) { failed.push('document.addEventListener'); }	// Looking at you IE...

    if (failed.length === 0) {
        msos.console.debug(temp_txt + 'browser is current');
		msos.config.browser.current = true;
        return;
    }

    msos.console.warn(temp_txt + 'browser does not support: ' + failed.join(', ') + ' -> for doctype ' + msos.config.doctype);
    if (msos.config.doctype === 'xhtml5' && failed[2] === 'document.write') {
		msos.config.browser.current = true;
		return;
	}

    msos.console.error(temp_txt + 'browser is not current');
    msos.config.browser.current = false;
};

msos.browser_touch = function () {
    "use strict";

    var temp_tch = 'msos.browser_touch -> ',
		test = '',
		test_div = document.createElement('div'),
		touch_avail = 0;

    // Is touch capability showing up?
    for (test in msos.config.touch) {
		if (msos.config.touch[test] === true)	{ touch_avail += 1; }
		else									{ touch_avail -= 1; }
    }

    // Try creating or adding an event
    try {
		document.createEvent("TouchEvent");
		touch_avail += 1;
    } catch (e) {
		touch_avail -= 1;
      }

    if ("ontouchstart" in test_div) {
		touch_avail += 1;
    } else {
		test_div.setAttribute("ontouchstart", 'return;');
		touch_avail += (typeof test_div.ontouchstart === 'function') ? 1 : -1;
      }

    test_div = null;

    if (touch_avail > 0) { msos.config.browser.touch = true; }

    msos.console.debug(temp_tch + 'touch is ' + (msos.config.browser.touch ? '' : 'not') + ' available, ref. (' + String(touch_avail) + ')');
};

msos.browser_mobile = function () {
    "use strict";

    var temp_mbl = 'msos.browser_mobile -> ',
		device = '',
		scrn_px = 0,
		flag = [];

    // Screen width (available)
    if (!msos.var_is_empty(screen.height) && !msos.var_is_empty(screen.width)) {
		scrn_px = (screen.height > screen.width) ? screen.height : screen.width;
    }

    // Probably mobile
    if (scrn_px && scrn_px < 481)	{ flag.push('screen'); }
    if (msos.config.browser.touch)	{ flag.push('touch'); }

    // Most likely
    if (msos.config.orientation)		{ flag.push('orientation'); }
    if (msos.config.orientation_change)	{ flag.push('orientation_change'); }
    if (msos.config.pixel_ratio > 1)	{ flag.push('pixel_ratio'); }

    if (flag.length > 2) {
		msos.config.browser.mobile = true;
		msos.config.mobile = true;
    }

    msos.console.debug(temp_mbl + 'browser is ' + (msos.config.browser.mobile ? 'mobile' : 'not mobile') + (flag.length > 0 ? ', flag(s): ' + flag.join(', ') : ''));
    
    if (msos.config.query.mobile === true
     || msos.config.query.mobile === false) {
		if (msos.config.browser.mobile !== msos.config.query.mobile) {
			msos.console.debug(temp_mbl + 'force mobile setting: ' + msos.config.query.mobile);
		}
		msos.config.mobile = msos.config.query.mobile ? true : false;
    }
};

msos.browser_advanced = function () {
    "use strict";

    var temp_txt = 'msos.browser_advanced -> ',
		temp_body = document.createElement('body'),
		body_css = temp_body.style,
		failed = [],
		vendors = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'],
		prop_exists = null,
		socket_exists = null;
    
    // From Modernizr.js
    prop_exists = function (prop) {
		var uc_prop = prop.charAt(0).toUpperCase() + prop.substr(1),
			props = (prop + ' ' + vendors.join(uc_prop + ' ') + uc_prop).split(' '),
			v = '';
	
		for (v in props) {
			if (body_css[v] !== undefined) { return true; }
		}
		failed.push(prop);
		return false;
    };

    msos.config.css_pseudoelement	= (!!prop_exists('content'));
    msos.config.boxshadow			= (!!prop_exists('boxShadow') && !window.blackberry);
    msos.config.transform			= (!!prop_exists('Transform'));

    socket_exists = function () {
		var i = 0;

        for (i = 0; i < vendors.length; i += 1) {
			if (window[vendors[i] + 'WebSocket'] ) {
				return true;
			}
        }
        return ('WebSocket' in window);
    };

    msos.config.websocket = socket_exists();

    if (!msos.config.scrolltop) { failed.push('scrollTop'); }

	// Dump temp_body
	temp_body = null;

    if (failed[0]) {
		msos.console.debug(temp_txt + 'browser is not advanced, missing: ' + failed.join(' '));
		msos.config.browser.advanced = false;
		return false;
    }
    msos.console.debug(temp_txt + 'browser is advanced.');
    msos.config.browser.advanced = true;
    return true;
};

msos.browser_editable = function () {
    "use strict";

    if (!(document.designMode || msos.body.contentEditable))	{ msos.config.browser.editable = false; return; }
    if (document.execCommand === undefined)						{ msos.config.browser.editable = false; return; }

    msos.console.debug('msos.browser_editable -> browser supports content editing');
    msos.config.browser.editable = true;
};

// Don't run before 'body' is loaded, see 'msos.run_onload'
msos.browser_direction = function () {
    "use strict";

    var browser_dir = '',
		build_test = null;

    build_test = function () {
		var container = document.createElement("p"),
			span = document.createElement("span"),
			direction = '';
	
		container.style.margin =  "0 0 0 0";
		container.style.padding = "0 0 0 0";
		container.style.textAlign = "";
		
		span.innerHTML = "X";
		
		container.appendChild(span);
		document.body.appendChild(container);
		
		direction = span.offsetLeft < (container.offsetWidth - (span.offsetLeft + span.offsetWidth)) ? "ltr" : "rtl";
		msos.body.removeChild(container);
	
		if (msos.config.verbose) { msos.console.debug('msos.browser_direction -> by build_test: ' + direction); }
		return direction;
    };

    browser_dir = (msos.body.dir || document.documentElement.dir || build_test() || 'ltr').toLowerCase();
    msos.config.browser.direction = browser_dir;
};

msos.browser_preloading = function () {
	"use strict";

	var script_pre = msos.config.script_preload,
		script_elm = document.createElement("script"),
		dua = navigator.userAgent;

	script_pre.async = 'async' in script_elm ? true : false;
	script_pre.defer = 'defer' in script_elm ? true : false;

	script_pre.explicit  = typeof script_elm.preload === "boolean" ? true : false;
	script_pre.available = script_pre.explicit ? true : (script_elm.readyState && script_elm.readyState === "uninitialized") ? true : false;
	script_pre.ordered   = (!script_pre.available && script_elm.async === true) ? true : false;
	script_pre.xhr_cache = (script_pre.available || (!script_pre.ordered && !(dua.indexOf("Opera") !== -1) && !(dua.indexOf("Gecko") !== -1))) ? true : false;

	script_elm = null;
};

msos.get_head = function (win) {
    "use strict";

    var d = win.document,
		de = d.documentElement,
		hd = d.head || d.getElementsByTagName('head')[0];

    if (!hd) {
		hd = d.createElement('head');
		de.insertBefore(hd, de.firstChild);
    }
    return hd;
};

msos.create_node = function (tag, atts_obj, win) {
    "use strict";

    // Allow creating element in another window
    if (!win) { win = window; }

    var elem = win.document.createElement(tag),
		at = '';

    if (msos.config.verbose) {
		msos.console.debug('msos.create_node -> called for: ' + tag, atts_obj);
    }

    for (at in atts_obj) {
		elem.setAttribute(at, atts_obj[at]);
    }
    return elem;
};

msos.loader = function (win) {
    "use strict";

    var temp_mod = 'msos.loader',
		ld_obj = this,
		file = msos.purl().attr('file'),
		i = 0;

    if (!win)		{ win = window; }		// Default is parent
    if (!win.msos)	{ win.msos = {}; }		// Popup might not have msos defined
    if (!win.name)	{ win.name = file.replace(/[^0-9a-zA-Z]/g, '_') || 'base_win'; }

    // Initiate 'dynamic_files' tracking
    if (!win.msos.registered_files) {
		win.msos.registered_files = { js : {}, css : {}, ico : {}, ajax: {} };
    }

    msos.console.debug(temp_mod + " -> start for window: " + win.name);

    // Get document head element
    this.doc_head = msos.get_head(win);
    this.toggle_css = [];
    this.delay_css = 0;
	this.deferred_array = [];
	this.deferred_done = true;

	this.add_resource_onload = [];

    // Load the resource
    this.load = function (name, url, type, attribs) {
		var base = url.split('?')[0],
			ext = base.substr(base.lastIndexOf('.') + 1),
			pattern = /^js|css|ico$/,
			lo = ' - load -> ',
			load_resource_func = null;

		if (msos.config.verbose) {
			msos.console.debug(temp_mod + lo + 'start.');
		}

		// Check for attribs object
		attribs = attribs || {};

		// If file type passed in use it, otherwise determine from url
		if (!type) { type = ext || 'na'; }

		if (!pattern.test(type)) {
			msos.console.error(temp_mod + lo + 'missing or invalid: ' + type);
			return;
		}

		if (ld_obj.check(name, url, type)) {

			msos.console.debug(temp_mod + lo + 'already loaded: ' + name + ', url: ' + url);

		} else {

			load_resource_func = function () { ld_obj.resource(name, url, type, attribs); };

			if (attribs.defer
			 && attribs.defer === 'defer') {

				if (msos.config.script_preload.ordered) {

					load_resource_func();
					msos.console.debug(temp_mod + lo + 'browser deferred file: ' + url);

				} else {

					if (ld_obj.deferred_done === true) {
						ld_obj.deferred_done = false;
						load_resource_func();	// Load first one directly
					} else {
						// Load next at callback. See ld_obj.resource -> on_resource_load()
						ld_obj.deferred_array.push(load_resource_func);
					}

					msos.console.debug(temp_mod + lo + 'deferred file: ' + url + ', queue: ' + ld_obj.deferred_array.length);
				}

			} else if (type === 'css') {

				// Some browsers (especially Chrome) need a small delay for multiple css loads
				setTimeout(load_resource_func, ld_obj.delay_css);
				ld_obj.delay_css += 5;

				msos.console.debug(temp_mod + lo + 'css file: ' + url + ', delay: ' + ld_obj.delay_css);

			} else {

				load_resource_func();
				msos.console.debug(temp_mod + lo + 'file: ' + url);
			}
		}

		if (msos.config.verbose) {
			msos.console.debug(temp_mod + lo + 'done!');
		}
    };

    this.check = function (file_name, file_url, file_type) {
		var toggle = ld_obj.toggle_css,
			flag_loaded = false,
			ld = ' - check -> ';

		msos.console.debug(temp_mod + ld + 'start.');

		// Important: See the popwin.js for 'win.msos.registered_files' clearing
		if (win.msos.registered_files[file_type]
		 && win.msos.registered_files[file_type][file_name]) {
			flag_loaded = true;
		}

		// Allow only one css file to be 'active', if part of a toggle 'group' such as size
		if (file_type === 'css' && toggle.length > 0) {
			// Turn any already loaded css (per type spec ld_obj.toggle_css) off
			for (i = 0; i < toggle.length; i += 1) {
				if (win.msos.registered_files.css[toggle[i]]) {
					win.msos.registered_files.css[toggle[i]].disabled = true;
				}
			}
			// If already loaded, turn this one back on
			if (win.msos.registered_files.css[file_name]) {
				win.msos.registered_files.css[file_name].disabled = false;
				msos.console.debug(temp_mod + ld + 'set active: ' + file_url);
			}

			// Run any included onload functions
			for (i = 0; i < ld_obj.add_resource_onload.length; i += 1) {
				ld_obj.add_resource_onload[i]();
			}
		}

		msos.console.debug(temp_mod + ld + 'done, already loaded (t/f): ' + (flag_loaded ? 'true' : 'false') + ' for ' + file_name);
		return flag_loaded;
    };

    this.init_create_node = function (name, url, type, attribs) {
		var node = null,
			icn = ' - init_create_node -> ',
			node_attrs = {},
			ats = '';

		if (msos.config.verbose) {
			msos.console.debug(temp_mod + icn + 'start.');
		}

		// Force new copies (for testing)
		if (msos.config.cache === false) {
			url += ((/\?.*$/.test(url) ? "&_" : "?_") + ~~ (Math.random() * 1E9) + "=");
		}

		// Define our typical node attributes by type (for convenience)
		if			(type === 'js' ) {
			node_attrs = { id: name, type: 'text/javascript', src: url, charset: 'utf-8' };
		} else if	(type === 'css') {
			node_attrs = { id: name, type: 'text/css',		rel: 'stylesheet',		href: url,	media: 'all' };
		} else if	(type === 'ico') {
			node_attrs = { id: name, type: 'image/x-icon',	rel: 'shortcut icon',	href: url };
		  }

		if (attribs !== undefined && typeof attribs === 'object') {
			for (ats in attribs) {
				node_attrs[ats] = attribs[ats];
			}
		}

		// Important: You have to create a node in the variable 'win' window context in order
		// for IE to be able to use it (see 'this.resource'). FF, Opera and Chrome don't care.

		if			(type === 'js' ) {
			node = msos.create_node('script',	node_attrs, win);
			if (attribs.defer === 'defer')	{ node.async = false; }		// Browsers lacking "real defered" order retention
			else							{ node.async = true;  }		// Browsers conforming to "defered" order retention
		} else if	(type === 'css') {
			node = msos.create_node('link',		node_attrs, win);
		} else if	(type === 'ico') {
			node = msos.create_node('link',		node_attrs, win);
		  }

		node.msos_load_state = 'loading';

		if (type === 'js' && msos.config.script_onerror) {
			node.onerror = function (e) { msos.console.error(temp_mod + ' -> failed for: ' + name, e); };
		}

		if (msos.config.verbose) {
			msos.console.debug(temp_mod + icn + 'done!');
		}
		return node;
    };

    this.resource = function (file_name, file_url, file_type, file_atts) {
		var node = ld_obj.init_create_node(file_name, file_url, file_type, file_atts) || null,
			ls = ' - resource -> ',
			on_resource_load = function () {
				var i = 0,
					shifted;

				if (this.msos_load_state !== 'loaded' && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' || this.readyState === 'uninitialized')) {

					if (msos.config.verbose) {
						msos.console.debug(temp_mod + ls + 'loaded, name: ' + this.id);
					}

					this.msos_load_state = 'loaded';

					for (i = 0; i < ld_obj.add_resource_onload.length; i += 1) {
						ld_obj.add_resource_onload[i]();
					}

					// Check for (and run) next deferred script
					if (this.getAttribute('defer') === 'defer') {
						if (ld_obj.deferred_array.length) {
							shifted = ld_obj.deferred_array.shift();
							shifted();
						} else {
							ld_obj.deferred_done = true;
						}
					}

					this.onload = this.onreadystatechange = null;
				}

				return true;
			};

		msos.console.debug(temp_mod + ls + 'start, type: ' + file_type + ', name: ' + file_name);

		if (node !== null) {

			// Run something when node loads...
			node.onload = node.onreadystatechange = on_resource_load;

			// Add the new node to the page head...
			ld_obj.doc_head.appendChild(node);

			// Store our new dynamic file node
			win.msos.registered_files[file_type][file_name] = node;

			msos.console.debug(temp_mod + ls + 'done!');
		}
    };

    msos.console.debug(temp_mod + " -> done!");
};

msos.dom_tracking = function (method) {
	"use strict";

	var temp_dt = 'msos.dom_tracking';

	if (msos.dom[method]) {
		msos.console.error(temp_dt + ' -> failed, jQuery.fn.' + method + ' already registered.');
		return;
	}

	msos.dom[method] = [];

    var jq_fn_org = jQuery.fn[method];

    jQuery.fn[method]= function () {

		var temp_fn = temp_dt + ' - ' + method,
			jq_new = [];

		msos.console.debug(temp_fn + ' -> start.');

		jQuery.each(
			this,
			function (index, value) {
				var trk = msos.dom[method],
					tag = value.tagName,
					id = value.id || 'trk_' + tag.toLowerCase() + '_' + (trk.length + 1),
					$el = jQuery(value);

				if (!value.id) { value.id = id; }

				// Skip one's we have already done
				if (trk.indexOf(id) === -1) {
					trk.push(id);
					jq_new.push(value);
					$el.data(id, true);
					if (msos.config.verbose) {
						msos.console.debug(temp_fn + ' -> skipped: ' + id);
					}
				// But redo element for new instance w/ same id
				} else if ($el.data(id) !== true) {
					jq_new.push(value);
					$el.data(id, true);
					msos.console.debug(temp_fn + ' -> new instance: ' + id);
				}
			}
		);

		msos.console.debug(temp_fn + ' -> done!');

        return (jq_fn_org.apply(jQuery(jq_new), arguments));
    };
};


// --------------------------
// Setup MSOS Environment
// --------------------------
msos.set_environment = function () {
    "use strict";

    var set_txt = 'msos.set_environment -> ',
		c_obj = msos.config.cookie;

    msos.console.debug(set_txt + 'start');

	// Get site user cookie info
	c_obj.site_pref.value = msos.cookie(c_obj.site_pref.name);
	c_obj.site_i18n.value = msos.cookie(c_obj.site_i18n.name);
	c_obj.site_bdwd.value = msos.cookie(c_obj.site_bdwd.name);

    // Get some browser capabilities
    msos.browser_current();
    msos.browser_advanced();
    msos.browser_editable();
    msos.browser_orientation();
    msos.browser_touch();
    msos.browser_mobile();
	msos.browser_preloading();

	if (msos.config.verbose) {
		msos.console.debug(set_txt + 'done, browser env: ', msos.config.browser);
	} else {
		msos.console.debug(set_txt + 'done!');
	}
};

msos.calc_display_size = function () {
    "use strict";

    var view = '',
		view_size = msos.config.view_port,
		view_width = 0,
		scrn_width = 0,
		scrn_px = 0,
		size = '',
		adj_width = 0;

    // Screen width (as displayed)
    if (!msos.var_is_empty(view_size.width) && view_size.width !== 0) { view_width = view_size.width; }
    if (!msos.var_is_empty(   screen.width) &&	  screen.width !== 0) { scrn_width =    screen.width; }

    scrn_px = view_width || scrn_width;

    for (size in msos.config.size_wide) {
		// Allow larger size at 97% of available viewport width
		adj_width = msos.config.size_wide[size] - (msos.config.size_wide[size] * 0.03);
		if (scrn_px > adj_width) {
			if (view) { if (msos.config.size_wide[view] < msos.config.size_wide[size])	{ view = size; } }
			else																		{ view = size; }
		}
    }

    msos.console.debug('msos.calc_display_size -> calculated: ' + view + ', viewport w: ' + view_size.width + ', screen w: ' + screen.width);
    return view;
};

msos.get_display_size = function () {
    "use strict";

    var temp_dis = 'msos.get_display_size -> ',
		cookie_value = msos.config.cookie.site_pref.value,
		browser_layout  = msos.config.view_orientation.layout,
		cookie_array = [],
		display_size = '';

    msos.console.debug(temp_dis + 'start.');

    if (cookie_value) {
		cookie_array = cookie_value.split(':');
		if (browser_layout === 'portrait')	{ display_size = cookie_array[0] || ''; }
		else								{ display_size = cookie_array[1] || ''; }
		msos.console.debug(temp_dis + 'cookie detected: ' + cookie_value);
    } else {
		// set cookie to something initially
		cookie_array[0] = 'unknown';
		cookie_array[1] = 'unknown';
      }

    // Always update this
    cookie_array[2] = browser_layout;

    // This layout not set yet, so set to undef and get_size will kick in
    if (display_size === 'unknown') { display_size = ''; }

    msos.config.size = msos.config.query.size || display_size || msos.calc_display_size() || msos.config.size;

    if (msos.config.query.size) {
		// Warn that onorientationchange or onresize display change may have been overridden by an input value
		msos.console.info(temp_dis + 'size set by input!');
    }

    if (browser_layout === 'portrait')	{ cookie_array[0] = msos.config.size; }
    else								{ cookie_array[1] = msos.config.size; }

    cookie_value = cookie_array.join(':');

	// Reset site user cookie info...
	msos.config.cookie.site_pref.value = cookie_value;

    msos.console.debug(temp_dis + 'done: ' + msos.config.size + ', for ' + browser_layout);
};


// --------------------------
// Bulk External CSS Loading
// --------------------------
msos.css_loader = function (url_array, win) {
	"use strict";

	var temp_cl = 'msos.css_loader -> ',
		loader_obj = null,
		css_name = '',
		css_url = '',
		i = 0;

	msos.console.debug(temp_cl + 'start.');

	// One loader object retains load order 
	loader_obj = new msos.loader(win);

	for (i = 0; i < url_array.length; i += 1) {
		css_url = url_array[i];
		css_name = msos.generate_url_name(css_url);
		loader_obj.load(css_name, css_url, 'css');
	}

	msos.console.debug(temp_cl + 'done!');
};

// --------------------------
// Bulk External Script Loading
// --------------------------
msos.script_loader = function (url_array) {
	"use strict";

	var temp_esl = 'msos.script_loader -> ',
		loader_obj = null,
		script_name = '',
		script_url = '',
		i = 0;

	msos.console.debug(temp_esl + 'start.');

	// Get a new loader object
	loader_obj = new msos.loader();

	for (i = 0; i < url_array.length; i += 1) {
		script_url = url_array[i];
		script_name = msos.generate_url_name(script_url);
		loader_obj.load(script_name, script_url, 'js', { defer: 'defer' });
	}

	msos.console.debug(temp_esl + 'done!');
};


// --------------------------
// Establish base MSOS environment
// --------------------------
msos.set_environment();
msos.set_locale();
msos.get_display_size();


msos.console.info('msos/base -> done!');
msos.console.timeEnd('base');