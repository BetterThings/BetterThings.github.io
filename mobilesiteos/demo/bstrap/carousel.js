// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.bstrap.carousel");
msos.require("bootstrap.carousel");


msos.onload_functions.push(
    function () {
        "use strict";

        var carousel_ex = jQuery('#carousel-example-generic');

        msos.console.info('Content: carousel.html loaded!');

        // Carousel demo with touch swipe gestures
        carousel_ex.carousel();
        carousel_ex.hammer().on(
            'swipeleft',
            function () { jQuery(this).carousel('next'); }
        );
        carousel_ex.hammer().on(
            'swiperight',
            function () { jQuery(this).carousel('prev'); }
        );
    }
);