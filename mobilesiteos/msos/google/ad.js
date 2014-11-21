// Copyright Notice:
//				    ad.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'Google' functions w/jQuery integration

/*global
    msos: false,
    jQuery: false,
    adsbygoogle: true
*/

msos.provide("msos.google.ad");

msos.google.ad.version = new msos.set_version(14, 6, 6);


// Set Google AdSense variable immediately
(adsbygoogle = window.adsbygoogle || []).push({});

// --------------------------
// Google AdSense Display
// --------------------------

msos.google.ad.delay = 4000;
msos.google.ad.run = function () {
    "use strict";

    var ad_txt = 'msos.google.ad.run',
        google_script = null,
        google_check = null;

    if (!msos.config.run_ads) {
        msos.console.warn(ad_txt + ' -> called, but run_ads = false!');
        return;
    }

    msos.console.debug(ad_txt + ' -> start.');

    google_script = new msos.loader();
    google_script.load(
        'adsbygoogle_js',
        '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        'js'
    );

    google_check = function () {
        var temp_gc = ' - google_check -> ',
            g_iframe = jQuery('#google_ad > iframe');

        // If script didn't load...
        if (!window.google_unique_id) {
            msos.console.warn(ad_txt + temp_gc + 'missing AdSense script!');
            return;
        } else if (!jQuery('#google_ad > ins').length && !g_iframe.length) {
            msos.console.warn(ad_txt + temp_gc + 'ad not loaded!');
            return;
        } else {

            // Run when ready (probably is, but in case of very slow ad response)
            jQuery(g_iframe).ready(
                function () {
                    jQuery('#slogan').fadeOut(
    
                    function () {
                        jQuery('#marquee').fadeOut(
    
                        function () {
                            jQuery('#google_ad').css('opacity', 1.0);
                        });
                    });

                    msos.console.debug(ad_txt + temp_gc + 'ad is viewable, delay: ' + msos.google.ad.delay);
                }
            );
        }
    };

    // Show the ad after delay (ins and iframe elements have been injected into DOM)
    setTimeout(google_check, msos.google.ad.delay);

    msos.console.debug(ad_txt + ' -> done!');
};


// Run this at end of page load and other scripting
msos.onload_func_done.push(msos.google.ad.run);