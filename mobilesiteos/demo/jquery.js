// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery");
msos.require("msos.sdmenu");


msos.onload_functions.push(
    function () {
        "use strict";

        var menu_obj;

        msos.console.info('Content: jquery.html loaded!');

        menu_obj = new msos.sdmenu.generate("jquery_index");

        menu_obj.init();
        menu_obj.add_menu_translate_icons();
    }
);