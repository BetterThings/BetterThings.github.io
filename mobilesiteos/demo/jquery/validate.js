// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.validate");
msos.require("jquery.tools.validate");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: validate.html loaded!');

        jQuery("#myform").validator();
    }
);