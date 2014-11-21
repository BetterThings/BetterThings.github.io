/*	StickUP.js
 *	"name": "Liran Cohen",
 *	"email": "lirancohen@me.com",
 *	"url": "http://www.github.com/lirancohen/"
 *
 *	Altered and adapted for MobileSiteOS (no menu updating and for multiple stacking sticky elements per page)
 */

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.stickup");

msos.stickup.version = new msos.set_version(14, 2, 17);

msos.stickup.v_postion = jQuery(this).scrollTop();
msos.stickup.on_change = [];
msos.stickup.on_scroll = [];

msos.stickup.update = function () {
	"use strict";

	var i = 0,
		osc = msos.stickup.on_change;

	for (i = 0; i < osc.length; i += 1) { osc[i](); }
};

msos.stickup.run = function () {
	"use strict";

	var i = 0,
		osr = msos.stickup.on_scroll;

	// Don't bother with horizontal scrolling
	if (msos.stickup.v_postion !== jQuery(this).scrollTop()) {

		for (i = 0; i < osr.length; i += 1) { osr[i](); }

		msos.stickup.v_postion = jQuery(this).scrollTop();
	}
};

msos.stickup.create = function (sticky_elm) {
	"use strict";

	var temp_st = 'msos.stickup.create',
		changed = 0,
		on_change = null,
		on_scroll = null,
		elm_width = 0,
		elm_position = 'relative',
		elm_offset = 0,
		elm_z_index = 0,
		topMargin = 0,
		fixed_top = 0,
		varscroll = 0;

	msos.console.debug(temp_st + ' -> start.');

	// Ready?
	if (!sticky_elm.length) {
		msos.console.error(temp_st + ' -> failed, no element!');
		return;
	}

	sticky_elm.addClass('msos_sticky');
	

	on_change = function () {
		msos.console.debug(temp_st + ' - on_change -> called, for: ' + (sticky_elm.attr('id') || 'na'));

		// Flag change of state
		changed = 0;

		// Reset element position (must clear previous values - very important!)
		sticky_elm.css({ position: "relative", top: 0, width: '' });

		elm_position = 'relative';

		// Go to window top
		window.scrollTo(0, 0);
	};

	on_scroll = function () {

		var elm_id = sticky_elm.attr('id') || 'na',
			scroll_top =	parseInt(jQuery(window).scrollTop(), 10),
			win_height =	parseInt(jQuery(window).innerHeight(), 10),
			body_height =	parseInt(jQuery('body').height(), 10);

		if (msos.config.verbose) {
			msos.console.debug(temp_st + ' - on_scroll -> start, for: ' + elm_id);
		}

		// Stop the "page jump" caused by removing sticky element via "position: fixed" at scroll bottom
		if ((win_height + scroll_top) >= body_height) {
			if (msos.config.verbose) {
				msos.console.debug(temp_st + ' - on_scroll -> hit bottom: ' + scroll_top + ', win height: ' + win_height);
			}
			return;
		}

		// Initial setup
		if (changed === 0) {

			fixed_top =		0;
			elm_width =		parseInt(sticky_elm.outerWidth(), 10) || 0;
			topMargin =		parseInt(sticky_elm.css('margin-top'), 10);

			var msos_sticky = jQuery('.msos_sticky'),
				indx = 0;

			// If elm_width === 0, then elm not ready (ref. display: none;)
			if (elm_width > 0) {

				// Get cummlative heights of previous 'sticky' DOM elements
				jQuery.each(
					msos_sticky,
					function (i) {
						indx = msos_sticky.index(sticky_elm);
						if (indx > i) {
							fixed_top += parseInt(jQuery(this).outerHeight(), 10) + topMargin;
						}
					}
				);

				changed = 1;
				msos.console.debug(temp_st + ' - on_scroll -> changed, for: ' + elm_id + ', width: ' + elm_width + ', adjust fixed: ' + fixed_top + ', top: ' + elm_offset);
			}

			return;
		}

		// Update the element offset, when "relative". Catches dom manipulation, image loading changes.
		if (elm_position === 'relative') { elm_offset = parseInt(sticky_elm.offset().top, 10); }

		varscroll = scroll_top + fixed_top;

		if (elm_offset < varscroll + topMargin) {
			if (elm_position !== "fixed") {
				sticky_elm.css({ position: "fixed", top: (fixed_top > 0 ? fixed_top + 'px' : 0), width: elm_width + 'px' });
				elm_position = 'fixed';
			}
		}

		if (varscroll + topMargin < elm_offset) {
			if (elm_position !== "relative") {
				sticky_elm.css({ position: "relative", top: 0, width: elm_width + 'px' });
				elm_position = 'relative';
			}
		}

		if (msos.config.verbose) {
			msos.console.debug(temp_st + ' - on_scroll -> done, for: ' + elm_id + ', width: ' + elm_width);
		}
	};

	// Collect "onchange" functions for updating
	msos.stickup.on_change.push(on_change);

	// Collect "onscroll" functions for group firing
	msos.stickup.on_scroll.push(on_scroll);

	// Decrement z-index so first in are higher (for dropdown menus)
	elm_z_index = 999 - msos.stickup.on_change.length;

	// We set z-index very late because fadeIn/fadeOut cause reset to 'auto'
	setTimeout(function () { sticky_elm.css('z-index', elm_z_index); }, 2000);

	msos.console.debug(temp_st + ' -> done!');
};

jQuery(document).on(
	'scroll',
	_.throttle(msos.stickup.run, 100)
);

msos.ondisplay_size_change.push(msos.stickup.update);	// Absolutely necessary!
msos.ondisplay_size_change.push(msos.stickup.run);		// Should do nothing, in most cases!