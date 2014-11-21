// Copyright Notice:
//				    translate.js
//			Copyright©2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile integration of Google Web Translate Widget

/*global
    msos: false,
    jQuery: false,
    _: false,
    google: false,
    _gaq: false
*/

msos.provide("msos.google.translate");

msos.google.translate.version = new msos.set_version(13, 12, 3);


msos.google.translate.count = 0;
msos.google.translate.interval = undefined;
msos.google.translate.meta = jQuery('<meta name="google" content="notranslate" />');

// Stop Chrome browser toolbar translate (since we will use translate widget)
jQuery('head > meta').last().after(msos.google.translate.meta);

// Std. Google callback w/size specific instructions
function googleTranslateElementInit() {
	"use strict";

	var msos_layout = google.translate.TranslateElement.InlineLayout.HORIZONTAL,
		parameters = {
			pageLanguage: msos.default_locale,
			autoDisplay: true,
			multilanguagePage: true		// Widgets have i18n inserted via msos.i18n module and multi-language select menus
		},
		dumby;

	// HORIZONTAL is too wide for 240px or 320px display
	if (msos.config.size === 'phone' || msos.config.size === 'tablet') {
		msos_layout = google.translate.TranslateElement.InlineLayout.VERTICLE;
	}

	if (msos.config.run_analytics) {
		parameters.gaTrack = true;
		parameters.gaId = _gaq[1];
	}

	parameters.layout = msos_layout;

	dumby = new google.translate.TranslateElement(parameters, 'google_translate_element');
}

msos.google.translate.triggerHtmlEvent = function (element, eventName) {
    "use strict";

	var event;

    if (document.createEvent) {
        event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, true, true);
        element.dispatchEvent(event);
    } else {
        event = document.createEventObject();
        event.eventType = eventName;
        element.fireEvent('on' + event.eventType, event);
    }
};

msos.google.translate.bind_tooltip = function () {
	"use strict";

    var temp_tt = 'msos.google.translate.bind_tooltip -> ',
		trans_tt  = jQuery('#goog-gt-tt'),
        hide_tt = msos.config.google.hide_tooltip,
        selector = '',
        tag = '',
        i = 0;

	msos.console.debug(temp_tt + 'start.');

    // Add mouseenter/leave event to hide Google Web Translate tooltips from menus, etc.
    if (trans_tt.length
    && !trans_tt.data('tt_bound')) {
        for (tag in hide_tt) {
			for (i = 0; i < hide_tt[tag].length; i += 1) {
				selector = hide_tt[tag][i];
				// Force hiding of "original text" popup for menus, etc. (very annoying)
				jQuery(selector).bind(
					"mouseenter mouseleave",
					function (event) {
						if (event.type === 'mouseenter')	{ trans_tt.css('z-index', -999); }
						else								{ trans_tt.css('z-index',  999); }
					}
				);
			}
        }
        trans_tt.data('tt_bound', true);

        if (msos.config.verbose) {
            msos.console.debug(temp_tt + 'hide tooltip: ', hide_tt);
        }
    }
	msos.console.debug(temp_tt + 'done!');
};

msos.google.translate.select = function () {
    "use strict";

	// Keep track of how many times
	msos.google.translate.count += 1;

    var temp_ts = 'msos.google.translate.select -> ',
		trans_sel = jQuery('.goog-te-combo'),
		trans_opt = trans_sel.find('option[value="' + msos.config.locale + '"]'),
		trans_ifr = jQuery('iframe.goog-te-banner-frame'),
		trans_cnt = msos.google.translate.count,
		trans_sel_ready = false,
		delay = 1000;


	// Make sure select w/ options is ready 
	if (trans_sel.length
	 && trans_sel.find('option').length >= 65) {
		trans_sel_ready = true;
	}

	// This logic is extremely dependent on Google Web Translate and msos.i18n!
	if			(trans_sel_ready && (trans_sel.val() !== msos.config.locale)) {

		if (trans_opt.length) {
			trans_sel.val(msos.config.locale);
			msos.google.translate.triggerHtmlEvent(trans_sel[0], 'change');

			msos.console.debug(temp_ts + 'triggered: ' + msos.config.locale);
		} else {
			msos.console.warn(temp_ts + 'locale na: ' + msos.config.locale);
		}

		setTimeout(msos.google.translate.select, delay);

    } else if	(trans_sel_ready && !trans_sel.data('i18n_bound')) {

		if (msos.i18n
		 && msos.i18n.on_locale_change) {
			// If msos.i18n is loaded...
			trans_sel.change(_.debounce(msos.i18n.on_locale_change, 200));
			msos.console.debug(temp_ts + 'bound i18n on_locale_change');
		} else {
			// If not, we still need to record i18n change for next page
			trans_sel.change(
				function () {
					msos.config.locale  = trans_sel.val();
					msos.config.culture = trans_sel.val();	// two character code as "best initial guess"
				}
			);
			msos.console.debug(temp_ts + 'bound i18n cookie');
		}

		trans_sel.data('i18n_bound', true);

		setTimeout(msos.google.translate.select, delay);

	} else if	(trans_sel_ready && !trans_sel.data('toggle_bound')) {

		jQuery('#trans_toggle').click(
			function () {
				jQuery('iframe.goog-te-banner-frame').parent().toggle("slow");
			}
		);

		trans_sel.data('toggle_bound', true);

		msos.console.debug(temp_ts + 'bound toggle');

		setTimeout(msos.google.translate.select, delay);

	} else if	(!trans_sel_ready && !trans_ifr.length) {

        setTimeout(msos.google.translate.select, delay);

		msos.console.debug(temp_ts + 'not ready: ' + trans_cnt);

    } else if	(trans_ifr.length && trans_cnt < 40) {

		jQuery('body').removeAttr('style');	// position: relative; causes problems
		jQuery('#trans_toggle').show();

		// Sometimes with a slow connection, the first hide() doesn't work
		setTimeout(
			function () {
				jQuery('iframe.goog-te-banner-frame').parent().hide();
				setTimeout(
					function () {
						jQuery('iframe.goog-te-banner-frame').parent().hide();
					},
					250
				);
			},
			250
		);

		// Reset anything positioned w/ window resize event (ref. Adsense ad)
		msos.run_onresize();

        msos.console.debug(temp_ts + 'done, sec: ' + (trans_cnt * delay / 1E3));
    } else {
		msos.console.warn(temp_ts + 'failed to load, sec: ' + (trans_cnt * delay / 1E3));
	}
};

msos.google.translate.install = function () {
	"use strict";

	var temp_gti = 'msos.google.translate.install',
		no_trans = msos.config.google.no_translate,
		tag = '',
		i = 0,
		selector = '',
		trans_onload = null;

	msos.console.debug(temp_gti + ' -> start.');

	jQuery('head').append('<meta name="google-translate-customization" content="' + msos.config.google.translate_id + '"></meta>');
	jQuery('body').append(
		'<div id="google_toggle_button">' +
			'<button id="trans_toggle" class="btn-medium icon-dashboard" title="Toggle Google translate console"></button>' +
		'</div>' +
		'<div id="google_translate_element"></div>'
	);

	// Add 'notranslate' class to nodes and node classes we know we want to skip
	for (tag in no_trans) {
		for (i = 0; i < no_trans[tag].length; i += 1) {
			selector = no_trans[tag][i];
			jQuery(selector).addClass('notranslate');
		}
	}

	if (msos.config.verbose) {
		msos.console.debug(temp_gti + ' -> no translate: ', no_trans);
	}

	trans_onload = function () {
		msos.console.debug(temp_gti + ' - trans_onload -> loaded!');

		// Now undo trick to stop stupid Chrome translate toolbar
		msos.google.translate.meta.remove();

		// wait for script, then start poling...
		setTimeout(
			function () {
				msos.google.translate.select();
			},
			1000
		);
	};

	// Just 'http://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit' reduced
	(function () {

		// New loader object
		var load_script = new msos.loader(),
			load_css = new msos.loader();

		document.readyState = 'complete';

		var constr = msos.gen_namespace('google.translate._const'),
			h = 'translate.googleapis.com',
			b = (window.location.protocol == 'https:' ? 'https://' : 'http://') + h;

		constr._cl =    'en';
		constr._cuc =   'googleTranslateElementInit';
		constr._cac =   '';
		constr._cam =   '';
		constr._pah =   h;
		constr._pbi =   b + '/translate_static/img/te_bk.gif';
		constr._pci =   b + '/translate_static/img/te_ctrl3.gif';
		constr._phf =   h + '/translate_static/js/element/hrs.swf';
		constr._pli =   b + '/translate_static/img/loading.gif';
		constr._plla =  h + '/translate_a/l';
		constr._pmi =   b + '/translate_static/img/mini_google.png';
		constr._ps =    b + '/translate_static/css/translateelement.css';
		constr._puh =   'translate.google.com';

		// Using our loader means we can debug
		load_css.load('translateelement_css', constr._ps, 'css');

		load_script.add_resource_onload.push(trans_onload);
		load_script.load('element_main_js', b + '/translate_static/js/element/main.js', 'js');

	}());

	msos.console.debug(temp_gti + ' -> done!');
};

msos.google.translate.update = function (in_val) {
    "use strict";

	// This function ties the Google Web Translate API in with a "locale select" menu.
	// See where "msos.i18n.set_select_onchange" is used for language selection.

	// Reset count
	msos.google.translate.count = 0;

	var temp_tu = 'msos.google.translate.update -> ',
		google_elm = jQuery('.goog-te-combo'),
		con_type = msos.config.connection.type;

	msos.console.debug(temp_tu + 'start.');

	if (google_elm.length && google_elm.val() === in_val) {
		msos.console.debug(temp_tu + 'done, no update needed.');
		return;
	}

	// Skip altogether for slow internet connections
	if (con_type === 'slow' || con_type === '2g') {
		msos.console.warn(temp_tu + 'done, skip for slow connection!');
		return;
	}

	// Don't auto-run for user's w/ browser default eq to set default 
	if (msos.config.locale === msos.default_locale
	 || msos.config.locale.substr(0, 2) === msos.default_locale) {

		msos.console.debug(temp_tu + 'done, skipped for: ' + msos.config.locale);
		return;
	}

	if (!jQuery('#google_translate_element').length) {
		msos.console.debug(temp_tu + 'run install.');
		// Not installed yet...
		msos.google.translate.install();
	} else {
		msos.console.debug(temp_tu + 'run update.');
		jQuery('#trans_toggle').hide();
		msos.google.translate.select();
	}

	msos.console.debug(temp_tu + 'done!');
};


// Run this as late as possible (so page elements are fully ready for translating)
msos.onload_func_post.push(msos.google.translate.update);