// Copyright Notice:
//				  page/views.js
//			Copyright©2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// Backbone.js "Page" app views

/*global
    msos: false,
    jQuery: false,
    _: false,
    Backbone: false
*/

msos.provide("msos.page.views");
msos.require("msos.page");
msos.require("msos.stickup");

msos.page.views.version = new msos.set_version(14, 3, 26);


// Helper functions
msos.page.views.swipe_next_prev = function (e) {
	"use strict";

	var self = this,
		temp_snp = 'swipe_next_prev -> ',
		dir = 0;

	msos.console.debug(self.bv_name + temp_snp + 'start.');

	if		(e.gesture.direction === 'right')	{ dir = -1; }
	else if (e.gesture.direction === 'left')	{ dir =  1; }

	if (dir !== 0) { msos.page.next_prev(dir); }

	msos.console.debug(self.bv_name + temp_snp + 'done, for: ' + dir);
};

msos.page.views.get_menu_avail = function () {
	"use strict";

	var self = this,
		temp_ma = 'get_menu_avail -> ',
		pw = msos.page,
		pwa = pw.available,
		pwt = pw.track,
		$group_lis = self.$el.find('ul > li.' + pwt.group) || [],
		avail_array = [];

	msos.console.debug(self.bv_name + temp_ma + 'start, for: ' + pwt.group);

	if ($group_lis.length) {

		$group_lis.find('a.btn').each(
			function () { avail_array.push(jQuery(this).attr('href')); }
		);
		$group_lis.find('ul.dropdown-menu > li > a').each(
			function () { avail_array.push(jQuery(this).attr('href')); }
		);

		// Store determined available routings (_.union seems to add 'undefined', so _.compact)
		pwa[pwt.group] = _.compact(_.union(pwa[pwt.group], avail_array));
	}

	msos.console.debug(self.bv_name + temp_ma + 'done!');
};

// Define our Page App Views
msos.page.views.BBViewHeader = Backbone.View.extend({

    bv_name: 'msos.page.views.BBViewHeader - ',

    el: '#header',

	events: {
		"swipe": "swipe_next_prev"
	},

    initialize: function (options) {
		"use strict";

		var self = this;

        msos.console.debug(this.bv_name + 'initialize -> called.');

		self.render();

		// Add 'divider' html to #header navbar breadcrumbs
		self.$el.find('ul.breadcrumb > li').each(
			function (idx) {
				if (idx === 0) { return; }	// Skip 1st one
				jQuery(this).prepend(msos.page.divider);
			}
		);

		// Add fixed navigation onscroll
		msos.stickup.create(self.$el);

		// Define App level events
		self.vent = options.vent;

		self.vent.bind('update_avail',	_.bind(msos.page.views.get_menu_avail, self));
    },

	swipe_next_prev: msos.page.views.swipe_next_prev,

    render: function () {
		"use strict";

		var template_fn = null,
			header = '';

        msos.console.debug(this.bv_name + 'render -> called.');

		template_fn = _.template(msos.page.config.header.text);
		header = template_fn(msos.page);

        this.$el.html(header);
		this.$el.hammer();

        return this;
	}
});

msos.page.views.BBViewContent = Backbone.View.extend({

    bv_name: 'msos.page.views.BBViewContent - ',

    el: '#content',

	cached_template: {},
	cached_onload: {},

    initialize: function (options) {
		"use strict";

        msos.console.debug(this.bv_name + 'initialize -> called.');

		// Define App level events
		this.vent = options.vent;
    },

	set_menu_active: function () {
		"use strict";

		var self = this,
			temp_ma = 'set_menu_active -> ',
			pwt = msos.page.track,
			$nav = jQuery('#header, #footer'),
			$group_lis = $nav.find('ul.menus > li.' + pwt.group) || [],
			new_active = (pwt.base ? pwt.base + '.' : '') + pwt.group + '.' + pwt.name,
			$active = [],
			$previ_lis = $nav.find('ul.menus > li' + (msos.page.menu ? '.' + msos.page.menu : ''));

		msos.console.debug(self.bv_name + temp_ma + 'start, for group: ' + pwt.group + ', previous: ' + msos.page.menu);

		// Remove current breadcrumb crumb (if any)
		$nav.find('ul.breadcrumb > li.crumb').empty();

		// Remove any active class from view DOM
		$nav.find('.active').removeClass('active');

		// Now find the current active content "page" in our menus
		$active = $group_lis.find('a.btn[href$="' + new_active + '"]');
		$active.addClass('active');

		// Did the menu group change?
		if (msos.page.menu !== pwt.group) {
			if ($previ_lis.length) { $previ_lis.css('display', 'none');  }
			if ($group_lis.length) { $group_lis.css('display', 'inline-block'); }
		}

		// Now, update the navbar breadcumb display
		if ($active.length && $active.text()) {
			$nav.find('ul.breadcrumb > li.crumb').html(msos.page.divider + $active.text());
		}

		$active = $group_lis.find('ul.dropdown-menu > li > a[href$="' + new_active + '"]');
		$active.parent().addClass('active');
		$active.closest('li.dropdown').addClass('active');

		if ($active.length && $active.text()) {
			$nav.find('ul.breadcrumb > li.crumb').html(msos.page.divider + $active.text());
		}

		// Always show the "home" group
		$nav.find('ul.breadcrumb > li.' + msos.page.config.root.group).css('display', 'block');
		$nav.find('ul.breadcrumb > li.crumb').css('display', 'block');

		// Update current menu group
		msos.page.menu = pwt.group;

		// Update any special case buttons, etc.
		if (msos.config.visualevent) {
			jQuery('#footer > ul.menus > li.visualevent').css('display', 'block');
		}

		msos.console.debug(self.bv_name + temp_ma + 'done!');
	},

    render: function (msos_tmpl_obj) {
		"use strict";

        var self = this,
            name = msos_tmpl_obj.name || '';

        msos.console.debug(this.bv_name + 'render -> called, for: ' + name);

		self.$el.hide();

        if (!self.cached_template[name]) {
            self.cached_template[name] = _.template(msos_tmpl_obj.text);
			self.cached_onload[name] = msos.onload_functions.slice(0) || [];
        } else if (self.cached_onload[name].length) {
			msos.onload_functions = self.cached_onload[name];
		}

		// Add the input (or cached) html to the page
        self.$el.html(self.cached_template[name](msos.page));

		// Update the #header and #footer
		self.set_menu_active();

		// Update all "stickup" elements (but after content loads)
		msos.onload_func_post.push(msos.stickup.update);

        msos.run_onload();

        return this;
	}
});

msos.page.views.BBViewFooter = Backbone.View.extend({

    bv_name: 'msos.page.views.BBViewFooter - ',

    el: '#footer',

	events: {
		"swipe": "swipe_next_prev"
	},

    initialize: function (options) {
		"use strict";

		var self = this,
			pyromane = jQuery('#pyromane_toolbar'),
			visualevent;

        msos.console.debug(this.bv_name + 'initialize -> called.');

		self.render();

		// Add 'divider' html to #footer navbar breadcrumbs
		self.$el.find('ul.breadcrumb > li').each(
			function (idx) {
				if (idx === 0) { return; }	// Skip 1st one
				jQuery(this).prepend(msos.page.divider);
			}
		);

		// Add fixed navigation onscroll
		msos.stickup.create(self.$el);

		// Define App level events
		self.vent = options.vent;

		self.vent.bind('update_avail',	_.bind(msos.page.views.get_menu_avail, self));

		if (msos.config.visualevent) {
			jQuery('#footer > ul.menus > li.visualevent').click(
				function (ev) {
					msos.do_nothing(ev);

					window.scrollTo(0, 1);

					// Need to let window scroll before calling new VisualEvent
					setTimeout(function () { msos.page.visualevent = new VisualEvent(); }, 500);
				}
			);
		}
    },

	swipe_next_prev: msos.page.views.swipe_next_prev,

    render: function () {
		"use strict";

		var template_fn = null,
			footer = '';

        msos.console.debug(this.bv_name + 'render -> called.');

		template_fn = _.template(msos.page.config.footer.text);
		footer = template_fn(msos.page);

        this.$el.html(footer);
		this.$el.hammer();

        return this;
	}
});