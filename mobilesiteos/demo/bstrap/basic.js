// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.bstrap.basic");
msos.require("bootstrap.blockquote");
msos.require("bootstrap.media");
msos.require("bootstrap.listgroup");
msos.require("bootstrap.inputgroup");



msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: basic.html loaded!');

    }
);