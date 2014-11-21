// Copyright Notice:
//				  page.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// Backbone "Page" application wrapper (load and show inserted html snippet pages)

/*global
    msos: false,
    jQuery: false,
    _: false,
    Backbone: false
*/

msos.provide("msos.page");
msos.require("msos.page.routes");
msos.require("msos.page.views");
msos.require("msos.i18n.common");
msos.require("msos.i18n.page");


// Base "msos.page" object
msos.page = _.extend(
	msos.page, {
		available: {},
		BBApp: {},
		config: {},
		divider: '<span class="divider">::</span>',
		home: '',
		menu: '',
		i18n: {},
		loading: null,
		reset: false,
		track: {
			base: '',
			group: '',
			name: ''
		},
		version: new msos.set_version(14, 3, 27),
		visualevent: null
	}
);

msos.page.auto_detect = function () {
    "use strict";

	var temp_ad = 'msos.page.auto_detect -> ',
		modules = [],
		i = 0;

	msos.console.debug(temp_ad + 'start.');

	// Commonly used Bootstrap adapted modules
	if (jQuery('.table').length)					{ modules.push("bootstrap.table"); }
	if (jQuery('[data-toggle="dropdown"]').length) 	{ modules.push("bootstrap.dropdown"); }
	if (jQuery('[data-toggle="collapse"]').length) 	{ modules.push("bootstrap.collapse"); }

	// Require our additional modules (based on page dom)
	for (i = 0; i < modules.length; i += 1) { msos.require(modules[i]); }

    msos.console.debug(temp_ad + 'done, modules: ', modules);
};

msos.page.template = function (tmpl_name) {
	"use strict";

	var app_ctnt = msos.page.BBApp.content;

	msos.console.debug('msos.page.template -> called for: ' + tmpl_name);

	// Pass our #content render function into msos.template
	msos.template(tmpl_name, _.bind(app_ctnt.render, app_ctnt));
};

msos.page.next_prev = function (cnt) {
	"use strict";

	var temp_np = 'msos.page.next_prev -> ',
		pw = msos.page,
		avail_array = pw.available[pw.track.group],
		curr_route = '#/' + (Backbone.history.fragment || 'page/' + pw.home),	// When fragment = '', go home
		calc_index = 0;

	// Valid input?
	if (cnt !== 1 && cnt !== -1) {
		msos.console.error(temp_np + 'only 1 or -1.');
		return;
	}

	msos.console.debug(temp_np + 'start, adjust: ' + curr_route + ', by: ' +  cnt);

	calc_index = avail_array.indexOf(curr_route);

	if (calc_index === -1) {
		msos.console.warn(temp_np + 'no index for: ' + curr_route);
	} else {
		calc_index += cnt;		// Add in our next/prev movement
	}

	calc_index = calc_index < 0
		? (avail_array.length - 1)				// go to other end of array
		: calc_index > (avail_array.length - 1)
			? 0									// go to beginning of array
			: calc_index;

	// Navigate to the correct next/prev page
	pw.BBApp.router.navigate(avail_array[calc_index], { trigger: true });

	msos.console.debug(temp_np + 'done, route: ' + avail_array[calc_index] + ', for index: ' + calc_index);
};

msos.page.initiate = function (app_cfg) {
	"use strict";

	msos.page.config = app_cfg;

	var temp_wi = 'msos.page.initiate -> ',
		cfg = msos.config,
		pw = msos.page,
		root = pw.config.root;

	// Make our language strings available
	pw.i18n = {
		common:	msos.i18n.common.bundle,
		page:	msos.i18n.page.bundle
	};

	// Set the "home" content page as defined in config.js
	pw.home = (root.base ? root.base + '.' : '') + root.group + '.' + root.name;

	// Add Page App debugging
	if (cfg.query.debug_page) {
		cfg.debugging.push('debug_page');
		cfg.debug = true;
	}

	msos.console.debug(temp_wi + 'start, home: ' + pw.home);

    if (!cfg.browser.current) {
		msos.notify.warning(pw.i18n.page.sorry + ' ' + pw.i18n.page.bad_browser, pw.i18n.page.site_notice);
		return;
	}

	// Add App level events
	pw.BBApp.vent = _.extend({}, Backbone.Events);

	// Start with our routings...
	pw.BBApp.router =  new msos.page.routes.Router({ vent: pw.BBApp.vent });

	// Add our views
	pw.BBApp.header =  new msos.page.views.BBViewHeader({  vent: pw.BBApp.vent });
	pw.BBApp.content = new msos.page.views.BBViewContent({ vent: pw.BBApp.vent });
	pw.BBApp.footer =  new msos.page.views.BBViewFooter({  vent: pw.BBApp.vent });

	Backbone.history.start();

	msos.console.debug(temp_wi + 'done, for: ' + msos.page.home);
};
