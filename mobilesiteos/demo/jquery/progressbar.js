// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.progressbar");
msos.require("jquery.ui.progressbar");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: progressbar.html loaded!');

		var pbar = jQuery("#progressbar"),
			count = 0,
			action = function () {
                count += 1;
                pbar.progressbar({ value: count });
                if (count < 100) {
                    setTimeout(action, 50);
                }
            };

		setTimeout(action, 100);
    }
);