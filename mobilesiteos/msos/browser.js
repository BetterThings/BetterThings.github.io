// Copyright Notice:
//				    browser.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile browser profiling functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.browser");

msos.browser.version = new msos.set_version(13, 11, 23);


msos.browser.is = (function () {
    "use strict";

    var temp_bi = 'msos.browser.is -> ',
		mode,
		n = navigator,
		dua = n.userAgent,
		dav = n.appVersion,
		tv = parseFloat(dav),
		index = 0,
		dua_lc = dua.toLowerCase(),
		d = document,
        browser_is = {
            mobile: {
                iPhone:			/(iPhone|iPod)/.test(dua),
                iPad:			/iPad/.test(dua),
                BlackBerry:		/BlackBerry/.test(dua),
                Android:		/Android/.test(dua),
                Android_old:	/Android 2\.[12]/.test(dua),
                IEMobile:		/(IEMobile|Windows CE)/.test(dua),
                NetFront:		/NetFront/.test(dua),
                PlayStation:	/(PlayStation|PLAYSTATION)/.test(dua),
                Nintendo:		/Nintendo/.test(dua),
                Symbian:		/Symbian/.test(dua),
                MIDP:			/MIDP/.test(dua)
            }
        };

    // Typical client?
    browser_is.Browser = (window !== undefined) ? true : false;
	browser_is.group = /*@cc_on!@*/1 + /(?:Gecko|AppleWebKit)\/(\S*)/.test(dua);	// 0 - IE, 1 - O, 2 - GK/WK

    if (dua.indexOf("Opera") >= 0)		{ browser_is.Opera = tv; }
    if (dua.indexOf("AdobeAIR") >= 0)	{ browser_is.AIR = 1; }
	if (/Gecko\//.test(dua))			{ browser_is.Gecko = 1; }
    browser_is.Khtml = (dav.indexOf("Konqueror") >= 0) ? tv : 0;
    browser_is.WebKit = parseFloat(dua.split("WebKit/")[1]) || false;
    browser_is.Chrome = parseFloat(dua.split("Chrome/")[1]) || false;
    browser_is.Mac = dav.indexOf("Macintosh") >= 0;
	browser_is.OSx105 = dua_lc.match(/mac os x 10_5/) ? true : false;
	browser_is.oldWebKit = (document.documentElement.webkitAppearance !== undefined ? true : false)
                        && (document.createElement('script').async !== undefined ? false : true);

    index = Math.max(dav.indexOf("WebKit"), dav.indexOf("Safari"), 0);
    if (index && !browser_is.Chrome) {
		browser_is.Safari = parseFloat(dav.split("Version/")[1]);
		if (!browser_is.Safari || parseFloat(dav.substr(index + 7)) <= 419.3) {
			browser_is.Safari = 2;
		}
    }

    if (dua.indexOf("Gecko") >= 0 && !browser_is.Khtml && !browser_is.WebKit) { browser_is.Mozilla = browser_is.Moz = tv; }
    if (browser_is.Moz) {
		browser_is.FF = parseFloat(dua.split("Firefox/")[1] || dua.split("Minefield/")[1]) || undefined;
    }

    if (document.all && !browser_is.Opera) {
		browser_is.IE = parseFloat(dav.split("MSIE ")[1]) || undefined;
		mode = document.documentMode;
		if (mode && mode !== 5 && Math.floor(browser_is.IE) !== mode) {
			browser_is.IE = mode;
		}
    }

    browser_is.Quirks = document.compatMode === "BackCompat";
    browser_is.WebOS = (window.palmGetResource || window.PalmServiceBridge);

    if (msos.config.verbose) {
        msos.console.debug(temp_bi + 'browser profile:', browser_is);
    }
    return browser_is;
}());

msos.browser.set_selectors = function () {
    "use strict";

    // Add browser specific class selectors to the pages 'html' node
    var selectors = [],
        browser_is = msos.browser.is,
		is_key,
		is_mkey;

    for (is_key in browser_is) {
		if (browser_is[is_key] && is_key !== 'mobile') {
			selectors.push(is_key);
			if (typeof browser_is[is_key] !== 'boolean') {
				selectors.push(is_key + browser_is[is_key]);
			}
		}
    }

    for (is_mkey in browser_is.mobile) {
		if (browser_is.mobile[is_mkey]) {
			selectors.push(is_mkey);
		}
    }

    jQuery('html').addClass(selectors.join(' '));
    msos.console.debug('msos.browser.set_selectors -> added: ' + selectors.join(' '));
};