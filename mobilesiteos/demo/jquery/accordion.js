// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.accordion");
msos.require("jquery.ui.accordion");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: accordion.html loaded!');

        jQuery("#accordion").accordion({
            heightStyle: "content"
        });

    }
);