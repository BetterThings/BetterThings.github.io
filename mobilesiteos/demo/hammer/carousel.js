// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Hammer: false
*/

msos.provide("demo.hammer.carousel");


/**
 * requestAnimationFrame and cancel polyfill
 */ (function () {
    var lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'],
        x = 0;

    for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id = window.setTimeout(

            function () {
                callback(currTime + timeToCall);
            }, timeToCall);

        lastTime = currTime + timeToCall;
        return id;
    };

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());


// This needs to wait a little longer than "msos.onload_functions"
msos.onload_func_done.push(
function () {
    "use strict";

    var temp_hj = 'Content: carousel.html';

    msos.console.info(temp_hj + ' loaded!');

    /**
     * super simple carousel
     * animation between panes happens with css transitions
     */
    function Carousel(element) {

        element = jQuery(element);

        var self = this,
            container = jQuery(">ul", element),
            panes = jQuery(">ul>li", element),
            pane_width = 0,
            pane_count = panes.length,
            current_pane = 0;

        msos.console.debug(temp_hj + ' - Carousel -> start.');

        /**
         * set the pane dimensions and scale the container
         */
        function setPaneDimensions() {
            pane_width = element.width();
            panes.each(

            function () {
                jQuery(this).width(pane_width);
            });
            container.width(pane_width * pane_count);
        };

        function setContainerOffset(percent, animate) {
            container.removeClass("animate");

            if (animate) {
                container.addClass("animate");
            }

            if (Modernizr.csstransforms3d) {
                container.css("transform", "translate3d(" + percent + "%,0,0) scale3d(1,1,1)");
            } else if (Modernizr.csstransforms) {
                container.css("transform", "translate(" + percent + "%,0)");
            } else {
                var px = ((pane_width * pane_count) / 100) * percent;
                container.css("left", px + "px");
            }
        }

        /**
         * initial
         */
        this.init = function () {

            msos.console.debug(temp_hj + ' - Carousel - init -> called.');

            setPaneDimensions();

            msos.onorientationchange_functions.push(setPaneDimensions);
        };

        /**
         * show pane by index
         * @param   {Number}    index
         */
        this.showPane = function (index) {
            // between the bounds
            index = Math.max(0, Math.min(index, pane_count - 1));
            current_pane = index;

            var offset = -((100 / pane_count) * current_pane);
            setContainerOffset(offset, true);
        };

        this.next = function () {
            return this.showPane(current_pane + 1, true);
        };
        this.prev = function () {
            return this.showPane(current_pane - 1, true);
        };

        function handleHammer(ev) {

            if (msos.config.verbose) {
                msos.console.debug(temp_hj + ' - Carousel - handleHammer -> event object: ', ev);
            }

            // disable browser scrolling
            ev.gesture.preventDefault();

            switch (ev.type) {
            case 'dragright':
            case 'dragleft':
                // stick to the finger
                var pane_offset = -(100 / pane_count) * current_pane;
                var drag_offset = ((100 / pane_width) * ev.gesture.deltaX) / pane_count;

                // slow down at the first and last pane
                if ((current_pane === 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) || (current_pane == pane_count - 1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
                    drag_offset *= .4;
                }

                setContainerOffset(drag_offset + pane_offset);
                break;

            case 'swipeleft':
                self.next();
                ev.gesture.stopDetect();
                break;

            case 'swiperight':
                self.prev();
                ev.gesture.stopDetect();
                break;

            case 'release':
                // more then 50% moved, navigate
                if (Math.abs(ev.gesture.deltaX) > pane_width / 2) {
                    if (ev.gesture.direction === 'right') {
                        self.prev();
                    } else {
                        self.next();
                    }
                } else {
                    self.showPane(current_pane, true);
                }
                break;
            }
        }

        element.hammer({
            drag_lock_to_axis: true
        }).on("release dragleft dragright swipeleft swiperight", handleHammer);

        msos.console.debug(temp_hj + ' - Carousel -> done!');
    }

    var carousel = new Carousel("#carousel");

    carousel.init();
});