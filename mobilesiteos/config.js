// Copyright Notice:
//					config.js
//			Copyright©2012-2014 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile - MobileSiteOS demo pages (base) configuration file
*/

/*global
	msos: false,
    _gaq: true,
    ___gcfg: true,
    addthis_config: true
*/

msos.console.info('config -> start, (/mobilesiteos/config.js file).');
msos.console.time('config');

// Set specific flags for this configuration:
msos.config.run_ads = true;
msos.config.run_size = true;
msos.config.run_analytics = true;
//msos.config.run_onerror = true;
msos.config.run_social = true;
//msos.config.run_translate = true;


// --------------------------
// Stylesheets to load (CSS injection)
// --------------------------

if (msos.config.debug_css) {
	
	msos.deferred_css = [
		msos.resource_url('css', 'normalize.css'),
		msos.resource_url('css', 'fawe.css'),
		msos.resource_url('css', 'msos.css'),
		msos.resource_url('css', 'msos_bs.css'),
		msos.resource_url('css', 'msos_theme.css')
	];

} else {

	msos.deferred_css = [
		msos.resource_url('css', 'bundle.min.css')
	];

}


// --------------------------
// Scripts to 'defer' load (script injection)
// --------------------------

if (msos.config.debug_script) {

	// Debug full scripts (line no's mean something)
    msos.deferred_scripts = [
		msos.resource_url('modernizr', 'v283.uc.js'),		// no class selectors - see build.txt note in /htdocs/modernizr
		msos.resource_url('jquery', 'v211.uc.js'),
		msos.resource_url('jquery', 'ui/v1104.uc.js'),		// All UI Core + Draggable Interaction + Effects Core
		msos.resource_url('underscore', 'v170.uc.js'),
		msos.resource_url('hammer', 'v203.uc.js'),			// jQuery.hammer.js version of Hammer.js
		msos.resource_url('backbone', 'v112.uc.js'),
		msos.resource_url('','site.js'),					// Common installation specific setup code (which needs jQuery, underscore.js, etc.)
		msos.resource_url('msos', 'core.uc.js')
	];

} else {

	// Standard site provided (including ext. bundles) scripts
    msos.deferred_scripts = [
		msos.resource_url('msos', 'bundle.min.js'),			// Modernizr, jQuery, jQuery-UI, Hammer.js, Underscore, Backbone bundled together
		msos.resource_url('','site.js'),
		msos.resource_url('msos', 'core.min.js')
	];
}


// --------------------------
// Google Related Globals
// --------------------------

// Replace with your site specific Google and other variables
var _gaq = [],
    ___gcfg = {},
	addthis_config = {							// AddThis (addthis.com) configuration object
		username: 'MobileSiteOS',
		data_ga_property: 'UA-24170958-1',
		ui_language: msos.default_locale,
		ui_click: true
	};

// AddThis Social Sharing
msos.config.addthis_pubid = 'ra-515ca32f73d2b2ae';

// Google Analytics
_gaq.push(['_setAccount', 'UA-24170958-1']);
_gaq.push(['_trackPageview']);
// Ref. 'msos.site.google_analytics' in site.uc.js -> site.min.js
msos.config.google.analytics_domain = 'opensitemobile.com';

// Add your Google Web Page Translator Widget ID here.
msos.config.google.translate_id = '7aa52b36fcd8fcb6-07fbdbdc6a976e62-g7261f6c2de6e277c-d';
msos.config.google.no_translate = {
	by_id: ['#rotate_marquee', '#header', '#footer', '#pyromane', '#locale', '#culture', '#calendar'],
	by_class: [],
	by_tag: ['code', 'u']
};
msos.config.google.hide_tooltip = {
	by_id: [],
	by_class: []
};

// Social website API access keys
msos.config.social = {
	google: '526338426431.apps.googleusercontent.com',
	facebook: '583738878406494',
	windows: '000000004C107945',
	instagram: '34e2fb9bd305446cb080d852597584e9',
	cloudmade: 'efca0172cf084708a66a6d48ae1046dd',
	foursquare: 'SFYWHRQ1LTUJEQWYQMHOCXYWNFNS0MKUCAGANTHLFUGJX02E'
};


msos.css_loader(msos.deferred_css);
msos.script_loader(msos.deferred_scripts);

msos.console.info('config -> done!');
msos.console.timeEnd('config');