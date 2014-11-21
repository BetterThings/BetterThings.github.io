// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.settings");
msos.require("msos.size");
msos.require("msos.i18n");
msos.require("msos.intl");


msos.onload_functions.push(
	function () {
        "use strict";

		msos.console.info('Content: settings.html loaded!');

        // Add display size selection to page
        msos.size.selection(
			jQuery('select#change_size')
		);

        // For msos.i18n
        msos.i18n.set_select(
            jQuery('select#locale')
        );

        // For msos.intl
        msos.intl.set_selects(
            jQuery('select#culture'),
            jQuery('select#calendar'),
			jQuery('select#keyboard')
        );
	}
);