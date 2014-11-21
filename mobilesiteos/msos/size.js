// Copyright Notice:
//				    size.js
//			Copyright©2012-2014 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile MobileSiteOS page size selection code
//

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.size");
msos.require("msos.common");
msos.require("msos.i18n.common");   // required in msos.common too, but here to ref. dependency

msos.size.version = new msos.set_version(14, 6, 23);


msos.size.set_display = function () {
	"use strict";

	var temp_rd = 'msos.size.set_display -> ',
		loader_obj = new msos.loader(),
		run_on_display_change = function () {
			var j = 0,
				odc = msos.ondisplay_size_change;

			for (j = 0; j < odc.length; j += 1) { odc[j](); }
		};

	msos.console.debug(temp_rd + 'start.');

	loader_obj.toggle_css = msos.config.size_array.slice(0);

	// Largest -> smallest display
	loader_obj.toggle_css.reverse();

	loader_obj.add_resource_onload.push(function () { setTimeout(run_on_display_change, 150); });

	// Load sizing stylesheet
    loader_obj.load(msos.config.size, msos.resource_url('css', 'size/' + msos.config.size + '.css'));

	msos.console.debug(temp_rd + 'done: ' + msos.config.size);
};

// This code is very similar to the 'msos.demo' module
msos.size.selection = function ($container) {
    "use strict";

    var select_display_sizes = {},
        size = '';

    if (!msos.common.valid_jq_node($container, 'select')) { return; }

    // Build display size select input object
    for (size in msos.config.size_wide) {
        select_display_sizes[size] = (msos.i18n.common.bundle[size] || size) + ': ' + msos.config.size_wide[size] + 'px';
    }

    // Generate display size menu
    msos.common.gen_select_menu($container, select_display_sizes, msos.config.size);

    $container.change(
        function () {

            var cc = msos.config.cookie;

            msos.config.query.size = jQuery.trim(this.value);

            // Get the new display size
            msos.get_display_size();

            // Reset site user cookie for new size
            msos.cookie(
                cc.site_pref.name,
                cc.site_pref.value,
                cc.site_pref.params
            );

            if (msos.config.run_ads) {
                // Reload page (so Google AdSense sizes correctly)
                window.location.reload(false);
            } else {
                // OR make sure body is hidden, then run display change
                jQuery('#body').fadeOut(
                    'fast',
                    function () {
                        // Set display size (w/ proper css)
                        msos.size.set_display();
                        jQuery('#body').fadeIn('slow');
                    }
                );
            }
        }
    );
};

// Run immediately
msos.size.set_display();

// Run on orientation change
msos.onorientationchange_functions.push(msos.size.set_display);