// Copyright Notice:
//				    facebook.js
//			Copyright©2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile Facebook functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.social.facebook");

msos.social.facebook.version = new msos.set_version(13, 6, 14);


msos.social.facebook.like = function () {
    "use strict";

    var url = 'http://connect.facebook.net/en_US/all.js#xfbml=1',
		fb_data = {};

    // Change FB display based on size of page
    if (msos.config.size === 'phone'
     || msos.config.size === 'tablet') {
        fb_data = {
            'data-href' : msos.base_site_url,
            'data-action' : 'like',
            'data-send' : 'false',
            'data-layout' : 'button_count',
            'data-width' : '90',
            'data-show-faces' : 'false',
            'data-colorscheme' : 'light',
            'data-font' : 'arial'
	    };
    } else {
        fb_data = {
            'data-href' : msos.base_site_url,
            'data-action' : 'like',
            'data-send' : 'false',
            'data-layout' : 'button_count',
            'data-width' : '160',
            'data-show-faces' : 'false',
            'data-colorscheme' : 'light',
            'data-font' : 'arial'
	    };
      }

    if (jQuery('.fb-like').length) {
		jQuery('.fb-like').attr(fb_data);

		// Use our loader for better debugging
		msos.site.loader.load('facebook-jssdk', url, 'js');
    }
};

msos.site.social_html =
	'<div class="row">' +
		'<div class="span3">' +
			'<div class="g-plusone"></div>' +	// Google rewrites the g-plusone div
		'</div>' +
		'<div class="span3 fb-like"></div>' +
		'<div class="span3 twitter-like">' +
			'<a class="twitter-share-button" href="https://twitter.com/share">Tweet</a>' +
		'</div>' +
	'</div>' +
    '<script>' +
		'msos.site.google_plusone();' +
		'msos.site.facebook_like();' +
		'msos.site.twitter_like();' +
    '</script>';