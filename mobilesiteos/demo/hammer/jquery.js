// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.hammer.jquery");


msos.onload_functions.push(
    function () {
        "use strict";

        var temp_hj = 'Content: jquery.html',
            hammertime = jQuery(".toucharea").hammer();

        msos.console.info(temp_hj + ' loaded!');

        if (msos.config.verbose) {
            msos.console.debug(temp_hj + ' -> hammer object: ', hammertime);
        }

        // the whole area
        hammertime.on(
            "touch",
            function (ev) {
                if (msos.config.verbose) {
                    msos.console.debug(temp_hj + ' -> touch event object: ', ev);
                }
                jQuery(this).highlight();
            }
        );

        // on elements in the toucharea, with a stopPropagation
        hammertime.on(
            "touch",
            "li",
            function (ev) {
                if (msos.config.verbose) {
                    msos.console.debug(temp_hj + ' -> touch nested event object: ', ev);
                }
                jQuery(this).highlight();
                ev.stopPropagation();
            }
        );

        // on dynamic items
        jQuery("#add-list-item").on(
            "touch",
            function (ev) {
                jQuery("#items").append("<li class='btn'>Dynamic Added</li>");
                ev.gesture.preventDefault();
                ev.stopPropagation();
            }
        );

        jQuery.fn.highlight = function(options) {
            options = jQuery.extend(
                {},
                {
                    className: 'btn-success',
                    delay: 100
                },
                options
            );

            return this.each(
                function () {
                    (function (elem, cName, time) {
                        setTimeout(
                            function () {
                                elem.removeClass(cName);
                            },
                            time
                        );
                        elem.addClass(cName);
                    }(jQuery(this), options.className, options.delay));
                }
            );
        }
    }
);