// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.bstrap.button");
msos.require("bootstrap.button");
msos.require("bootstrap.navigation");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Page: button.html loaded!');

        // Button state demo
        jQuery('#fat-btn').click(
            function () {
                var btn = $(this);
                btn.button('loading');
                setTimeout(
                    function () {
                        btn.button('reset')
                    },
                    3000
                );
            }
        );
    }
);