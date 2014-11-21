// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.bstrap.pagination");
msos.require("bootstrap.pagination");
msos.require("bootstrap.pager");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: pagination.html loaded!');

    }
);