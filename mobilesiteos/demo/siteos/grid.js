// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.grid");
msos.require("msos.size");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: grid.html loaded!');

        // Add display size selection to page
        msos.size.selection(jQuery('select#change_size'));
    }
);