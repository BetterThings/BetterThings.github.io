// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.bstrap");
msos.require("msos.sdmenu");


msos.onload_functions.push(
    function () {
        "use strict";

        var menu_obj;

        msos.console.info('Content: bstrap.html loaded!');

        menu_obj = new msos.sdmenu.generate("bootstrap_index");

        menu_obj.init();
        menu_obj.add_menu_translate_icons();
    }
);