/*
 * https://github.com/alicelieutier/smoothScroll/
 * A teeny tiny, standard compliant, smooth scroll script with ease-in-out effect and no jQuery (or any other dependancy, FWIW).
 * MIT License
 */

// Highly modified version for MobileSiteOS

msos.provide("ng.util.smoothscroll");

ng.util.smoothscroll.version = new msos.set_version(14, 9, 30);


ng.util.smoothscroll.fn = function (el_id, duration, callback) {
    "use strict";

    var temp_us = 'ng.util.smoothscroll.fn -> ',
        getTop = function (element) {
            if (element.nodeName === 'HTML') {
                return -window.pageYOffset;
            }
            return element.getBoundingClientRect().top + window.pageYOffset;
        },
        easeInOutCubic = function (t) {
            return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
        },
        position = function (start, end, elapsed, duration) {
            if (elapsed > duration) { return end; }
            return start + (end - start) * easeInOutCubic(elapsed / duration);
        },
        start = window.pageYOffset,
        scroll_to_el = null,
        end,
        clock = Date.now(),
        requestAnimationFrame,
        step;

    // No smoothscroll on IE9 and below.
    if (document.querySelectorAll === void 0
     || window.pageYOffset === void 0
     || history.pushState === void 0) {

        msos.console.warn(temp_us + 'not available in this browser!');

    } else {

        msos.console.debug(temp_us + 'start, for id: ' + el_id);

        duration = duration || 500;

        scroll_to_el = document.getElementById(el_id);

        if (scroll_to_el) {

            end = getTop(document.getElementById(el_id));

            requestAnimationFrame =
                window.requestAnimationFrame
             || window.mozRequestAnimationFrame
             || window.webkitRequestAnimationFrame
             || function (fn) { window.setTimeout(fn, 15); };

            step = function () {
                var elapsed = Date.now() - clock;
                window.scroll(0, position(start, end, elapsed, duration));
                if (elapsed > duration) {
                    if (typeof callback === 'function') {
                        callback(el);
                    }
                } else {
                    requestAnimationFrame(step);
                }
            };

            // Initiate
            step();

        } else {
            msos.console.warn(temp_us + 'scroll to element na.');
        }

        msos.console.debug(temp_us + 'done!');
    }
};
