// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.slider");
msos.require("jquery.ui.slider");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: slider.html loaded!');

        jQuery("#slider").slider();
    }
);