// Copyright Notice:
//				detect.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile site initialization and browser sniffing functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.site.detect");
msos.require("msos.common");
msos.require("msos.detection");

msos.site.detect.version = new msos.set_version(13, 6, 14);


// --------------------------
// Initialize Browser Parameters
// --------------------------

msos.site.detect.browser = function () {
    "use strict";

    var font_vals = {
        'xl': '',
        'lg': '',
        'md': '',
        'sm': '',
        'xs': '',
        'xx': ''
    },
        temp_txt = 'msos.site.detect.browser -> ',
        get_character_width = null,
        font_size = {},
        nav_obj = {},
        browser = {},
        size = '',
        param = '',
        skip = false;

    msos.console.debug(temp_txt + 'started.');

    get_character_width = function (el_id) {
        var output = 0,
            element = msos.byid(el_id),
            text = element.innerHTML;

        if (typeof element.clip !== "undefined") {
            output = element.clip.width || 0;
        }
        else {
            if (element.style.pixelWidth) {
                output = element.style.pixelWidth || 0;
            }
            else {
                output = element.offsetWidth || 0;
            }
        }
        output = msos.common.round(output / text.length, 0);

        if (output < 5) output = 5; // practical limit is 5px per character
        return output;
    };

    for (size in font_vals) {
        font_vals[size] = get_character_width(size);
    }

    font_size.font_vals = font_vals;

    for (param in navigator) {
        skip = false;
        if (param === 'mimeTypes') {
            skip = true;
        } // Skip these
        if (param === 'plugins') {
            skip = true;
        }
        if (param === 'geolocation') {
            skip = true;
        }
        if (typeof (navigator[param]) === 'function') {
            skip = true;
        }
        if (!skip) {
            nav_obj[param] = navigator[param];
        }
    }

    // Aggregate all our available user inputs
    browser.config = msos.config;
    browser.modernizr = Modernizr;
    browser.font_size = font_size;
    browser.navigator = nav_obj;
    browser.screen = window.screen;
    browser.plugins = msos.detection.plugins;

    msos.console.debug(temp_txt + 'done!');
    return browser;
};