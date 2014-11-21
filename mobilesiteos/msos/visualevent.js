// Copyright Notice:
//				    visualevent.js
//			Copyright©2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile VisualEvent loader script

/*global
    msos: false,
    jQuery: false,
    VisualEvent: false
*/

msos.provide("msos.visualevent");
msos.require("syntaxhighlighter.brushes.jscript");
msos.require("bootstrap.table");

msos.visualevent.version = new msos.set_version(13, 11, 6);

msos.config.google.no_translate.by_id.push(['#Event_Display', '#Event_Lightbox', '#Event_Label']);

msos.visualevent.loader = function () {
	"use strict";

	var temp_vl = 'msos.visualevent.loader -> ',
        ve_load_obj = new msos.loader(),
		ve_uri = 'v2.min.js';

    msos.console.debug(temp_vl + 'start.');

	if (msos.config.debug_script) { ve_uri = 'v2.uc.js'; }

	// Load the CSS
	ve_load_obj.load('visualevent_css',	msos.resource_url('css', 'visualevent.css'),	'css');

	// Load the script
	ve_load_obj.load('visualevent_js',	msos.resource_url('visualevent', ve_uri),		'js');

    msos.console.debug(temp_vl + 'done!');
};

// Load VisualEvent late (to ensure SyntaxHighLighter and XRegExp var's are ready)
msos.onload_func_post.push(msos.visualevent.loader);