// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos");
msos.require("msos.sdmenu");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: siteos.html loaded!');

		// Generate our paging menu
		// ------------------------
        var menu_obj = new msos.sdmenu.generate("msos_index");

        menu_obj.init();
        menu_obj.add_menu_translate_icons();

		// Add our function to fire on orientation change
		msos.onorientationchange_functions.push(msos.site.update_size_menu);
	}
);