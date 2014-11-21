// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.scrollbar");
msos.require("jquery.touch.scrollbar");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: scrollbar.html loaded!');

        jQuery('#Default').perfectScrollbar();
    }

);