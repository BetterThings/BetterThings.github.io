// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.table");
msos.require("jquery.footable.core");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: table.html loaded!');

        jQuery('table.footable').footable();
    }
);