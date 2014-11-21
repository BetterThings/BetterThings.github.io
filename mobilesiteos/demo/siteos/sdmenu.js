// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

var myMenu;

msos.provide("demo.siteos.sdmenu");
msos.require("msos.sdmenu");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: sdmenu.html loaded!');

        myMenu = new msos.sdmenu.generate("my_menu");

        myMenu.init();
    }
);