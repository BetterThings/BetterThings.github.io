// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.packery.fluid");
msos.require("jquery.tools.packery");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: fluid.html loaded!');

        var container = document.querySelector('#container'),
            pckry = new Packery(
                container,
                {
                    itemSelector: ".item",
                    columnWidth: ".grid-sizer",
                    gutter: ".gutter-sizer"
                }
            );

    }
);