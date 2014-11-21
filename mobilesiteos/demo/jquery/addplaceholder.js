// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.addplaceholder");
msos.require("jquery.ui.addplaceholder");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: placeholder_add.html loaded!');

        $('.test').addPlaceholder();
    }
);