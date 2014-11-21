/**
 * MBP - Mobile boilerplate helper functions
 *
 * Modified slightly for MobileSiteOS
 */

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.mbp.ios");

msos.mbp.ios.version = new msos.set_version(13, 12, 3);


(function (document) {
    "use strict";

    /**
     * Fix for iPhone viewport scale bug
     * http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/
     */

    msos.mbp.ios.viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]');
    msos.mbp.ios.ua = navigator.userAgent;

    msos.mbp.ios.gestureStart = function () {
        msos.mbp.ios.viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
    };

    msos.mbp.ios.scaleFix = function () {
        if (msos.mbp.ios.viewportmeta && /iPhone|iPad|iPod/.test(msos.mbp.ios.ua) && !/Opera Mini/.test(msos.mbp.ios.ua)) {
            msos.mbp.ios.viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
            document.addEventListener('gesturestart', msos.mbp.ios.gestureStart, false);
        }
    };

	/**
     * Prevent iOS from zooming onfocus
     * https://github.com/h5bp/mobile-boilerplate/pull/108
     * Adapted from original jQuery code here: http://nerd.vasilis.nl/prevent-ios-from-zooming-onfocus/
     */

    msos.mbp.ios.preventZoom = function () {
        if (msos.mbp.ios.viewportmeta && navigator.platform.match(/iPad|iPhone|iPod/i)) {
            var contentString = 'width=device-width,initial-scale=1,maximum-scale=';

			jQuery(document).on(
				'focus',
				'input select textarea',
				function () {
					msos.mbp.ios.viewportmeta.content = contentString + '1';
				}
			);
            jQuery(document).on(
				'blur',
				'input select textarea',
				function () {
					msos.mbp.ios.viewportmeta.content = contentString + '10';
				}
            );
        }
    };

    /**
     * iOS Startup Image helper
     */

    msos.mbp.ios.startupImage = function () {
        var portrait,
            landscape,
            pixelRatio,
            head,
            link1,
            link2;

        pixelRatio = window.devicePixelRatio;
        head = document.getElementsByTagName('head')[0];

        if (navigator.platform === 'iPad') {
            portrait = pixelRatio === 2 ?  msos.resource_url('images', 'startup/startup-tablet-portrait-retina.png') :  msos.resource_url('images', 'startup/startup-tablet-portrait.png');
            landscape = pixelRatio === 2 ? msos.resource_url('images', 'startup/startup-tablet-landscape-retina.png') : msos.resource_url('images', 'startup/startup-tablet-landscape.png');

            link1 = document.createElement('link');
            link1.setAttribute('rel', 'apple-touch-startup-image');
            link1.setAttribute('media', 'screen and (orientation: portrait)');
            link1.setAttribute('href', portrait);
            head.appendChild(link1);

            link2 = document.createElement('link');
            link2.setAttribute('rel', 'apple-touch-startup-image');
            link2.setAttribute('media', 'screen and (orientation: landscape)');
            link2.setAttribute('href', landscape);
            head.appendChild(link2);
        } else {
            portrait = pixelRatio === 2 ? msos.resource_url('images', 'startup/startup-retina.png') : msos.resource_url('images', 'startup/startup.png');

            link1 = document.createElement('link');
            link1.setAttribute('rel', 'apple-touch-startup-image');
            link1.setAttribute('href', portrait);
            head.appendChild(link1);
        }
    };

}(document));


/*! A fix for the iOS orientationchange zoom bug.
 Script by @scottjehl, rebound by @wilto.
 MIT License.
*/
(function (w) {
	"use strict";

	// This fix addresses an iOS bug, so return early if the UA claims it's something else.
	var ua = navigator.userAgent,
		doc = w.document;

	if (!(/iPhone|iPad|iPod/.test(navigator.platform) && /OS [1-5]_[0-9_]* like Mac OS X/i.test(ua) && ua.indexOf("AppleWebKit") !== -1)) {
		return;
	}

    if (!doc.querySelector) { return; }

    var meta = doc.querySelector("meta[name=viewport]"),
        initialContent = meta && meta.getAttribute("content"),
        disabledZoom = initialContent + ",maximum-scale=1",
        enabledZoom =  initialContent + ",maximum-scale=10",
        enabled = true,
		x, y, z, aig;

    if (!meta) { return; }

    function restoreZoom() {
        meta.setAttribute("content", enabledZoom);
        enabled = true;
    }

    function disableZoom() {
        meta.setAttribute("content", disabledZoom);
        enabled = false;
    }

    function checkTilt(e) {
		aig = e.accelerationIncludingGravity;
		x = Math.abs(aig.x);
		y = Math.abs(aig.y);
		z = Math.abs(aig.z);

		// If portrait orientation and in one of the danger zones
        if ((!w.orientation || w.orientation === 180) && (x > 7 || ((z > 6 && y < 8 || z < 8 && y > 6) && x > 5))) {
			if (enabled) { disableZoom(); }
        } else if (!enabled) {
			restoreZoom();
		}
    }

	w.addEventListener("orientationchange",	restoreZoom,	false);
	w.addEventListener("devicemotion",		checkTilt,		false);

}(this));


// Add these late (no hurry)
msos.onload_func_done.push(msos.mbp.ios.startupImage);
msos.onload_func_done.push(msos.mbp.ios.preventZoom);
msos.onload_func_done.push(msos.mbp.ios.scaleFix);
