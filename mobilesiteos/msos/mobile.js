// Copyright Notice:
//					mobile.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile mobile specific functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.mobile");
msos.require("jquery.ui.touch");

msos.mobile.version = new msos.set_version(13, 12, 3);

if (navigator.platform.match(/iPad|iPhone|iPod/i)) {
	msos.require("msos.mbp.ios");
}

if (!Modernizr.overflowscrolling || msos.config.run_overflowscroll) {
	msos.config.run_overflowscroll = true;	// Update for msos.demo output
    msos.require("msos.overflowscroll");
}


// --------------------------
// Basic mobile functions
// --------------------------

msos.mobile.onclick = function (event) {
    "use strict";

    var evt_target = event.target,
        click_href = jQuery(evt_target).attr('href') || '',
        win_target = jQuery(evt_target).attr('target') || '',
		delay = 100;

	// Not an external link...just let it go
	if (!click_href || click_href.match(/^.*#/)) { return true; }

    msos.do_nothing(event);

	if (msos.config.verbose) {
		msos.console.debug('msos.mobile.onclick -> href: ' + click_href);
		delay = 2000;
	}

	// Blank out page -> to ease transition and give indication
	jQuery('#body').fadeOut('slow');
	jQuery('#google_ad').css('display', 'none');	// Kill Google ad

    // Delay for visual effect
    setTimeout(
		function () {
			if (win_target) {
				window.open(click_href, win_target);
			}
			else {
				window.location.href = click_href;
			}
		},
		delay
	);

	return false;
};

msos.mobile.onsubmit = function (event) {
    "use strict";

    msos.do_abs_nothing(event);

    // Blank out page -> to ease transition and give indication
	jQuery('#body').fadeOut('slow');
	jQuery('#google_ad').css('display', 'none');	// Kill Google ad

    // Delay for visual effect
    setTimeout(
		function () {
			event.target.submit();
		},
		100
	);
};

msos.mobile.initialize = function () {
    "use strict";

    var temp_lat = 'msos.mobile.initialize -> ';

    msos.console.debug(temp_lat + 'start.');

    jQuery(document).on('submit', 'form',	msos.mobile.onsubmit);
	jQuery(document).on('click',  'a',		msos.mobile.onclick);

    msos.console.debug(temp_lat + 'done!');
};


// Initialize our mobile environment
msos.onload_func_done.push(msos.mobile.initialize);