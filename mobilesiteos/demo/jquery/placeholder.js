// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.placeholder");
msos.require("jquery.ui.placeholder");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: placeholder.html loaded!');

        jQuery('input[placeholder], textarea[placeholder]').placeholder();
    }
);