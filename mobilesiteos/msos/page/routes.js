// Copyright Notice:
//				  page/routes.js
//			Copyright©2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// Backbone.js "Page" app routes

/*global
    msos: false,
    jQuery: false,
    Backbone: false
*/

msos.provide("msos.page.routes");
msos.require("msos.page");	// Already called, but here for ref.

msos.page.routes.version = new msos.set_version(14, 4, 4);


msos.page.routes.Router = Backbone.Router.extend({

    br_name: 'msos.page.routes.Router - ',

    initialize: function (options) {
		"use strict";

        msos.console.debug(this.br_name + 'initialize -> called.');

		// Define App level events
		this.vent = options.vent;
    },

	routes: {
		'':						"home",
		'page/:name':			"page",
		'*nomatch':				"error"
	},

	home: function () {
		"use strict";

		this.page(msos.page.home);
	},

	page: function (name_page_js) {
		"use strict";

		var pw = msos.page,
			trac = pw.track,
			lang = pw.i18n.page,
			comm = pw.i18n.common,
			name_array = [],
			base_array = [],
			name_lngth = 0;

		msos.console.debug(this.br_name + 'page -> start, page: ' + name_page_js);

		// Only allow a-z, A-Z, 0-9, period, dash in content js reference name
		if (!/^[0-9a-zA-Z.-]+$/.test(name_page_js)) {

			msos.console.error(this.br_name + 'page -> invalid name: ' + name_page_js);

			// Set to the defined "home" page
			name_page_js = msos.page.home;
		}

		name_array = name_page_js.split(".");
		name_lngth = name_array.length;

		if (name_lngth > 2) {
			base_array = name_array.slice(0, -2);

			trac.base =  base_array.join('.');
			trac.group = name_array[name_lngth - 2];
			trac.name =  name_array[name_lngth - 1];
		} else {
			trac.base = '';
			trac.group = name_array[0];
			trac.name = name_array[1];
		}

		// If not yet defined, get to it.
		if (!pw.available[trac.group]) { this.vent.trigger('update_avail'); }

		// Now check for valid page content
		if (pw.available[trac.group] && pw.available[trac.group].indexOf('#/page/' + name_page_js) === -1) {

			// Alert user to page problem
			msos.notify.error(lang.sorry + ' ' + lang.invalid_page + ' ' + name_page_js, lang.page_error);

			msos.console.warn(this.br_name + 'page -> bad name: ' + name_page_js);

			this.error(name_page_js);
		} else {

			// Reset to load "base page" (with specified content) from scratch
			if (pw.reset) {

				Backbone.history.navigate('#/page/' + name_page_js);
				window.location.reload();

			} else {

				// Start Loading indicator
				pw.loading = msos.notify.loading(jQuery('title').text(), comm.loading);

				// If using "mobile console", hide it now.
				if (msos.pyromane) { msos.pyromane.hide(); }

				// FadeOut the main div (for aesthetics)
				jQuery('#body').fadeOut('fast');

				// Detect any modules which might be needed
				msos.onload_func_pre.push(msos.page.auto_detect);

				// Push function to so show page and hide Loading indicator
				// (run early, so elements in content will be available for sizing, etc.)
				msos.onload_func_pre.push(
					function () {
						jQuery('#body').fadeIn('slow', pw.loading.fade_out);
						jQuery('#content').fadeIn(1500);
					}
				);

				// Build the template module name
				name_array.splice(name_lngth - 1, 0, msos.page.config.template);

				msos.require(name_page_js, function () { pw.template(name_array.join('.')); });
			}
		}

		msos.console.debug(this.br_name + 'page -> done, track:', trac);
	},

	error: function (nomatch) {
		"use strict";

		var lang = msos.page.i18n.page,
			name_array = [],
			avail_array = [],
			i = 0,
			best = 0,
			prev = 0,
			next = 0,
			info_txt = '';

		msos.console.debug(this.br_name + 'error -> start for: ' + nomatch);

		name_array = nomatch.split('.');
		nomatch = '#/page/' + nomatch;		// Update to how we grab content anchors

		while (name_array[i]) {
			if (msos.page.available[name_array[i]]) {
				avail_array = msos.page.available[name_array[i]];
			}
			i += 1;
		}

		if (avail_array.length) {
			for (i = 0; i < avail_array.length; i += 1) {
				next = msos.site.likeness(avail_array[i], nomatch);
				if (next > prev) {
					best = i;
					prev = next;
				}
			}

			// Re-route to "best guess"
			this.navigate(avail_array[best], { trigger: true });

			msos.notify.info(lang.page_guess, lang.page_redirect);

			info_txt = this.br_name + 'error -> done, match score: ' + prev;

			if (prev > 0)	{ msos.console.debug(info_txt + ', use guess: ' + avail_array[best]); }
			else			{ msos.console.error(info_txt); }

		} else {

			// Re-route to "home"
			this.navigate('', { trigger: true });

			msos.console.debug(this.br_name + 'error -> done!');
		}
	}
});