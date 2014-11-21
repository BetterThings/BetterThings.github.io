// Copyright Notice:
//				    geolocation.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'navigate.geolocation' functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.geolocation");

msos.geolocation.version = new msos.set_version(13, 6, 14);


msos.geolocation.initialize = function ($latitude, $longitude) {
    "use strict";

    var temp_geo = 'msos.geolocation.initialize',
        watch_id = null,
        clear_id = null,
        set_postion = function (pos) {
             $latitude.val(pos.coords.latitude);
            $longitude.val(pos.coords.longitude);
        },
        nav_error = function (error) {
            if (error.PERMISSION_DENIED) {
                msos.console.warn(temp_geo + ' - nav_error -> requires user permisson:', error);
            } else {
                msos.console.error(temp_geo + ' - nav_error -> error: ', error);
            }
        };

    msos.console.debug(temp_geo + ' -> start.');

    // Add position info if available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(set_postion);

        watch_id = navigator.geolocation.watchPosition(set_postion, nav_error);
        clear_id = function () {
            navigator.geolocation.clearWatch(watch_id);
        };

        // Clear navigator function after 10 sec.
        setTimeout(clear_id, 10000);
    } else {
        msos.console.info(temp_geo + ' -> position info na.');
    }
    msos.console.debug(temp_geo + ' -> done!');
};