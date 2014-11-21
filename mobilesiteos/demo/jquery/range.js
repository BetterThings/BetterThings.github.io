// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.range");
msos.require("jquery.tools.range");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: range.html loaded!');

        jQuery('#range_input').rangeinput();
    }
);