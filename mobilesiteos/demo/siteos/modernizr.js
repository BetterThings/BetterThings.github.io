// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("demo.siteos.modernizr");

msos.config.google.no_translate.by_id.push('#modernizr_textarea');


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: modernizr.html loaded!');

        var text = JSON.stringify(Modernizr, null, '\t');

        // Fill our textarea with Modernizr's data
        jQuery('#modernizr_textarea').val(text);
    }
);