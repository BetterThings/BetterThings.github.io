// Copyright Notice:
//				    onerror.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'window.onerror' tracking function

/*global
    msos: false,
    jQuery: false,
*/

msos.provide("msos.onerror");
msos.require("msos.i18n.common");

msos.onerror.version = new msos.set_version(13, 12, 3);


msos.onerror.generate = function () {
    "use strict";

    var settings = {
            url: msos.config.onerror_uri,
            website: document.domain
        },
        on_success = function (data, status, xhr) {
            msos.console.info('msos.onerror.generate -> sent, status: ' + status);
        };

    window.onerror = function (msg, url, line) {

        msos.console.error('window.onerror -> fired, line: ' + line + ', url: ' + url + ', error: ' + msg);

        jQuery.ajax({
            type: "GET",
            cache: false,
            url: settings.url,
            data: jQuery.param({
                'message': msg,
                'url': url,
                'userAgent': navigator.userAgent,
                'line': line,
                'website': settings.website
            }),
            success: on_success,
            error: msos.ajax_error
        });
	
		msos.notify.error(msg, msos.i18n.common.bundle.error);

        if (window.opener
         && window.opener.msos) {
            window.opener.msos.console.error('child window.onerror -> ' + window.name + ': ' + msg);
        }

        return true;
    };
};

// Add 'onerror' auto reporting after script loading, but before
// browser interaction. We just want to report browser/user problems.
msos.onload_func_start.push(msos.onerror.generate);