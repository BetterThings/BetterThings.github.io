// Copyright Notice:
//					core.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile base MobileSiteOS™ framework functions

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false
*/

msos.version = new msos.set_version(14, 5, 17);

msos.console.info('msos/core -> start, ' + msos.version);
msos.console.time('core');


// *******************************************
// MSOS Functions using jQuery, underscore.js
// *******************************************

msos.clear_storage = function () {
	"use strict";

	var temp_cs = 'msos.clear_storage -> ';

	msos.console.debug(temp_cs + 'start.');

	// Clear all key/values
	if (Modernizr.sessionstorage)	{ sessionStorage.clear(); }

	// Clear all key/values
	if (Modernizr.localstorage)		{ localStorage.clear(); }

	msos.console.debug(temp_cs + 'done!');
};

// Cleared early before something starts using storage
if (msos.config.clear_storage) { msos.clear_storage(); }


msos.bandwidth_env = function () {
	"use strict";

	var temp_be = 'msos.bandwidth_env -> ',
		bdwd_name	= msos.config.storage.sessionstorage.site_bdwd.name,
		bdwd_cookie = msos.config.cookie.site_bdwd.value || 'na',
		bdwd_session = '',
		sess_txt = '';

	msos.console.debug(temp_be + 'start, sessionStorage: ' + (Modernizr.sessionstorage ? 'enabled' : 'disabled') + ', cookies: ' + (navigator.cookieEnabled ? 'enabled' : 'disabled'));

	if (Modernizr.sessionstorage && navigator.cookieEnabled) {

		bdwd_session = sessionStorage.getItem(bdwd_name) || 'na';

		// No cookie and no session data, new day and new session
		if (bdwd_cookie === 'na' && bdwd_session === 'na') {
			sess_txt += ', new user!';
		// A cookie exists, but a session doesn't...so a same day return.
		// Turn caching off until sessionStorage for bandwidth exists (force updating)
		} else if (bdwd_session === 'na') {
			msos.config.cache = false;
			sess_txt += ', return user!';
		// Normal continuing user session 
		} else {
			sess_txt += ', continuing user!';
		}
	}

	msos.console.debug(temp_be + 'done, ajax caching set: ' + (msos.config.cache ? 'true' : 'false') + sess_txt);
};

// Run immediately...
msos.bandwidth_env();


msos.byid = function (id, in_doc) {
    "use strict";

    var temp_byi = 'msos.byid -> ',
		use_doc = null,
		dom_node = null;

    if (in_doc)	{ use_doc = in_doc; }
    else		{ use_doc = window.document; }

    if (typeof id !== "string") {
		msos.console.error(temp_byi + 'input not an id string!');
		return null;
    }

    dom_node = jQuery('#' + id, use_doc)[0];

    if (_.isElement(dom_node)) {
		return dom_node;
    }

	msos.console.warn(temp_byi + 'na: ' + id);
	return null;
};

msos.run_onresize = function () {
    "use strict";

    var temp_onr = 'msos.run_onresize -> ',
		port_width = msos.config.view_port.width,	// save original width
		m = 0;

    // Get the viewport size (which resets msos.config.view_port)
    msos.get_viewport(window);

	msos.console.debug(temp_onr + 'start.');

	// Run all window onresize functions now
	for (m = 0; m < msos.onresize_functions.length; m += 1) {
		msos.onresize_functions[m]();
	}

	msos.console.debug(temp_onr + 'done, orig. w: ' + port_width + ', new w: ' + msos.config.view_port.width + ', for: ' + m + ' functions.');
};

msos.run_onorientationchange = function () {
    "use strict";

    var temp_ono = 'msos.run_onorientationchange -> ',
		port_width = msos.config.view_port.width,	// save original width
		previous = msos.config.view_orientation,	// previous orientation
		m = 0;

	msos.console.debug(temp_ono + 'start, new: ' + window.orientation + ', pre: ' + previous.numeric);

	// Quick check for orientation change
	if (window.orientation === previous.numeric) {

		msos.console.debug(temp_ono + 'done, no change.');
		return;
	}

	// Hide the page contents
	jQuery('#body').fadeOut('fast');

	// if the new orientation is 'portrait' (ie: from 'landscape')
	if (window.orientation === 0 || window.orientation === 180) {
		// Immediately make the body height at least the full 'landscape' width (to prevent white-out)
		jQuery(msos.body).css('min-height', port_width + 'px');
	}

	// Reset 'view_orientation' variables
	msos.browser_orientation();

	// Set display accordingly
	msos.get_display_size();

	// Run all window onorientationchange functions now
	for (m = 0; m < msos.onorientationchange_functions.length; m += 1) {
		msos.onorientationchange_functions[m]();
	}

	// Let things settle
	setTimeout(
		function () {
			jQuery('#body').fadeIn('slow');
		},
		250
	);

	msos.console.debug(temp_ono + 'done, orig. w: ' + port_width + ', new w: ' + msos.config.view_port.width + ', for: ' + m + ' functions.');
};


// *******************************************
// MSOS Module Loading Functions
// *******************************************

msos.provide = function (register_module) {
    "use strict";

    var temp_p = 'msos.provide -> ',
		mod_id = register_module.replace(/\./g, '_');

    if (msos.registered_modules[mod_id]) {
		msos.console.warn(temp_p + 'already registered: ' + register_module);
    } else {
		msos.registered_modules[mod_id] = true;
    }

	msos.console.debug(temp_p + 'executing: ' + register_module);
};

msos.require = function (module_name, add_onsuccess_func) {
    "use strict";

    var req_text = 'msos.require -> ',
		module_id = '',
		name_array = module_name.split("."),
		module_base = name_array[0],
		did_module_load = null,
		on_success = null,
		on_complete = null,
		uri = '';

	// Only allow a-z, 0-9, period, dash in module names
	if (!/^[0-9a-zA-Z.-]+$/.test(module_name)) {
		msos.console.error(req_text + 'name not allowed: ' + module_name);
		return;
	}

	module_id = module_name.replace(/\./g, '_');

    // Already loaded or loading, just go on...
    if (typeof msos.registered_modules[module_id] === 'boolean') {
		if (msos.registered_modules[module_id] === true) {
			if (_.isFunction(add_onsuccess_func)) { add_onsuccess_func(); }
		}
		return;
	}

    msos.registered_modules[module_id] = false;

    did_module_load = function () {
		if (msos.registered_modules[module_id]) {
			msos.console.debug(req_text + 'success: '	+ module_name);
		} else {
			msos.console.error(req_text + 'failed: '	+ module_name);
		  }
    };

    if (!msos.registered_folders[module_base]) {
		msos.console.debug(req_text + 'auto resolving module base: ' + module_base);
		msos.registered_folders[module_base] = msos.resource_url(module_base, '');
    }

    // Define new module objects
	msos.gen_namespace(module_name);

    // Special case: A 'msos.i18n.xxx' 'ajax' request is handled in msos.i18n
    if (name_array[0] === 'msos' && name_array[1] === 'i18n') {
		if (name_array.length > 2) {
			if (msos.config.verbose) {
				msos.console.debug(req_text + 'i18n request for: ' + module_name);
			}
			if (typeof msos.registered_modules.msos_i18n !== 'boolean') {
				// Set back to just 'msos.i18n' for std. 'require'
				name_array.splice(2);
				module_name = name_array.join('.');
				module_id   = name_array.join('_');
				// Register 'msos.i18n' as required (since it didn't above)
				msos.registered_modules.msos_i18n = false;
			} else {
				// msos.i18n already in 'require' queue
				return;
			  }
		}
    }

    // Bump the module base name
    name_array.shift();

    // Convert to path
    uri = msos.registered_folders[module_base] + name_array.join("/") + '.js';

    msos.require_queue += 1;

    if (msos.config.verbose) {
		msos.console.debug(req_text + 'request for module: ' + uri + ', queue: ' + msos.require_queue);
    }

    /* Available inputs: data, status, xhr */
    on_success = function () {
		msos.console.debug(req_text + 'found: ' + module_name + ', queue: ' + msos.require_queue);

		msos.registered_files.ajax[module_name] = uri;

		if (_.isFunction(add_onsuccess_func)) { add_onsuccess_func(); }
    };

    on_complete = function () {
		msos.console.debug(req_text + 'completed: ' +  module_name + ', queue: ' + msos.require_queue);

		// Now verify is executable
		setTimeout(did_module_load, 100);

		// Request completed, so de-increment the queue
		msos.require_queue -= 1;
    };

    msos.ajax_request(uri, "script", on_success, on_complete);
};

msos.template = function (template_name, add_onsuccess_func) {
    "use strict";

    var req_text = 'msos.template -> ',
		template_id = template_name.replace(/\./g, '_'),
		name_array = template_name.split("."),
		template_base = name_array[0],
		tmpl_obj = null,
		on_success = null,
		on_complete = null,
		uri = '';

	// Only allow a-z, 0-9, period, dash in module names
	if (!/^[0-9a-zA-Z.-]+$/.test(template_name)) {
		msos.console.error(req_text + 'name not allowed: ' + template_name);
		return;
	}

	tmpl_obj = msos.gen_namespace(template_name);

    // Already loaded or loading, just go on...
    if (typeof msos.registered_templates[template_id] === 'boolean') {
		if (msos.registered_templates[template_id] === true) {
			if (_.isFunction(add_onsuccess_func)) { add_onsuccess_func(tmpl_obj); }
		}
		return;
	}

    msos.registered_templates[template_id] = false;

    if (!msos.registered_folders[template_base]) {
		msos.console.debug(req_text + 'auto resolving template base: ' + template_base);
		msos.registered_folders[template_base] = msos.resource_url(template_base, '');
    }

    // Bump the module base name
    name_array.shift();

    // Convert to path
    uri = msos.registered_folders[template_base] + name_array.join("/") + '.html';

    msos.require_queue += 1;

    if (msos.config.verbose) {
		msos.console.debug(req_text + 'request for template: ' + uri + ', queue: ' + msos.require_queue);
    }

    // Available inputs: data, status, xhr
    on_success = function (data) {
		// Now verify useful data
		if (typeof data === 'string' && data.length > 0) {
			// Load template html into the base object
			tmpl_obj.text = data;
			tmpl_obj.name = template_id;
			// Register loaded
			msos.registered_templates[template_id] = true;
			msos.console.debug(req_text + 'found: ' + template_name + ', queue: ' + msos.require_queue);

			if (_.isFunction(add_onsuccess_func)) { add_onsuccess_func(tmpl_obj); }

		} else {
			tmpl_obj.text = '';
			msos.console.error(req_text + 'failed, no data: ' + template_name + ', queue: ' + msos.require_queue);
		  }
    };

    on_complete = function () {
		msos.console.debug(req_text + 'completed: ' +  template_name + ', queue: ' + msos.require_queue);
		// Request completed, so de-increment the queue
		msos.require_queue -= 1;
    };

    msos.ajax_request(uri, "html", on_success, on_complete);
};

msos.ajax_request = function (ajax_uri, data_type, on_success_func, on_complete_func) {
    "use strict";

    var req_text = 'msos.ajax_request -> ',
		ajax_name = msos.generate_url_name(ajax_uri),
		st = msos.new_time(),
		on_success_request  = function (data, status, xhr) {

			// Track bandwidth for each request
			if (typeof data === 'string' && data.length > 0) {
				var et = msos.new_time(),
					sec = (et - st) / 1e3,
					bits = data.length * 8,
					bps = Math.round(bits / sec),
					kbps = parseInt(bps / 1024, 10);

				msos.ajax_loading_kbps[ajax_name] = kbps;
			}

			if (msos.config.verbose) {
				msos.console.debug(req_text + 'status: ' + status + ', data length: ' + (data.length || 0));
			}

			if (_.isFunction(on_success_func)) { on_success_func(data, status, xhr); }
		},
		on_complete_request = function (xhr, status) {
			var stat_msg = xhr.status + ', status: ' + status;

			if (msos.config.verbose) {
				msos.console.debug(req_text + 'completed: ' + stat_msg);
			}
			if (_.isFunction(on_complete_func)) { on_complete_func(xhr, status); }
		};

    jQuery.ajax(
		{
			url: ajax_uri,
			dataType: data_type,
			cache: msos.config.cache,
			success: on_success_request,
			error: msos.ajax_error,
			complete: on_complete_request
		}
    );
};

msos.ajax_error = function (xhr, status, error) {
    "use strict";

    var err_msg = status + ': ' + error,
		use_msg = '',
		i18n = {};

    // Timing of i18n common loading is a factor
    if (msos.i18n
     && msos.i18n.common
     && msos.i18n.common.bundle) {
		i18n = msos.i18n.common.bundle;
    }

    switch (xhr.status) {
		case 200: use_msg = i18n.internal		|| 'Internal error';		break;
		case 404: use_msg = i18n.input			|| 'Input error';			break;
		case 407: use_msg = i18n.authentication || 'Authentication error';	break;
		case 500: use_msg = i18n.server			|| 'Server error';			break;
		case 504: use_msg = i18n.timeout		|| 'Timeout error';			break;
		default:  use_msg = i18n.unknown		|| 'Unknown error';
    }

	use_msg += ' (' + (xhr.status || 'no status') + ')';

	msos.notify.error(error, use_msg);

    if (msos.require_queue > 0) { use_msg += ', ref. req. queue ' + msos.require_queue; }
    if (msos.i18n_queue > 0)	{ use_msg += ', ref. i18n queue ' + msos.i18n_queue; }

    use_msg = 'msos.ajax_error -> failed: ' + err_msg + ', xhr: ' + use_msg;

    if (msos.config.verbose)	{ msos.console.error(use_msg, xhr); }
    else						{ msos.console.error(use_msg); }
};

msos.hide_mobile_url = function () {
	"use strict";

	// Order with msos.notify is important. We don't want scrolling and DOM manipulations to interact.
	window.scrollTo(0, 1);

	var scrollTop =
			window.pageYOffset
		|| (window.document.compatMode === "CSS1Compat" && window.document.documentElement.scrollTop)
		||  window.document.body.scrollTop
		||  0;

	msos.console.debug('msos.hide_mobile_url -> called, scrollTop: ' + scrollTop);

	setTimeout(function () { window.scrollTo(0, scrollTop === 1 ? 0 : 1); }, 1);
};

msos.notify = {

	container: jQuery("<div id='notify_container'></div>"),

	add: function () {
		"use strict";

		var cont = msos.notify.container;

		// Add our container
		jQuery('body').append(cont);

		// Position using jquery.ui.position object
		cont.position(
			{
				of: window,
				my: 'center top+60',
				at: 'center top',
				collision: 'none'
			}
		);

		// Now fix it in place
		cont.css('position', 'fixed');
	},

	idx: 0,
	queue: [],

	run: function () {
		"use strict";

		var temp_rn = 'msos.notify.run -> ',
			self = msos.notify,
			next = self.queue[self.idx];

		if (_.isObject(next)) {

			msos.console.debug(temp_rn + 'prepend, idx: ' + self.idx + ', type: ' + next.type);

			// Prepend the notify element to our container
			self.container.prepend(next.note_el);

			// Add the specified display delay
			next.auto_delay = setTimeout(next.fade_out, next.delay);

			// Increment to next in queue, if any
			self.idx += 1;

		} else {

			msos.console.debug(temp_rn + 'clear, idx: ' + self.idx);

			// Or start over with a new queue
			self.idx = 0;
			self.queue = [];
		}
	},

	base: function (type, message, title, icon_html, delay) {
		"use strict";

		var temp_ntf = 'msos.notify.base -> ',
			self = msos.notify,
			curr = String(self.idx),
			base_obj = {
				type: type,
				delay: delay || 4000,		// default (minimum) is 4 sec.
				auto_delay: 0,
				icon_el: null,
				butt_el: jQuery("<button class='btn btn-danger btn-small fa fa-times'></button>"),
				note_el: jQuery("<div class='notify'></div>"),
				disp_el: jQuery("<div class='notify_display'></div>"),
				titl_el: jQuery("<div class='notify_title'></div>"),
				 msg_el: jQuery("<div class='notify_msg'></div>")
			};

		msos.console.debug(temp_ntf + 'start, idx: ' + self.idx + ', type: ' + type);

		// Append close button
		base_obj.disp_el.append(base_obj.butt_el);

		if (icon_html) {
			base_obj.icon_el = jQuery(icon_html);
			base_obj.note_el.append(base_obj.icon_el);
		}

		if (title) {
			base_obj.titl_el.append(document.createTextNode(title));
			base_obj.disp_el.append(base_obj.titl_el);
		}

		if (message) {
			base_obj.msg_el.append(document.createTextNode(message));
			base_obj.disp_el.append(base_obj.msg_el);
		}

		// Append new message
		base_obj.note_el.append(base_obj.disp_el);

		base_obj.fade_out = function () {
			if (base_obj.auto_delay === 0) {
				self.idx += 1;	// Skip (since it was called to fade before it displayed)
			} else {
				clearTimeout(base_obj.auto_delay);
				base_obj.note_el.fadeOut(
					'slow',
					function () {
						msos.console.debug(temp_ntf + 'fade_out, idx: ' + curr + ', type: ' + type);
						base_obj.note_el.remove();
						msos.notify.run();
					}
				);
			}
		};

		base_obj.butt_el.on(
			"click",
			base_obj.fade_out
		);

		if (self.queue.length === 0) {
			self.queue.push(base_obj);
			self.run();
		} else {
			self.queue.push(base_obj);
		}

		msos.console.debug(temp_ntf + 'done!');
		return base_obj;
	},

	info: function (message, title) {
		"use strict";
		var obj = new msos.notify.base(
			'info',
			message,
			title,
			'<i class="fa fa-info-circle fa-2x info">'
		);
		return obj;
	},

	warning: function (message, title) {
		"use strict";
		var obj = new msos.notify.base(
			'warning',
			message,
			title,
			'<i class="fa fa-warning fa-2x warning">',
			6000
		);
		return obj;
	},

	error: function (message, title) {
		"use strict";
		var obj = new msos.notify.base(
			'error',
			message,
			title,
			'<i class="fa fa-ban fa-2x error">',
			8000
		);
		return obj;
	},

	success: function (message, title) {
		"use strict";
		var obj = new msos.notify.base(
			'success',
			message,
			title,
			'<i class="fa fa-check-circle fa-2x success">'
		);
		return obj;
	},

	loading: function (message, title) {
		"use strict";
		var obj = new msos.notify.base(
			'loading',
			message,
			title,
			'<i class="fa fa-spinner fa-spin fa-2x loading">',
			10000
		);
		return obj;
	}
};

// Add error notification (Overwritten in msos.onerror for server notification)
window.onerror = function (msg, url, line, col, er) {
	"use strict";

	var error_txt = 'JavaScript Error!';

	msos.console.error('window.onerror -> fired, line: ' + line + ', url: ' + url + ', error: ' + msg, er);

	// Timing and availability of i18n common loading is a factor (so isolate)
	if (msos.i18n
	 && msos.i18n.common
	 && msos.i18n.common.bundle) {
		error_txt = msos.i18n.common.bundle.error || error_txt;
	}

	msos.notify.error(msg, error_txt);
	return true;
};

msos.check_deferred_scripts = function () {
    "use strict";

	var temp_cds = 'msos.check_deferred_scripts -> ',
		deferred_flag = true,
		deferred = msos.registered_files.js,
		deferred_attr = '',
		script = '';

	// Record the attempt to verify
	msos.require_deferred += 1;

	// Verify that all deferred scripts have loaded
	for (script in deferred) {
		deferred_attr = deferred[script].getAttribute('defer') || false;
		if (deferred_attr && deferred[script].msos_load_state !== 'loaded') {
			deferred_flag = false;
			msos.console.debug(temp_cds + 'still loading: ' + script + ', attemp: ' + msos.require_deferred);
		}
	}

	// Ten fails, so reload the page
	if (msos.require_deferred > 9) {
		if (msos.config.verbose) {
			prompt('A deferred script failed to load. Click OK to continue.');
		}
		setTimeout(function () { location.reload(); }, 100);
	} else {
		if (deferred_flag) {
			// Order is important!
			if (msos.config.mobile) { msos.hide_mobile_url(); }

			msos.notify.add();
			msos.run_intial();
			msos.run_onload();

		} else {
			setTimeout(msos.check_deferred_scripts, 100);
		}
	}
};

msos.check_resources = function () {
    "use strict";

    var temp_chk = 'msos.check_resources -> ',
		mod_id = '',
		count_module = 0,
		count_file = 0,
		scripts = document.getElementsByTagName("script") || [],
		src,
		i,
		i18n = {
			modules: 'module(s)',
			files: 'file(s)',
			load_error: 'Loading Error!',
			load_failed: 'failed to load.'
		},
		key = '',
		error_msg = '';

    // Check our ajax retrieved scripts for loading
    for (mod_id in msos.registered_modules) {
		if (!msos.registered_modules[mod_id]) {
			msos.console.error(temp_chk + 'module failed to load: ' + (mod_id.replace(/_/g, '.')));
			count_module += 1;
		}
    }

    // Check our document.write injected scripts for loading (Google API's, etc.)
    for (i = 0; i < scripts.length; i += 1) {
		if (scripts[i].readyState
		&& (scripts[i].readyState !== "loaded" || scripts[i].readyState !== "complete")) {
			src = scripts[i].getAttribute("src") || '';
			if (src) {
				msos.console.error(temp_chk + 'file failed to load: ' + src);
				count_file += 1;
			}
		}
    }

    if (count_module > 0 || count_file > 0) {
		// Timing of i18n common loading is a factor
		if (msos.i18n
		 && msos.i18n.common
		 && msos.i18n.common.bundle) {
			for (key in i18n) {
				if (msos.i18n.common.bundle[key]) {
					i18n[key] = msos.i18n.common.bundle[key];
				}
			}
		}

		if (count_module > 0) { error_msg += count_module + ' ' + i18n.modules; error_msg += count_file > 0 ? ', ' : ''; }
		if (count_file   > 0) { error_msg += count_file   + ' ' + i18n.files; }

		error_msg += ' ' + i18n.load_failed;

		msos.notify.error(error_msg, i18n.load_error);
    }
};

msos.set_bandwidth = function () {
    "use strict";

    var temp_sb = 'msos.set_bandwidth -> ',
		clear = '',
		cfg = msos.config,
		sessstr = cfg.storage.sessionstorage.site_bdwd,
		cookie_value = cfg.cookie.site_bdwd.value || 'na',
		ajx_ldg = msos.ajax_loading_kbps,	// loading speeds from ajax file calls
		ajx_ses = {},
		kbps = '',
		kbps_new = false,
		cnt = 0,
		sum = 0,
		avg = 0,
		i = 0;

	// This function does **not** provide a rigorous bandwidth value, but just
	// a reasonable "best guess" estimate. It is important to note that it
	// assumes reasonable server "caching" is employed. Ref. /htdocs/.htaccess

	if (cfg.clear_cookies) { clear  = ', cleared cookies'; }
	if (cfg.clear_storage) { clear += ', cleared storage'; }
	if (cfg.clear_cookies
	 && cfg.clear_storage) {
		// May still need to clear your browser's cache too! Clear cache and run same url again.
		msos.console.warn(temp_sb + 'simulated new user: browser cache cleared?');
	}

	if (cfg.verbose) {
		clear += ', request ajax bandwidth: ';
		msos.console.debug(temp_sb + 'start' + clear, ajx_ldg);
	} else {
		clear += '.';
		msos.console.debug(temp_sb + 'start' + clear);
	}

	// If sessionStorage, we can revise estimates as files upload the first time
	if (Modernizr.sessionstorage && navigator.cookieEnabled) {

		msos.console.debug(temp_sb + 'using sessionStorage!');

		// Get any previous values for kbps
		ajx_ses = sessionStorage.getItem(sessstr.name) ? JSON.parse(sessionStorage.getItem(sessstr.name)) : {};

		if (cfg.verbose) {
			msos.console.debug(temp_sb + 'sessionStorage bandwidth: ', ajx_ses);
		}

		// Determine new values...(for just loaded files, as others should come from cache)
		for (kbps in ajx_ldg) {
			ajx_ses[kbps] = ajx_ldg[kbps];
			kbps_new = true;
		}

		if (kbps_new) {

			msos.console.debug(temp_sb + 'new value(s) added!');

			for (kbps in ajx_ses) {
				sum += parseInt(ajx_ses[kbps], 10);
				cnt += 1;
			}

			avg = sum / cnt;

			// Now save all the values...
			sessstr.value = JSON.stringify(ajx_ses);
			sessionStorage.setItem(sessstr.name, sessstr.value);
			sessstr.set = true;

		} else {

			msos.console.debug(temp_sb + 'no new values, use cookie!');

			// No uploaded files?  Just use previous cookie value or an ultra-low default (for no user cookies)
			avg = cookie_value !== 'na' ? cookie_value : 10.0;
		}

	// Otherwise, we can only update bandwidth estimates for new cookie value
	} else if (cookie_value === 'na' && navigator.cookieEnabled) {

		msos.console.debug(temp_sb + 'use current loading data!');

		for (i = 0; i < ajx_ldg.length; i += 1) {
			sum += parseInt(ajx_ldg[i], 10);
		}

		// No div by 0, or use ultra-low default for no info
		avg = ajx_ldg.length ? (sum / ajx_ldg.length) : 10.0;

	} else {

		msos.console.debug(temp_sb + 'use previous cookie or default!');

		avg = cookie_value !== 'na' ? cookie_value : 10.0;	// ultra-low default (for no user cookies)
	}

	// Reset site user cookie info (Kbps)
    cfg.cookie.site_bdwd.value = parseInt(avg, 10);
	cfg.cookie.site_bdwd.set = true;

	msos.console.debug(temp_sb + 'done, bandwidth: ' + parseInt(avg, 10));
};

msos.connection = function() {
	"use strict";

	var temp_con = 'msos.connection -> ',
		con_nav = navigator.connection || { type: 0, bandwidth: 0, metered: false },
		con_cfg = msos.config.connection,
		con_type = 'na',
		con_bwidth = 0,
		between = function (val, low, high) {
            return low < high ? val >= low && val <= high : val >= high && this <= low;
        };

	if (msos.config.verbose) {
		msos.console.debug(temp_con + 'start, nav. input: ', con_nav);
	}

	if (!msos.config.cookie.site_bdwd.set) {
		msos.console.warn(temp_con + 'calc\'d bandwidth not available yet!');
	}

	if (con_nav.bandwidth && !msos.var_is_empty(con_nav.bandwidth)) {
		con_bwidth = con_nav.bandwidth;
	} else {
		con_bwidth = msos.config.cookie.site_bdwd.value || 10;	// default min. is 10kbps
	}

	if (con_nav.type === 1)									{ con_type = 'fast'; }
	if (con_nav.type === 2)									{ con_type = 'fast'; }
	if (/wifi|ethernet/i.test(con_nav.type))				{ con_type = 'fast'; }
	if (con_nav.type === 3 || /2g$/i.test(con_nav.type))	{ con_type = '2g'; }
	if (con_nav.type === 4 || /3g$/i.test(con_nav.type))	{ con_type = '3g'; }
	if (/4g$/i.test(con_nav.type))							{ con_type = '4g'; }

	// On a relative scale (not actual kbps - ref. see msos.ajax_request)
	if (con_type === 'na') {
		con_type = between(con_bwidth, 1, 50)
					? "slow"
					: between(con_bwidth, 51, 150)				// actual is approx. 100-150kbps
						? "2g"
						: between(con_bwidth, 151, 600)			// actual is approx. 600-1400kbps
							? "3g"
							: between(con_bwidth, 601, 1000)	// actual is approx. 3000-6000kbps 
								? "4g"
								: "fast";
	}

	// Record our findings
	con_cfg.type = con_type;
	con_cfg.bandwidth = con_bwidth;
	con_cfg.metered = con_nav.metered ? true : false;

	if (msos.config.verbose) {
		msos.console.debug(temp_con + 'done, output: ', con_cfg);
	}
};

msos.set_window_onchange = function () {
	"use strict";

	var temp_sw = 'msos.set_window_onchange -> ';

	msos.console.debug(temp_sw + 'start.');

	// Bind onresize function
	if (msos.onresize_functions.length > 0) {
		jQuery(window).on('resize', _.throttle(msos.run_onresize, 200));
	}

	// Bind onorientationchange function (always run on change)
	if (msos.config.orientation
	 && msos.config.orientation_change) {
		jQuery(window).on('orientationchange', _.debounce(msos.run_onorientationchange, 300, true));
	}

	msos.console.debug(temp_sw + 'done!');
};

msos.run_intial = function () {
	"use strict";

	var run_in = 'msos.run_intial -> ',
		cfg = msos.config,
		req = msos.require;

	msos.console.debug(run_in + 'start.');

	// Set our broswer environment, now that page dom is loaded
	msos.body = window.document.body || window.document.getElementsByTagName("body")[0];
	msos.head = msos.get_head(window);
	msos.html = window.document.getElementsByTagName('html')[0];
	msos.docl = document.compatMode === "BackCompat" ? window.document.body : window.document.documentElement;

	msos.browser_direction();

	// Add event debugging functions
    if (cfg.visualevent)	{ req("msos.visualevent"); }

    // If a mobile (touch) operating system
    if (cfg.mobile)			{ req("msos.mobile"); }

    // Add auto window.onerror alerting
    if (cfg.run_onerror)	{ req("msos.onerror"); }

	// Add debugging output (popup)
	if (cfg.debug_output)	{ req("msos.debug"); }

	// Add MSOS console output
	if (cfg.console)		{ req("msos.pyromane"); }

	msos.console.debug(run_in + 'done!');
};

msos.run_final = function () {
	"use strict";

	var temp_rf = 'msos.run_final';

	msos.console.debug(temp_rf + ' -> start.');

	// Run any "post" msos.run_onload functions
	msos.run_function_array('onload_func_post');

	msos.set_locale_cookie();

	// Output some timing info when requested
	if (msos.debug) { msos.debug.timing(); }

	msos.console.debug(temp_rf + ' -> done!');

	// Last function, report debugging output
	if (msos.pyromane) { setTimeout(msos.pyromane.run, 500); }

	msos.run_onload_incr += 1;
};


// *******************************************
// MSOS Main Code Logic Control Function
// *******************************************

msos.run_onload_incr = 1;
msos.run_onload = function () {
    "use strict";

    var run_txt = 'msos.run_onload (' + msos.run_onload_incr + ') =====> ',
		cfg = msos.config,
		delay = 100,
		to_secs = delay / 1000,
		report_stop,
		cc = cfg.cookie;

	/*
		JavaScript is all about timing. This funtion allows precise timing of software
		execution in layers. Important because it allows us to load modules based on user
		preferences, browser settings and page html in cascading order of readiness.
	*/

	// Page is loaded, so lets get some setup started (but only once)
    if (msos.require_attempts === 0) {

		msos.console.time('run_onload');

		if (cfg.verbose) {
			msos.console.debug(run_txt + 'start.', cfg);
		} else {
			msos.console.debug(run_txt + 'start.');
		}

		// Run "preload" functions
		msos.run_function_array('onload_func_pre');

		setTimeout(msos.run_onload, delay);
		msos.require_attempts += 1;
		return;
    }

	// All 'require' files are loaded, so create i18n objects if requested (but only once)
	if (msos.require_queue === 0 && msos.i18n && !msos.i18n.done) {

		msos.i18n.module_add();
		msos.i18n.done = true;

		setTimeout(msos.run_onload, delay);
		msos.require_attempts += 1;
		return;
	}

	// All 'require' and 'i18n' files are loaded, so set cookie and get bandwidth
	if (msos.require_queue === 0 && msos.i18n_queue === 0 && !cc.site_bdwd.set) {

		// Calculate bandwidth
		// Note: also sets new cookie
		msos.set_bandwidth();
		msos.connection();

		// Set onresize, onorientationchange
		msos.set_window_onchange();

		// Set/Reset site user cookie
		msos.cookie(
			cc.site_pref.name,
			cc.site_pref.value,
			cc.site_pref.params
		);
		cc.site_pref.set = true;

		// Set/Reset site user cookie
		msos.cookie(
			cc.site_bdwd.name,
			cc.site_bdwd.value,
			cc.site_bdwd.params
		);

		setTimeout(msos.run_onload, delay);
		msos.require_attempts += 1;
		return;
	}

	// All 'require' and 'i18n' files are loaded, so run module defined setup (but only once)
    if (msos.require_queue === 0 && msos.i18n_queue === 0 && msos.onload_func_start.length > 0) {

		// Run "start" functions
		msos.run_function_array('onload_func_start');

		setTimeout(msos.run_onload, delay);
		msos.require_attempts += 1;
		return;
    }

	if (msos.require_queue === 0 && msos.i18n_queue === 0) {

		// All required modules loaded, so run cached page level/user interface functions
		msos.run_function_array('onload_functions');

		// All normal cached functions have run, so run cleanup/end functions
		msos.run_function_array('onload_func_done');

		if (cfg.verbose) {
			msos.console.debug(
				run_txt + 'done, modules and templates: ',
				msos.registered_modules,
				msos.registered_templates
			);
		} else {
			msos.console.debug(run_txt + 'done!');
		}

		// Reset flags
		msos.require_attempts = 0;
		if (msos.i18n) { msos.i18n.done = false; }

		msos.console.timeEnd('run_onload');

		// Add slight delay, then finish up.
		setTimeout(msos.run_final, delay);

    } else {

		if (_.indexOf([10, 20, 40, 80, 100, 100], msos.require_attempts) !== -1) {
			msos.console.warn(run_txt + 'waited: ' + (msos.require_attempts * to_secs) + ' secs.');
		} else if (msos.require_attempts > 100) {
			report_stop = function () {
				msos.console.error(run_txt + 'failed, module queue: ' + msos.require_queue + ', i18n queue: ' + msos.i18n_queue);
				msos.notify.warning(jQuery('title').text(), 'Page Timed Out');
				msos.check_resources();
			};
			// Let any 'thrown errors' settle, then report script stop
			setTimeout(report_stop, 400);
			return;
		}
		setTimeout(msos.run_onload, delay);
		msos.require_attempts += 1;
    }
};


// *******************************************
// Start main MobileSiteOS functions
// *******************************************

jQuery(document).ready(msos.check_deferred_scripts);


// *******************************************
// Acknowledge and record
// *******************************************

msos.registered_modules.msos = true;

msos.console.info('msos/core -> done!');
msos.console.timeEnd('core');
