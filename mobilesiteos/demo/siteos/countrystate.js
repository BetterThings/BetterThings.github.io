// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.countrystate");
msos.require("msos.countrystate");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: countrystate.html loaded!');

        msos.countrystate.initialize(jQuery('#country'), jQuery('#state'));
    }
);